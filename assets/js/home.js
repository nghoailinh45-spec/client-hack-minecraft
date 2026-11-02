/* =========================================================
   TRANG CHỦ - banner, flash sale, gợi ý sản phẩm
   ========================================================= */

const HOME_STATE = {
  q: (typeof param === "function" ? param("q") : "") || "",
  cat: (typeof param === "function" ? param("cat") : "") || "",
  wishOnly: (typeof param === "function" ? param("wish") : "") === "1",
  sort: "popular",
  minPrice: null,
  maxPrice: null,
  minRating: 0,
  shown: 12,
  slide: 0,
};

const BANNERS = [
  {
    kicker: () => t("banner1.k"),
    title: () => t("banner1.t"),
    desc: () => t("banner1.d"),
    cta: "Mua ngay",
    link: "index.html?cat=pvp",
    emoji: "🌌",
    bg: "linear-gradient(120deg,#1e1b4b 0%,#6d28d9 55%,#22d3ee 100%)",
  },
  {
    kicker: () => t("banner2.k"),
    title: () => t("banner2.t"),
    desc: () => t("banner2.d"),
    cta: "Săn deal ngay",
    link: "#flash-section",
    emoji: "⚡",
    bg: "linear-gradient(120deg,#7c2d12 0%,#ef4444 55%,#f59e0b 100%)",
  },
  {
    kicker: () => t("banner3.k"),
    title: () => t("banner3.t"),
    desc: () => t("banner3.d"),
    cta: "Thuê server",
    link: "index.html?cat=service",
    emoji: "🖥️",
    bg: "linear-gradient(120deg,#022c22 0%,#16a34a 55%,#22d3ee 100%)",
  },
];

const QUICK_CATS = [
  { key: "qc.pvp", icon: "⚔️", href: "index.html?cat=pvp" },
  { key: "qc.survival", icon: "🌲", href: "index.html?cat=survival" },
  { key: "qc.mod", icon: "🧩", href: "index.html?cat=mod" },
  { key: "qc.cape", icon: "🧣", href: "index.html?cat=cosmetic" },
  { key: "qc.skin", icon: "🎨", href: "index.html?q=skin" },
  { key: "qc.acc", icon: "🎮", href: "index.html?cat=account" },
  { key: "qc.bedrock", icon: "📱", href: "index.html?q=bedrock" },
  { key: "qc.fps", icon: "🚀", href: "index.html?q=fps" },
  { key: "qc.setup", icon: "🖥️", href: "index.html?cat=service" },
  { key: "qc.combo", icon: "🎁", href: "index.html?q=combo" },
];

document.addEventListener("DOMContentLoaded", initHome);

function initHome() {
  applyStaticI18n();
  renderBanners();
  renderQuickCats();
  renderFlashSale();
  startCountdown();
  renderVouchers();
  renderCatChips();
  bindHomeEvents();
  updateHeading();
  renderSuggestions();
}

/* ------------------- BANNER ------------------- */
function renderBanners() {
  const slides = $("#slides");
  const dots = $("#slider-dots");
  if (!slides) return;

  slides.innerHTML = BANNERS.map(
    (b, i) => `
    <div class="slide ${i === 0 ? "active" : ""}" style="background:${b.bg}">
      <span class="kicker">✦ ${b.kicker()}</span>
      <h2>${b.title()}</h2>
      <p>${b.desc()}</p>
      <a class="slide-btn" href="${b.link}">${b.cta} →</a>
      <span class="slide-emoji">${b.emoji}</span>
    </div>`
  ).join("");

  dots.innerHTML = BANNERS.map(
    (_, i) => `<button data-slide="${i}" class="${i === 0 ? "active" : ""}" aria-label="Banner ${i + 1}"></button>`
  ).join("");

  const go = (idx) => {
    HOME_STATE.slide = idx;
    $$(".slide", slides).forEach((s, i) => s.classList.toggle("active", i === idx));
    $$("button", dots).forEach((d, i) => d.classList.toggle("active", i === idx));
  };

  dots.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-slide]");
    if (b) go(Number(b.dataset.slide));
  });

  let timer = setInterval(() => go((HOME_STATE.slide + 1) % BANNERS.length), 5000);

  const hero = $(".hero-main");
  hero.addEventListener("mouseenter", () => clearInterval(timer));
  hero.addEventListener("mouseleave", () => {
    clearInterval(timer);
    timer = setInterval(() => go((HOME_STATE.slide + 1) % BANNERS.length), 5000);
  });
}

function renderQuickCats() {
  const host = $("#cat-circles");
  if (!host) return;
  host.innerHTML = QUICK_CATS.map(
    (c) => `
    <a class="cat-circle" href="${c.href}">
      <span class="ico">${c.icon}</span>
      <span class="txt">${t(c.key)}</span>
    </a>`
  ).join("");
}

/* ------------------- FLASH SALE ------------------- */
function renderFlashSale() {
  const host = $("#flash-track");
  if (!host) return;

  const items = PRODUCTS.filter(
    (p) => p.discount >= 45 || (p.badges || []).includes("Flash Sale")
  )
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 8);

  host.innerHTML = items
    .map((p) => {
      const percent = 42 + (p.sold % 46);
      const soldNow = Math.round((p.sold * percent) / 100);
      return `
      <a class="flash-card" href="product.html?id=${p.id}">
        <div class="thumb">
          <img src="${p.thumb}" alt="${escapeHtml(p.name)}" loading="lazy">
          ${p.discount ? `<div class="ribbon">${p.discount}%<small>GIẢM</small></div>` : ""}
        </div>
        <div class="f-name">${escapeHtml(p.name)}</div>
        <div class="f-price">${money(p.price)}</div>
        <div class="f-old">${money(p.oldPrice)}</div>
        <div class="sold-bar"><span style="width:${percent}%"></span><b>Đã bán ${soldNow}</b></div>
      </a>`;
    })
    .join("");
}

function startCountdown() {
  const h = $("#cd-h"), m = $("#cd-m"), s = $("#cd-s");
  if (!h) return;
  const tick = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    let diff = Math.max(0, Math.floor((end - now) / 1000));
    const hh = Math.floor(diff / 3600);
    diff -= hh * 3600;
    const mm = Math.floor(diff / 60);
    const ss = diff - mm * 60;
    h.textContent = String(hh).padStart(2, "0");
    m.textContent = String(mm).padStart(2, "0");
    s.textContent = String(ss).padStart(2, "0");
  };
  tick();
  setInterval(tick, 1000);
}

/* ------------------- VOUCHER ------------------- */
function renderVouchers() {
  const host = $("#voucher-strip");
  if (!host) return;
  host.innerHTML = VOUCHERS.map(
    (v) => `
    <div class="voucher">
      <div class="v-left">
        <span class="v-value">${v.label}</span>
        <span class="v-sub">MineShopee</span>
      </div>
      <div class="v-body">
        <span class="v-desc">${v.desc}</span>
        <button class="v-code" data-copy="${v.code}" type="button">
          ${v.code} <span class="v-copy">SAO CHÉP</span>
        </button>
      </div>
    </div>`
  ).join("");

  host.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    const code = btn.dataset.copy;
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

/* ------------------- BỘ LỌC ------------------- */
function renderCatChips() {
  const host = $("#cat-chips");
  if (!host) return;
  host.innerHTML =
    `<button class="chip ${HOME_STATE.cat === "" ? "active" : ""}" data-cat="" type="button">${t("filter.all")}</button>` +
    CATEGORIES.map(
      (c) => `<button class="chip ${HOME_STATE.cat === c.id ? "active" : ""}" data-cat="${c.id}" type="button">${c.icon} ${catName(c.id)}</button>`
    ).join("");
}

function bindHomeEvents() {
  // sắp xếp
  $("#sorts").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-sort]");
    if (!btn) return;
    HOME_STATE.sort = btn.dataset.sort;
    HOME_STATE.shown = 12;
    $$("#sorts .sort-btn").forEach((b) => b.classList.toggle("active", b === btn));
    renderSuggestions();
  });

  // bộ lọc
  const panel = $("#filter-panel");
  $("#filter-toggle").addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("open");
  });
  panel.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", () => panel.classList.remove("open"));

  $("#cat-chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    HOME_STATE.cat = chip.dataset.cat;
    $$("#cat-chips .chip").forEach((c) => c.classList.toggle("active", c === chip));
  });

  $("#rate-chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const val = Number(chip.dataset.rate);
    HOME_STATE.minRating = HOME_STATE.minRating === val ? 0 : val;
    $$("#rate-chips .chip").forEach((c) =>
      c.classList.toggle("active", Number(c.dataset.rate) === HOME_STATE.minRating)
    );
  });

  $("#filter-apply").addEventListener("click", () => {
    const min = Number($("#price-min").value);
    const max = Number($("#price-max").value);
    HOME_STATE.minPrice = min > 0 ? min : null;
    HOME_STATE.maxPrice = max > 0 ? max : null;
    HOME_STATE.shown = 12;
    panel.classList.remove("open");
    updateHeading();
    renderSuggestions();
  });

  $("#filter-reset").addEventListener("click", () => {
    HOME_STATE.cat = "";
    HOME_STATE.minPrice = null;
    HOME_STATE.maxPrice = null;
    HOME_STATE.minRating = 0;
    HOME_STATE.shown = 12;
    $("#price-min").value = "";
    $("#price-max").value = "";
    $$("#cat-chips .chip").forEach((c) => c.classList.toggle("active", c.dataset.cat === ""));
    $$("#rate-chips .chip").forEach((c) => c.classList.remove("active"));
    updateHeading();
    renderSuggestions();
  });

  // xem thêm
  $("#load-more").addEventListener("click", () => {
    HOME_STATE.shown += 12;
    renderSuggestions();
  });

  // tìm kiếm nội bộ không reload
  window.addEventListener("ms:search", (e) => {
    HOME_STATE.q = e.detail.q || "";
    HOME_STATE.cat = "";
    HOME_STATE.wishOnly = false;
    HOME_STATE.shown = 12;
    HOME_STATE.sort = "popular";
    HOME_STATE.minPrice = null;
    HOME_STATE.maxPrice = null;
    HOME_STATE.minRating = 0;
    $("#price-min").value = "";
    $("#price-max").value = "";
    renderCatChips();
    $$("#sorts .sort-btn").forEach((b) => b.classList.toggle("active", b.dataset.sort === "popular"));
    updateHeading();
    renderSuggestions();
    $("#suggest-section").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // popstate
  window.addEventListener("popstate", () => {
    HOME_STATE.q = param("q") || "";
    HOME_STATE.cat = param("cat") || "";
    HOME_STATE.wishOnly = param("wish") === "1";
    HOME_STATE.shown = 12;
    renderCatChips();
    updateHeading();
    renderSuggestions();
  });
}

/* ------------------- GỢI Ý / TÌM KIẾM ------------------- */
function filterProducts() {
  let list = PRODUCTS.slice();
  const s = HOME_STATE;

  if (s.wishOnly) {
    const wish = getWish();
    list = list.filter((p) => wish.includes(p.id));
  }
  if (s.q) {
    const q = s.q.toLowerCase();
    list = list.filter((p) =>
      [p.name, p.short, p.shop, p.catName, p.desc, (p.badges || []).join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }
  if (s.cat) list = list.filter((p) => p.cat === s.cat);
  if (s.minPrice != null) list = list.filter((p) => p.price >= s.minPrice);
  if (s.maxPrice != null) list = list.filter((p) => p.price <= s.maxPrice);
  if (s.minRating) list = list.filter((p) => p.rating >= s.minRating);

  switch (s.sort) {
    case "new":
      list.sort((a, b) => PRODUCTS.indexOf(b) - PRODUCTS.indexOf(a));
      break;
    case "sold":
      list.sort((a, b) => b.sold - a.sold);
      break;
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    default:
      list.sort((a, b) => b.rating * b.sold - a.rating * a.sold);
  }
  return list;
}

function updateHeading() {
  const el = $("#suggest-title");
  if (!el) return;
  if (HOME_STATE.q) {
    el.innerHTML = `${t("home.results")} "<b>${escapeHtml(HOME_STATE.q)}</b>"`;
  } else if (HOME_STATE.cat) {
    const c = CATEGORIES.find((x) => x.id === HOME_STATE.cat);
    el.innerHTML = `${c ? catName(c.id) : ""} <small>${t("home.all")}</small>`;
  } else if (HOME_STATE.wishOnly) {
    el.innerHTML = t("home.wish");
  } else {
    el.innerHTML = t("home.suggest");
  }
}

function renderSuggestions() {
  const grid = $("#product-grid");
  const loadWrap = $("#load-more-wrap");
  if (!grid) return;

  const list = filterProducts();
  const visible = list.slice(0, HOME_STATE.shown);

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty" style="grid-column:1/-1">
        <div class="big">🧱</div>
        <h3>${t("home.emptySearch")}</h3>
        <p>${t("home.tryOther")}</p>
        <a class="btn btn-primary" href="index.html">${t("home.seeAll")}</a>
      </div>`;
    if (loadWrap) loadWrap.style.display = "none";
    return;
  }

  grid.innerHTML = visible.map(cardHTML).join("");
  if (loadWrap) loadWrap.style.display = list.length > HOME_STATE.shown ? "flex" : "none";
  const lm = $("#load-more");
  if (lm) lm.textContent = t("loadmore");
}
