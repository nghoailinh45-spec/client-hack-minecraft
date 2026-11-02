/* =========================================================
   TRANG CHI TIẾT SẢN PHẨM
   ========================================================= */

const PD = { product: null, variant: 0, qty: 1, gallery: 0 };

document.addEventListener("DOMContentLoaded", initProduct);

function initProduct() {
  applyStaticI18n();
  const id = param("id");
  const product = getProduct(id);
  if (!product) {
    document.title = t("pd.notFound") + " - MineShopee";
    $("#product-root").innerHTML = `
      <div class="empty" style="margin-top:14px">
        <div class="big">🧱</div>
        <h3>${t("pd.notFound")}</h3>
        <p>${t("pd.notFound2")}</p>
        <a class="btn btn-primary" href="index.html">${t("pd.back")}</a>
      </div>`;
    return;
  }
  PD.product = product;
  PD.variant = 0;
  PD.qty = 1;

  document.title = product.name + " - MineShopee";
  const crumb = $("#breadcrumb");
  if (crumb) {
    crumb.innerHTML = `
      <a href="index.html">${t("nav.home")}</a><span class="sep">/</span>
      <a href="index.html?cat=${product.cat}">${catName(product.cat)}</a><span class="sep">/</span>
      <span>${escapeHtml(product.name.length > 52 ? product.name.slice(0, 52) + "..." : product.name)}</span>`;
  }

  renderProduct();
}

function renderProduct() {
  const p = PD.product;
  const root = $("#product-root");
  const variant = p.variants[PD.variant];
  const stock = 60 + (p.sold % 140);
  const reviews = buildReviews(p);
  const sameShop = PRODUCTS.filter((x) => x.id !== p.id && x.shop === p.shop).slice(0, 4);
  const related = (sameShop.length ? sameShop : PRODUCTS.filter((x) => x.id !== p.id && x.cat === p.cat)).slice(0, 4);
  const isService = p.delivery === "service";

  root.innerHTML = `
  <div class="pd-top">
    <div class="gallery">
      <div class="gallery-main"><img id="gallery-img" src="${p.thumbs[0]}" alt="${escapeHtml(p.name)}"></div>
      <div class="gallery-thumbs" id="gallery-thumbs">
        ${p.thumbs.map((src, i) => `
          <button class="${i === 0 ? "active" : ""}" data-gallery="${i}" type="button" aria-label="Ảnh ${i + 1}">
            <img src="${src}" alt="">
          </button>`).join("")}
      </div>
      <div class="gallery-tags">
        <span>${t("pd.autodeliver")}</span>
        <span>${t("pd.warranty")}</span>
        <span>${t("pd.support")}</span>
      </div>
    </div>

    <div class="pd-info">
      <div class="pd-badges">
        ${p.mall ? `<span class="tag-mall">${t("tag.mall")}</span>` : ""}
        ${p.fav ? `<span class="tag-fav">${t("tag.fav")}</span>` : ""}
        ${(p.badges || []).includes("Flash Sale") ? `<span class="tag-mall" style="background:#f59e0b">⚡ Flash Sale</span>` : ""}
        <span style="font-size:11px;color:#26aa99;background:#e8f8f4;padding:2px 7px;border-radius:3px;font-weight:600">${t("pd.instock")}</span>
      </div>

      <h1 class="pd-title">${escapeHtml(p.name)}</h1>
      <div class="pd-sub">
        <span class="rating">${p.rating.toFixed(1)} <span class="stars">${stars(p.rating)}</span></span>
        <span class="divider"></span>
        <span><b>${p.ratingCount}</b> ${t("pd.reviews")}</span>
        <span class="divider"></span>
        <span><b>${soldText(p.sold)}</b> ${t("pd.sold")}</span>
        <span class="divider"></span>
        <span>${t("pd.shop")}: <b>${escapeHtml(p.shop)}</b></span>
      </div>

      <div class="pd-price-box">
        <span class="now" id="pd-price">${money(variant.price)}</span>
        <span class="old" id="pd-old">${variant.oldPrice > variant.price ? money(variant.oldPrice) : ""}</span>
        <span class="off" id="pd-off" ${variant.oldPrice > variant.price ? "" : 'style="display:none"'}>-${Math.round((1 - variant.price / variant.oldPrice) * 100)}%</span>
        <span class="save" id="pd-save">${variant.oldPrice > variant.price ? `${t("pd.deal")} ${money(variant.oldPrice - variant.price)} ${t("pd.vsRoot")}` : t("pd.bestPrice")}</span>
      </div>

      <div class="pd-vouchers">
        <span class="label">${t("pd.voucherLabel")}</span>
        ${VOUCHERS.map((v) => `<button class="voucher-mini" data-copy="${v.code}" type="button">🎟️ ${v.code} • ${v.label}</button>`).join("")}
      </div>

      <div class="pd-option">
        <span class="label">${t("pd.variantLabel")}</span>
        <div class="opts" id="variant-opts">
          ${p.variants.map((v, i) => `
            <button class="opt-btn ${i === PD.variant ? "active" : ""}" data-variant="${i}" type="button">
              ${escapeHtml(v.name)}
              <small>${money(v.price)}</small>
            </button>`).join("")}
        </div>
      </div>

      <div class="pd-option">
        <span class="label">${t("pd.qty")}</span>
        <div class="qty-box">
          <button type="button" id="qty-minus" aria-label="-">−</button>
          <input id="qty-input" type="number" value="1" min="1" max="99" aria-label="${t("pd.qty")}">
          <button type="button" id="qty-plus" aria-label="+">+</button>
        </div>
        <span class="pd-stock" id="pd-stock">${t("pd.stock", { n: stock })}</span>
      </div>

      <div class="pd-actions">
        <button class="btn btn-soft" id="add-cart" type="button">${t("pd.addCart")}</button>
        <button class="btn btn-primary" id="buy-now" type="button">${t("pd.buyNow")}</button>
        <button class="btn btn-plain fav-action ${isWished(p.id) ? "active" : ""}" id="fav-btn" type="button">
          ${isWished(p.id) ? t("pd.wished") : t("pd.wish")}
        </button>
      </div>

      <div class="pd-guarantees">
        <div class="guarantee"><span class="gi">🔑</span><span><b>${t("pd.g1t")}</b>${t("pd.g1d")}</span></div>
        <div class="guarantee"><span class="gi">🛡️</span><span><b>${t("pd.g2t")}</b>${t("pd.g2d")}</span></div>
        <div class="guarantee"><span class="gi">💬</span><span><b>${t("pd.g3t")}</b>${t("pd.g3d")}</span></div>
      </div>
    </div>
  </div>

  <div class="pd-shop">
    <div class="shop-avatar">${escapeHtml(p.shop.charAt(0))}</div>
    <div class="shop-main">
      <h4>${escapeHtml(p.shop)} ${p.mall ? `<span class="tag-mall">${t("tag.mall")}</span>` : ""}</h4>
      <p>📍 ${escapeHtml(p.location)} • Tham gia 2 năm trước • Phản hồi trong 5 phút</p>
    </div>
    <div class="shop-stats">
      <div><b>${soldText(p.sold)}</b>${t("pd.sold")}</div>
      <div><b>${p.rating.toFixed(1)}</b>${t("pd.reviews")}</div>
      <div><b>2h</b>${isService ? "Kỹ thuật viên liên hệ" : t("pd.autodeliver")}</div>
    </div>
    <div class="shop-actions">
      <a class="btn btn-plain btn-sm" href="index.html?q=${encodeURIComponent(p.shop)}">${t("pd.viewShop")}</a>
      <button class="btn btn-primary btn-sm" type="button" onclick="toast('${t("order.chat")}','success')">${t("pd.chat")}</button>
    </div>
  </div>

  <div class="pd-panels">
    <div class="panel">
      <div class="pd-tabs" id="pd-tabs">
        <button class="active" data-tab="desc" type="button">${t("pd.tab.desc")}</button>
        <button data-tab="spec" type="button">${t("pd.tab.spec")}</button>
        <button data-tab="review" type="button">${t("pd.tab.review")} (${p.ratingCount})</button>
      </div>

      <div class="pd-tab-pane desc-block" id="pane-desc">
        <h4>${t("pd.desc.feat")}</h4>
        <ul>${p.features.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>
        <h4>${t("pd.desc.intro")}</h4>
        <p>${escapeHtml(p.desc)}</p>
        <p><b>${escapeHtml(p.name)}</b>
        ${p.delivery === "license"
          ? `— sau khi thanh toán bằng MinePay, <b>link tải + tài khoản game</b> sẽ hiện trong trang Đơn mua (Kho Client). Hỗ trợ cài đặt và bảo hành theo đúng mô tả.`
          : `— kỹ thuật viên sẽ liên hệ đặt lịch qua email/Zalo trong vòng 2 giờ, hoàn tất theo đúng các mốc cam kết trong mô tả.`}
        </p>
        <h4>${t("pd.desc.receive")}</h4>
        <ul>
          <li>${t("pd.desc.receive1")}</li>
          <li>${t("pd.desc.receive2")}</li>
          <li>${t("pd.desc.receive3")}</li>
          <li>${t("pd.desc.receive4")}</li>
        </ul>
        <p style="font-size:12px;color:#999">${t("pd.demoNote")}</p>
      </div>

      <div class="pd-tab-pane hidden" id="pane-spec">
        <table class="spec-table">
          <tbody>
            <tr><td>${t("pd.code")}</td><td>${p.id.toUpperCase()}</td></tr>
            <tr><td>${t("filter.cat")}</td><td>${catName(p.cat)}</td></tr>
            <tr><td>${t("pd.shop")}</td><td>${escapeHtml(p.shop)}</td></tr>
            ${p.specs.map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join("")}
            <tr><td>Giao hàng</td><td>${isService ? t("pd.deliverySvc") : t("pd.deliveryAuto")}</td></tr>
          </tbody>
        </table>
      </div>

      <div class="pd-tab-pane hidden" id="pane-review">
        <div class="review-summary">
          <div class="review-score">
            <div class="num">${p.rating.toFixed(1)}<small>/5</small></div>
            <div class="stars">${stars(p.rating)}</div>
            <div class="count">${p.ratingCount} ${t("pd.reviews")}</div>
          </div>
          <div class="review-bars">
            ${[5, 4, 3, 2, 1].map((n) => {
              const pct = n === 5 ? 78 : n === 4 ? 15 : n === 3 ? 5 : n === 2 ? 1 : 1;
              return `<div class="review-bar"><span>${n} ★</span><span class="bar"><i style="width:${pct}%"></i></span><span>${pct}%</span></div>`;
            }).join("")}
          </div>
        </div>
        <div style="margin-top:6px">
          ${reviews.map((r) => `
            <div class="review-item">
              <div class="review-avatar">${escapeHtml(r.name.split(" ").pop().charAt(0))}</div>
              <div class="review-main">
                <div class="r-name">${escapeHtml(r.name)} <span class="r-var">| ${escapeHtml(r.variant)}</span></div>
                <div class="review-stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
                <div class="review-text">${escapeHtml(r.text)}</div>
                <div class="review-foot">
                  <span>${r.date}</span>
                  <span>👍 ${t("pd.support")}</span>
                  <span>✅ ${t("tag.mall")}</span>
                </div>
              </div>
            </div>`).join("")}
        </div>
      </div>
    </div>

    <aside class="pd-side">
      <div class="panel">
        <div class="panel-head">${sameShop.length ? t("pd.other") : t("pd.similar")}</div>
        <div class="panel-body">
          ${related.map((r) => `
            <a class="side-product" href="product.html?id=${r.id}">
              <img src="${r.thumb}" alt="${escapeHtml(r.name)}" loading="lazy">
              <div>
                <div class="sp-name">${escapeHtml(r.name)}</div>
                <div class="sp-price">${money(r.price)}</div>
              </div>
            </a>`).join("")}
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">${t("pd.side.offer")}</div>
        <div class="panel-body">
          ${VOUCHERS.map((v) => `
            <div style="display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px dashed #f0f0f0;font-size:12.5px">
              <span>🎟️ <b>${v.code}</b><br><span style="color:#999;font-size:11.5px">${v.desc}</span></span>
              <button class="chip" data-copy="${v.code}" type="button" style="align-self:center">${t("pd.getcode")}</button>
            </div>`).join("")}
          <p style="font-size:11.5px;color:#999;margin:12px 0 0">${t("pd.side.offerNote")}</p>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">${t("pd.side.commit")}</div>
        <div class="panel-body">
          <div class="guarantee" style="margin-bottom:10px"><span class="gi">🛡️</span><span><b>${t("pd.g1t2")}</b>${t("pd.g1d")}</span></div>
          <div class="guarantee" style="margin-bottom:10px"><span class="gi">🔒</span><span><b>MinePay</b>${t("cart.pay.codSub")}</span></div>
          <div class="guarantee"><span class="gi">🚚</span><span><b>${t("pd.autodeliver")}</b>${t("pd.stock", { n: stock })}</span></div>
        </div>
      </div>
    </aside>
  </div>`;

  bindProductEvents();
}

function bindProductEvents() {
  const p = PD.product;
  const root = $("#product-root");

  // gallery
  $("#gallery-thumbs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-gallery]");
    if (!b) return;
    PD.gallery = Number(b.dataset.gallery);
    $("#gallery-img").src = p.thumbs[PD.gallery];
    $$("#gallery-thumbs button").forEach((x) => x.classList.toggle("active", x === b));
  });

  // variants
  $("#variant-opts").addEventListener("click", (e) => {
    const b = e.target.closest("[data-variant]");
    if (!b) return;
    PD.variant = Number(b.dataset.variant);
    $$("#variant-opts .opt-btn").forEach((x) => x.classList.toggle("active", x === b));
    updateVariantUI();
  });

  // qty
  const qtyInput = $("#qty-input");
  const setQty = (n) => {
    PD.qty = Math.max(1, Math.min(99, n || 1));
    qtyInput.value = PD.qty;
  };
  $("#qty-minus").addEventListener("click", () => setQty(PD.qty - 1));
  $("#qty-plus").addEventListener("click", () => setQty(PD.qty + 1));
  qtyInput.addEventListener("change", () => setQty(Number(qtyInput.value)));

  // actions
  $("#add-cart").addEventListener("click", () => {
    addToCart(p.id, PD.variant, PD.qty);
  });
  $("#buy-now").addEventListener("click", () => {
    addToCart(p.id, PD.variant, PD.qty, true);
    location.href = "cart.html";
  });

  // yêu thích
  $("#fav-btn").addEventListener("click", () => {
    toggleWish(p.id, null);
    const btn = $("#fav-btn");
    const wished = isWished(p.id);
    btn.classList.toggle("active", wished);
    btn.textContent = wished ? t("pd.wished") : t("pd.wish");
  });

  // tabs
  $("#pd-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (!b) return;
    $$("#pd-tabs button").forEach((x) => x.classList.toggle("active", x === b));
    ["desc", "spec", "review"].forEach((name) => {
      $("#pane-" + name).classList.toggle("hidden", name !== b.dataset.tab);
    });
  });

  // copy voucher
  root.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    const code = b.dataset.copy;
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    writeLS(KEYS.voucher, code);
    toast(t("voucher.save") + " " + code + t("voucher.howTo"), "success");
  });
}

function updateVariantUI() {
  const p = PD.product;
  const v = p.variants[PD.variant];
  const hasSale = v.oldPrice > v.price;
  $("#pd-price").textContent = money(v.price);
  const oldEl = $("#pd-old");
  oldEl.textContent = hasSale ? money(v.oldPrice) : "";
  oldEl.style.display = hasSale ? "inline" : "none";
  const off = $("#pd-off");
  off.textContent = hasSale ? "-" + Math.round((1 - v.price / v.oldPrice) * 100) + "%" : "";
  off.style.display = hasSale ? "inline-block" : "none";
  $("#pd-save").textContent = hasSale
    ? `${t("pd.deal")} ${money(v.oldPrice - v.price)} ${t("pd.vsRoot")}`
    : t("pd.bestPrice");
}

function buildReviews(p) {
  const base = PRODUCTS.indexOf(p);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(2026, 9, 26 - i * 4);
    return {
      name: REVIEW_NAMES[(base + i) % REVIEW_NAMES.length],
      stars: i === 4 ? 4 : i === 3 ? 5 : 5,
      text: REVIEW_TEXTS[(base + i) % REVIEW_TEXTS.length],
      variant: p.variants[(base + i) % p.variants.length].name,
      date: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`,
      likes: 2 + ((base * 7 + i * 5) % 38),
    };
  });
}
