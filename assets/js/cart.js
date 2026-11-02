/* =========================================================
   TRANG GIỎ HÀNG + THANH TOÁN (thanh toán bằng ví MinePay)
   ========================================================= */

const CART_UI = { voucher: null };

document.addEventListener("DOMContentLoaded", initCart);

function initCart() {
  const savedCode = readLS(KEYS.voucher, "");
  if (savedCode) {
    const v = VOUCHERS.find((x) => x.code === String(savedCode).toUpperCase());
    if (v) CART_UI.voucher = v;
  }
  normalizeCart();
  renderCartPage();
  renderCartSuggestions();
  bindCheckoutShell();
}

function normalizeCart() {
  const cart = getCart();
  let changed = false;
  cart.forEach((item) => {
    if (typeof item.sel !== "boolean") {
      item.sel = true;
      changed = true;
    }
  });
  if (changed) saveCart(cart);
}

function computeTotals(cart) {
  const selected = cart.filter((i) => i.sel);
  let subtotal = 0;
  selected.forEach((item) => {
    const p = getProduct(item.id);
    if (!p) return;
    const v = p.variants[item.v] || p.variants[0];
    subtotal += v.price * item.qty;
  });

  let discount = 0;
  /* Toàn bộ mặt hàng là sản phẩm số → không thu phí vận chuyển, mã freeship đã bị bỏ */
  const ship = 0;
  const v = CART_UI.voucher;

  if (v && subtotal >= v.min) {
    if (v.type === "percent") discount = Math.min(Math.round((subtotal * v.value) / 100), v.max || Infinity);
    else if (v.type === "fixed") discount = Math.min(v.value, subtotal);
  }

  const total = Math.max(0, subtotal - discount + ship);
  return { selected, subtotal, discount, ship, total, count: selected.reduce((s, i) => s + i.qty, 0) };
}

/* ------------------- RENDER ------------------- */
function renderCartPage() {
  const root = $("#cart-root");
  const cart = getCart();
  const label = $("#cart-count-label");
  const count = cart.reduce((s, i) => s + i.qty, 0);
  if (label) label.textContent = count ? `(${count} ${t("cart.items")})` : "";
  const pageTitle = $("#cart-title-text");
  if (pageTitle) pageTitle.textContent = t("cart.pageTitle");

  if (!cart.length) {
    root.innerHTML = `
      <div class="cart-empty">
        <div class="big">🛒</div>
        <h3>${t("cart.empty")}</h3>
        <p>${t("cart.emptyDesc")}</p>
        <a class="btn btn-primary btn-lg" href="index.html">${t("cart.explore")}</a>
      </div>`;
    return;
  }

  const rows = cart
    .map((item) => {
      const p = getProduct(item.id);
      if (!p) return "";
      const v = p.variants[item.v] || p.variants[0];
      return `
      <div class="cart-row" data-key="${item.id}::${item.v}">
        <div class="cb">
          <input class="row-check" type="checkbox" data-key="${item.id}::${item.v}" ${item.sel ? "checked" : ""}
            aria-label="${t("cart.select")} ${escapeHtml(p.name)}">
        </div>
        <div class="cart-prod">
          <a href="product.html?id=${p.id}"><img src="${p.thumb}" alt="${escapeHtml(p.name)}" loading="lazy"></a>
          <div class="cp-body">
            <a class="cp-name" href="product.html?id=${p.id}">${escapeHtml(p.name)}</a>
            <span class="cp-var">${t("cart.variant")}: ${escapeHtml(v.name)}</span>
            <span style="font-size:11px;color:#26aa99">${t("cart.autodeliver")}</span>
          </div>
        </div>
        <div class="cart-price">${money(v.price)}${v.oldPrice > v.price ? `<del>${money(v.oldPrice)}</del>` : ""}</div>
        <div class="cart-qty">
          <div class="qty-box">
            <button type="button" data-qty="-1" data-key="${item.id}::${item.v}" aria-label="-">−</button>
            <input type="number" value="${item.qty}" min="1" max="99" data-qty-input="${item.id}::${item.v}" aria-label="${t("cart.col.qty")}">
            <button type="button" data-qty="1" data-key="${item.id}::${item.v}" aria-label="+">+</button>
          </div>
        </div>
        <div class="cart-total">${money(v.price * item.qty)}</div>
        <button class="cart-del" type="button" data-del="${item.id}::${item.v}">Xoá</button>
      </div>`;
    })
    .join("");

  const t2 = computeTotals(cart);
  const voucher = CART_UI.voucher;
  const allSelected = cart.length > 0 && cart.every((i) => i.sel);
  const user = currentUser();
  const balance = user ? userWalletAtLogin(user) : null;
  const canPay = balance !== null && balance >= t2.total;

  const balanceBox = user
    ? `<div class="minepay-box ${canPay ? "ok" : "bad"}">
         <div class="mp-row"><span>💎 ${t("cart.balance")}</span><b>${money(balance)}</b></div>
         <div class="mp-row"><span>${t("cart.total")}</span><b>${money(t2.total)}</b></div>
         <div class="mp-status">${canPay ? t("cart.balanceOk") : t("cart.balanceNotEnough", { need: money(t2.total - balance) })}</div>
         ${canPay ? "" : `<button class="btn btn-primary btn-block btn-sm" id="topup-btn" type="button" style="margin-top:8px">💎 ${t("cart.topup")}</button>`}
       </div>`
    : `<div class="minepay-box warn"><div class="mp-status">🔐 ${t("cart.needLogin")}</div></div>`;

  root.innerHTML = `
  <div class="cart-layout">
    <div class="cart-card">
      <div class="cart-head">
        <div class="cb"><input type="checkbox" id="select-all" ${allSelected ? "checked" : ""} aria-label="${t("cart.selectAll")}"></div>
        <div>${t("cart.col.product")}</div>
        <div>${t("cart.col.price")}</div>
        <div>${t("cart.col.qty")}</div>
        <div>${t("cart.col.total")}</div>
        <div></div>
      </div>
      <div id="cart-rows">${rows}</div>
    </div>

    <div class="cart-summary">
      <h3>${t("cart.checkout")}</h3>
      <div class="voucher-input">
        <input id="voucher-code" placeholder="${t("cart.voucherPh")}" value="${voucher ? voucher.code : ""}">
        <button type="button" id="apply-voucher">${voucher ? t("cart.voucherRemove") : t("cart.voucherApply")}</button>
      </div>
      <div id="voucher-msg" style="font-size:11.5px;margin:-6px 0 12px;color:${voucher ? "#26aa99" : "#999"}">
        ${voucher ? `${t("cart.voucherOk")} <b>${voucher.code}</b> — ${voucher.desc}` : t("cart.voucherHint")}
      </div>

      ${balanceBox}

      <div class="sum-row"><span>${t("cart.subtotal")} (<span id="sel-count">${t2.count}</span> ${t("cart.items")})</span><span class="val">${money(t2.subtotal)}</span></div>
      <div class="sum-row"><span>${t("cart.discount")}</span><span class="val" style="color:${t2.discount ? "#26aa99" : "#333"}">${t2.discount ? "-" + money(t2.discount) : t("free.money")}</span></div>
      <div class="sum-row total"><span>${t("cart.total")}</span><span class="val">${money(t2.total)}</span></div>

      <button class="btn btn-primary btn-block btn-lg" id="checkout-btn" type="button" style="margin-top:14px"
        ${t2.selected.length ? "" : "disabled"}>${t("cart.buy")}${t2.selected.length ? ` (${t2.count})` : ""}</button>
      <div class="cart-actions" style="margin-top:10px">
        <a class="btn btn-plain btn-block" href="index.html">${t("cart.continue")}</a>
      </div>
      <p class="check-note">${t("cart.note")}</p>
    </div>
  </div>`;

  bindCartEvents();
}

/* ------------------- SỰ KIỆN GIỎ HÀNG ------------------- */
function bindCartEvents() {
  const root = $("#cart-root");

  root.addEventListener("change", (e) => {
    if (e.target.id === "select-all") {
      const cart = getCart();
      cart.forEach((i) => (i.sel = e.target.checked));
      saveCart(cart);
      renderCartPage();
      return;
    }
    if (e.target.classList.contains("row-check")) {
      const cart = getCart();
      const item = cart.find((i) => cartLineKey(i.id, i.v) === e.target.dataset.key);
      if (item) item.sel = e.target.checked;
      saveCart(cart);
      renderCartPage();
      return;
    }
    if (e.target.matches("[data-qty-input]")) {
      updateItemQty(e.target.dataset.qtyInput, Number(e.target.value), true);
    }
  });

  root.addEventListener("click", (e) => {
    const qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn) {
      const key = qtyBtn.dataset.key;
      const item = getCart().find((i) => cartLineKey(i.id, i.v) === key);
      if (item) updateItemQty(key, item.qty + Number(qtyBtn.dataset.qty));
      return;
    }
    const del = e.target.closest("[data-del]");
    if (del) {
      const key = del.dataset.del;
      const cart = getCart().filter((i) => cartLineKey(i.id, i.v) !== key);
      saveCart(cart);
      toast(t("cart.itemDeleted"));
      renderCartPage();
      return;
    }
    const apply = e.target.closest("#apply-voucher");
    if (apply) {
      if (CART_UI.voucher) {
        CART_UI.voucher = null;
        writeLS(KEYS.voucher, "");
        toast(t("voucher.removed"));
        renderCartPage();
        return;
      }
      const code = ($("#voucher-code").value || "").trim().toUpperCase();
      const v = VOUCHERS.find((x) => x.code === code);
      if (!v) {
        toast(t("voucher.err1"), "error");
        return;
      }
      const t2 = computeTotals(getCart());
      if (t2.subtotal < v.min) {
        toast(t("voucher.err2", { min: money(v.min) }), "error");
        return;
      }
      CART_UI.voucher = v;
      writeLS(KEYS.voucher, v.code);
      toast(t("voucher.applied") + " " + v.code + " 🎉", "success");
      renderCartPage();
      return;
    }
    if (e.target.closest("#topup-btn")) {
      openTopup();
      return;
    }
    if (e.target.closest("#checkout-btn")) {
      const t2 = computeTotals(getCart());
      if (!t2.selected.length) {
        toast("Vui lòng chọn ít nhất 1 sản phẩm", "error");
        return;
      }
      const user = currentUser();
      if (!user) {
        toast(t("cart.needLogin"));
        openAuth("login");
        return;
      }
      /* NHẮC RÚT TIỀN: không đủ tiền → không cho mua */
      const balance = userWalletAtLogin(user);
      if (balance < t2.total) {
        toast(t("cart.balanceNotEnough", { need: money(t2.total - balance) }), "error");
        openCheckout(t2);
        return;
      }
      openCheckout(t2);
    }
  });
}

/* ------------------- MODAL NẠP TIỀN MINEPAY ------------------- */
function openTopup() {
  let wrap = $("#topup-modal");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "modal-mask";
    wrap.id = "topup-modal";
    document.body.appendChild(wrap);
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) closeTopup();
    });
  }
  const user = currentUser();
  if (!user) {
    openAuth("login");
    return;
  }
  wrap.innerHTML = `
    <div class="modal">
      <div class="modal-head">
        <h3>💎 ${t("cart.topup")}</h3>
        <button class="modal-close" type="button" aria-label="Đóng" id="topup-close">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size:13px;color:#666;margin:0 0 12px">
          Số dư hiện tại: <b style="color:var(--primary)">${money(userWalletAtLogin(user))}</b>
          <br>Chọn gói nạp (demo - không giao dịch thật):
        </p>
        <div class="topup-grid">
          ${[100000, 300000, 500000, 1000000].map(
            (amt) => `
            <button class="topup-pack" data-amount="${amt}" type="button">
              <b>${money(amt)}</b><small>+0% bonus</small>
            </button>`
          ).join("")}
        </div>
        <p style="font-size:11px;color:#999;margin:12px 0 0">Quản trị viên cũng có thể nạp trực tiếp cho bạn qua Panel quản trị.</p>
      </div>
    </div>`;
  wrap.classList.add("open");
  document.body.style.overflow = "hidden";
  $("#topup-close").addEventListener("click", closeTopup);
  $$(".topup-pack", wrap).forEach((b) =>
    b.addEventListener("click", () => {
      creditWallet(user.username, Number(b.dataset.amount));
      closeTopup();
      toast(`Nạp ${money(Number(b.dataset.amount))} vào MinePay thành công!`, "success");
      renderCartPage();
    })
  );
}
function closeTopup() {
  const wrap = $("#topup-modal");
  if (!wrap) return;
  wrap.classList.remove("open");
  document.body.style.overflow = "";
}

/* ------------------- SẢN PHẨM GỢI Ý ------------------- */
function renderCartSuggestions() {
  const host = $("#cart-suggest-grid");
  if (!host) return;
  const cart = getCart();
  const inCart = new Set(cart.map((i) => i.id));
  const list = PRODUCTS.filter((p) => !inCart.has(p.id))
    .sort((a, b) => b.rating * b.sold - a.rating * a.sold)
    .slice(0, 6);
  host.innerHTML = list.map(cardHTML).join("");
  const sugTitle = $("#cart-suggest-title");
  if (sugTitle) sugTitle.textContent = t("cart.suggest");
}

/* ------------------- MODAL THANH TOÁN ------------------- */
function bindCheckoutShell() {
  const modal = $("#checkout-modal");
  if (!modal) return;
  $(".modal-close", modal).addEventListener("click", closeCheckout);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeCheckout();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeCheckout();
  });
}

function openCheckout(t2) {
  const modal = $("#checkout-modal");
  const body = $("#checkout-body");
  const user = currentUser();
  $("#checkout-title").textContent = t("cart.payTitle");
  const balance = user ? userWalletAtLogin(user) : 0;
  const canPay = balance >= t2.total;

  body.innerHTML = `
  <form id="checkout-form">
    <div class="form-error ${!canPay ? "show" : ""}" id="checkout-error">${canPay ? "" : t("cart.balanceNotEnough", { need: money(t2.total - balance) }) + ' <button type="button" id="ck-topup" class="chip" style="margin-left:6px">💎 ' + t("cart.topup") + "</button>"}</div>
    <div class="field">
      <label for="ck-name">${t("cart.pay.name")}</label>
      <input id="ck-name" value="${escapeHtml(user ? user.name : "")}" required placeholder="Nguyễn Văn A">
    </div>
    <div class="field">
      <label for="ck-phone">${t("cart.pay.phone")}</label>
      <input id="ck-phone" inputmode="numeric" required placeholder="0912345678">
    </div>
    <div class="field">
      <label for="ck-address">${t("cart.pay.address")}</label>
      <input id="ck-address" type="email" required placeholder="you@example.com">
    </div>
    <div class="field">
      <label for="ck-note">${t("cart.pay.note")}</label>
      <input id="ck-note" placeholder="Ví dụ: liên hệ Zalo sau khi đặt">
    </div>

    <div class="field" style="margin-bottom:8px">
      <label>${t("cart.pay.method")}</label>
      <div class="pay-methods">
        <label class="pay-method active">
          <input type="radio" name="pay" value="cod" checked>
          <span class="pm-ico">💎</span>
          <span class="pm-txt">${t("cart.pay.cod")}<small>${t("cart.pay.codSub")}</small></span>
        </label>
        <label class="pay-method">
          <input type="radio" name="pay" value="bank">
          <span class="pm-ico">🏦</span>
          <span class="pm-txt">${t("cart.pay.bank")}<small>${t("cart.pay.bankSub")}</small></span>
        </label>
        <label class="pay-method">
          <input type="radio" name="pay" value="wallet">
          <span class="pm-ico">📱</span>
          <span class="pm-txt">${t("cart.pay.wallet")}<small>${t("cart.pay.walletSub")}</small></span>
        </label>
      </div>
    </div>

    <div class="checkout-total">
      <div class="line"><span>${t("cart.subtotal")} (${t2.count} ${t("cart.items")})</span><span>${money(t2.subtotal)}</span></div>
      <div class="line"><span>${t("cart.discount")} ${CART_UI.voucher ? "(" + CART_UI.voucher.code + ")" : ""}</span><span style="color:#26aa99">${t2.discount ? "-" + money(t2.discount) : t("free.money")}</span></div>
      <div class="line"><span>${t("cart.balance")}</span><span id="ck-balance">${money(balance)}</span></div>
      <div class="line"><span>${t("cart.total")}</span><span>${money(t2.total)}</span></div>
    </div>

    <button class="btn btn-primary btn-block btn-lg" type="submit" style="margin-top:14px">${t("cart.pay.place")}</button>
    <p style="font-size:11px;color:#999;text-align:center;margin:10px 0 0">${t("cart.pay.agree")}</p>
  </form>`;

  const topupInErr = $("#ck-topup");
  if (topupInErr) {
    topupInErr.addEventListener("click", () => {
      closeCheckout();
      openTopup();
      setTimeout(() => renderCartPage(), 100);
    });
  }

  $$(".pay-method", body).forEach((m) => {
    m.addEventListener("click", () => {
      $$(".pay-method", body).forEach((x) => x.classList.remove("active"));
      m.classList.add("active");
    });
  });

  $("#checkout-form").addEventListener("submit", (e) => {
    e.preventDefault();
    placeOrder(t2);
  });

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  setTimeout(() => $("#ck-name") && $("#ck-name").focus(), 80);
}

function placeOrder(t2) {
  const name = $("#ck-name").value.trim();
  const phone = $("#ck-phone").value.trim();
  const email = $("#ck-address").value.trim();
  const note = $("#ck-note").value.trim();
  const payment = $('input[name="pay"]:checked').value;
  const err = $("#checkout-error");

  const fail = (msg) => {
    err.textContent = msg;
    err.classList.add("show");
  };

  const user = currentUser();
  if (!user) return fail(t("cart.needLogin"));
  if (name.length < 2) return fail("Vui lòng nhập họ tên hợp lệ.");
  if (!/^0\d{8,10}$/.test(phone)) return fail("Số điện thoại không hợp lệ (bắt đầu bằng 0, 9-11 số).");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("Email không hợp lệ.");

  const balance = userWalletAtLogin(user);
  /* KHOÁ MUA HÀNG KHI KHÔNG ĐỦ TIỀN */
  if (balance < t2.total) {
    toast(t("cart.balanceNotEnough", { need: money(t2.total - balance) }), "error");
    return fail(t("cart.balanceNotEnough", { need: money(t2.total - balance) }));
  }

  const cart = getCart();
  const items = t2.selected.map((item) => {
    const p = getProduct(item.id);
    const v = p.variants[item.v] || p.variants[0];
    return {
      id: p.id,
      name: p.name,
      variant: v.name,
      price: v.price,
      oldPrice: v.oldPrice,
      qty: item.qty,
      emoji: p.emoji,
      c1: p.c1,
      c2: p.c2,
      cat: p.cat,
      delivery: p.delivery,
      assets: makeOrderAssets(p.id, item.v, item.qty),
    };
  });

  const code = "MS" + String(Date.now()).slice(-8);
  const order = {
    code,
    createdAt: Date.now(),
    owner: user.username,
    ownerName: user.name,
    items,
    subtotal: t2.subtotal,
    discount: t2.discount,
    ship: 0,
    total: t2.total,
    voucher: CART_UI.voucher ? CART_UI.voucher.code : null,
    customer: { name, phone, address: email, note },
    payment,
    status: "Chờ xác nhận",
    paidAt: Date.now(),
  };

  const orders = readLS(KEYS.orders, []);
  orders.unshift(order);
  writeLS(KEYS.orders, orders);

  /* Trừ tiền ví MinePay của người mua */
  debitWallet(user.username, t2.total);

  // xoá các sản phẩm đã đặt khỏi giỏ
  const keep = cart.filter((i) => !i.sel);
  saveCart(keep);
  CART_UI.voucher = null;
  writeLS(KEYS.voucher, "");

  showOrderSuccess(order);
  renderCartPage();
  renderCartSuggestions();
}

function showOrderSuccess(order) {
  const labels = { cod: t("cart.pay.codShort"), bank: t("cart.pay.bankShort"), wallet: t("cart.pay.walletShort") };
  $("#checkout-title").textContent = t("cart.success.title");
  $("#checkout-body").innerHTML = `
    <div class="success-box">
      <div class="success-icon">✓</div>
      <h3>${t("cart.success.p1")} ${escapeHtml(order.customer.name)}!</h3>
      <p>${t("cart.success.p2")}</p>
      <div class="success-code">${order.code}</div>
      <p style="font-size:12px;color:#999">${t("cart.total")}: <b style="color:#ee4d2d">${money(order.total)}</b> • ${labels[order.payment] || order.payment}</p>
      <div style="display:flex;gap:8px;margin-top:16px">
        <a class="btn btn-plain btn-block" href="index.html">${t("cart.continue").replace("← ", "")}</a>
        <a class="btn btn-primary btn-block" href="orders.html">${t("cart.success.view")}</a>
      </div>
      <p style="font-size:11px;color:#bbb;margin-top:12px">${t("pd.demoNote")}</p>
    </div>`;
  toast("Đặt hàng thành công! Mã đơn " + order.code, "success");
}

function closeCheckout() {
  const modal = $("#checkout-modal");
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
}
