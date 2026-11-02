/* =========================================================
   TRANG ĐƠN MUA + KHO CLIENT (link tải & thông tin acc game)
   ========================================================= */

let ORDER_FILTER = "all";

document.addEventListener("DOMContentLoaded", () => {
  applyStaticI18n();
  const titleEl = $("#orders-title-text");
  if (titleEl) titleEl.textContent = t("user.menu.orders");

  // ?lib=1 → mở ngay thư viện
  if (param("lib") === "1") {
    setTimeout(() => {
      const lib = $("[data-lib-open]");
      if (lib) lib.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }

  renderOrders();

  $("#order-tabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-status]");
    if (!btn) return;
    ORDER_FILTER = btn.dataset.status;
    $$("#order-tabs button").forEach((b) => b.classList.toggle("active", b === btn));
    renderOrders();
  });

  $("#orders-root").addEventListener("click", (e) => {
    const lib = e.target.closest("[data-lib]");
    if (lib) {
      if (e.target.closest("a")) return; // nhấn vào link sản phẩm → điều hướng bình thường
      const code = lib.dataset.lib;
      const idx = Number(lib.dataset.item);
      const orders = readLS(KEYS.orders, []);
      const order = orders.find((o) => o.code === code);
      if (order) openLibraryModal(order, Number.isNaN(idx) ? null : idx);
      return;
    }

    const cancel = e.target.closest("[data-cancel]");
    if (cancel) {
      const code = cancel.dataset.cancel;
      if (!confirm(`${t("order.confirmCancel")} ${code}?`)) return;
      const orders = readLS(KEYS.orders, []);
      const order = orders.find((o) => o.code === code);
      if (order) order.status = "Đã huỷ";
      writeLS(KEYS.orders, orders);
      toast(`${t("order.canceled")} ${code}`);
      renderOrders();
      return;
    }

    const rebuy = e.target.closest("[data-rebuy]");
    if (rebuy) {
      const orders = readLS(KEYS.orders, []);
      const order = orders.find((o) => o.code === rebuy.dataset.rebuy);
      if (!order) return;
      order.items.forEach((it) => {
        const p = getProduct(it.id);
        if (!p) return;
        const idx = Math.max(0, p.variants.findIndex((v) => v.name === it.variant));
        addToCart(it.id, idx, it.qty, true);
      });
      toast(t("order.rebuy.ok"), "success");
      setTimeout(() => (location.href = "cart.html"), 500);
      return;
    }

    const contact = e.target.closest("[data-contact]");
    if (contact) {
      toast(t("order.chat"));
    }
  });
});

const PAY_LABEL_SHORT = () => ({
  cod: t("cart.pay.codShort"),
  bank: t("cart.pay.bankShort"),
  wallet: t("cart.pay.walletShort"),
});

function renderOrders() {
  const root = $("#orders-root");
  const orders = readLS(KEYS.orders, []);
  const filtered = orders.filter((o) => {
    if (ORDER_FILTER === "all") return true;
    return orderStatusInfo(o).key === ORDER_FILTER;
  });

  if (!orders.length) {
    root.innerHTML = `
      <div class="cart-empty">
        <div class="big">📭</div>
        <h3>${t("orders.empty")}</h3>
        <p>${t("orders.emptyDesc")}</p>
        <a class="btn btn-primary btn-lg" href="index.html">${t("orders.go")}</a>
      </div>`;
    return;
  }

  if (!filtered.length) {
    root.innerHTML = `
      <div class="cart-empty">
        <div class="big">🔍</div>
        <h3>${t("orders.noneStatus")}</h3>
        <p>${t("orders.double")}</p>
        <button class="btn btn-primary" type="button"
          onclick="ORDER_FILTER='all';document.querySelectorAll('#order-tabs button').forEach((b,i)=>b.classList.toggle('active',i===0));renderOrders()">${t("orders.viewAll")}</button>
      </div>`;
    return;
  }

  const payLabels = PAY_LABEL_SHORT();
  const tabs = $$("#order-tabs button");
  const labelOf = { all: t("orders.tab.all"), pending: t("orders.tab.pending"), done: t("orders.tab.done"), cancel: t("orders.tab.cancel") };
  tabs.forEach((b) => {
    const k = b.dataset.status;
    if (labelOf[k] !== undefined) b.textContent = labelOf[k];
  });

  root.innerHTML = filtered
    .map((o) => {
      const st = orderStatusInfo(o);
      const itemCount = o.items.reduce((s, i) => s + i.qty, 0);
      return `
      <div class="order-card">
        <div class="order-head">
          <span>${t("orders.code")}: <span class="code">${o.code}</span> • ${formatDate(o.createdAt)} • ${itemCount} ${t("cart.items")}</span>
          <span class="status-pill ${st.cls}">${st.label}</span>
        </div>
        <div class="order-body">
          ${o.items.map((it, idx) => `
            <div class="order-item ${it.assets && it.assets.length ? "purchased" : ""}" data-lib="${o.code}" data-item="${idx}" title="${t("lib.open")}">
              <a href="product.html?id=${it.id}"><img src="${(getProduct(it.id) || {}).thumb || ""}" alt="${escapeHtml(it.name)}"></a>
              <div>
                <a class="oi-name" href="product.html?id=${it.id}">${escapeHtml(it.name)}</a>
                <div class="oi-var">${t("cart.variant")}: ${escapeHtml(it.variant)} • SL: ${it.qty}</div>
                ${it.assets && it.assets.length ? `<div class="oi-lib-cta">${t("lib.open")}</div>` : ""}
              </div>
              <div class="oi-price">${money(it.price * it.qty)}</div>
            </div>`).join("")}
        </div>
        <div class="order-foot" style="justify-content:space-between">
          <span style="color:#888;font-size:12px">👤 ${escapeHtml(o.customer.name)} • ${escapeHtml(o.customer.phone)} • 💳 ${payLabels[o.payment] || o.payment}</span>
          <div class="order-actions">
            <span style="align-self:center;color:#555">${t("orders.atm")}: <span class="amt">${money(o.total)}</span></span>
            <button class="btn btn-soft btn-sm" data-lib="${o.code}" type="button">🔓 ${t("orders.libBtn")}</button>
            ${st.key === "pending" ? `<button class="btn btn-plain btn-sm" data-cancel="${o.code}" type="button">${t("orders.cancel")}</button>` : ""}
            <button class="btn btn-plain btn-sm" data-contact="${o.code}" type="button">${t("orders.contactShop")}</button>
            <button class="btn btn-primary btn-sm" data-rebuy="${o.code}" type="button">${t("orders.rebuy")}</button>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

/* ------------------- MODAL KHO CLIENT ------------------- */
function openLibraryModal(order, itemIndex) {
  let wrap = $("#lib-modal");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "modal-mask";
    wrap.id = "lib-modal";
    document.body.appendChild(wrap);
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap) closeLibModal();
    });
  }

  const items = itemIndex === null ? order.items : [order.items[itemIndex]];

  wrap.innerHTML = `
    <div class="modal lib-modal">
      <div class="modal-head">
        <h3>${t("lib.title")}</h3>
        <button class="modal-close" type="button" aria-label="Đóng" id="lib-close">✕</button>
      </div>
      <div class="modal-body">
        <p class="lib-hint">${t("lib.hint")} • ${t("orders.code")} ${order.code}</p>
        ${items.map((it, idx) => libItemHTML(order, it, itemIndex === null ? idx : itemIndex)).join("")}
        <div class="lib-security">${t("lib.secure")}</div>
      </div>
    </div>`;

  wrap.classList.add("open");
  document.body.style.overflow = "hidden";
  $("#lib-close").addEventListener("click", closeLibModal);

  /* copy buttons */
  $$("#lib-modal [data-copy-value]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const val = btn.dataset.copyValue;
      try {
        await navigator.clipboard.writeText(val);
      } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = val;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      const old = btn.textContent;
      btn.textContent = "✓ " + t("lib.copied");
      setTimeout(() => (btn.textContent = old), 1400);
    });
  });
}

function libItemHTML(order, it) {
  const assets = it.assets || [];
  if (!assets.length) {
    return `
      <div class="lib-item">
        <div class="lib-name">${it.emoji || "🧊"} ${escapeHtml(it.name)}</div>
        <div class="lib-info">${t("lib.svcInfo")}</div>
      </div>`;
  }
  return `
    <div class="lib-item">
      <div class="lib-name">${it.emoji || "🧊"} ${escapeHtml(it.name)}
        <span class="lib-variant">${escapeHtml(it.variant)}</span>
      </div>
      ${assets.map((a, i) => assetBlockHTML(it, a, i)).join("")}
    </div>`;
}

function assetBlockHTML(it, a) {
  if (a.service) {
    return `
      <div class="lib-asset">
        <div class="lib-title">${t("lib.svcTitle")}</div>
        <div class="cred-row"><span>🎫 Ticket</span><code>${escapeHtml(a.ticket)}</code><button class="chip" data-copy-value="${escapeHtml(a.ticket)}" type="button">${t("lib.copy")}</button></div>
        <div class="lib-info">${t("lib.svcInfo")}</div>
      </div>`;
  }
  const safeUrl = escapeHtml(a.downloadUrl);
  return `
    <div class="lib-asset">
      <div class="cred-row"><span>${t("lib.key")}</span><code>${escapeHtml(a.key)}</code><button class="chip" data-copy-value="${escapeHtml(a.key)}" type="button">${t("lib.copy")}</button></div>
      <a class="btn btn-primary btn-block" href="${safeUrl}" target="_blank" rel="noopener" download style="margin:10px 0">${t("lib.dl")}</a>
      <div class="lib-title" style="margin-top:12px">${t("lib.accTitle")}</div>
      <div class="cred-row"><span>${t("lib.accUser")}</span><code>${escapeHtml(a.username)}</code><button class="chip" data-copy-value="${escapeHtml(a.username)}" type="button">${t("lib.copy")}</button></div>
      <div class="cred-row"><span>${t("lib.accPass")}</span><code>${escapeHtml(a.password)}</code><button class="chip" data-copy-value="${escapeHtml(a.password)}" type="button">${t("lib.copy")}</button></div>
      <button class="btn btn-soft btn-block" type="button" onclick="toast('Đã mở phiên đăng nhập client an toàn (demo)','success')" style="margin-top:10px">🚀 Mở client &amp; đăng nhập tự động</button>
    </div>`;
}

function closeLibModal() {
  const wrap = $("#lib-modal");
  if (!wrap) return;
  wrap.classList.remove("open");
  document.body.style.overflow = "";
}
