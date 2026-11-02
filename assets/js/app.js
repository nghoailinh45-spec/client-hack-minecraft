/* =========================================================
   MineShopee - Logic dùng chung (header, auth, giỏ hàng, toast)
   ========================================================= */

const KEYS = {
  cart: "ms_cart",
  users: "ms_users",
  user: "ms_user",
  orders: "ms_orders",
  wish: "ms_wish",
  voucher: "ms_voucher",
};

const START_WALLET = 500000; // số dư MinePay tặng cho tài khoản mới

/* ------------------- TIỆN ÍCH ------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
function writeLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* bỏ qua */
  }
}
function money(n) {
  return Number(n || 0).toLocaleString("vi-VN") + "₫";
}
function soldText(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".", ",") + "k";
  return String(n);
}
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
function stars(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(Math.max(0, 5 - full));
}
function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}
function param(name) {
  return new URLSearchParams(location.search).get(name);
}

/* ------------------- THÔNG BÁO ------------------- */
function toast(message, type = "") {
  let wrap = $("#toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "toast-wrap";
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = "toast " + type;
  el.innerHTML = (type === "success" ? "✅ " : type === "error" ? "⚠️ " : "💬 ") + escapeHtml(message);
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 260);
  }, 2400);
}

/* ------------------- GIỎ HÀNG ------------------- */
function getCart() {
  return readLS(KEYS.cart, []);
}
function saveCart(cart) {
  writeLS(KEYS.cart, cart);
  updateCartBadge();
}
function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}
function cartLineKey(id, v) {
  return id + "::" + v;
}
function addToCart(id, variantIndex = 0, qty = 1, silent = false) {
  const product = getProduct(id);
  if (!product) return;
  const cart = getCart();
  const found = cart.find((i) => i.id === id && i.v === variantIndex);
  if (found) found.qty = Math.min(99, found.qty + qty);
  else cart.push({ id, v: variantIndex, qty: Math.min(99, qty) });
  saveCart(cart);
  if (!silent) toast(t("cart.itemAdded") + ": " + product.name.slice(0, 38) + "...", "success");
  return cart;
}
function updateCartBadge() {
  $$(".cart-badge").forEach((b) => {
    const n = cartCount();
    b.textContent = n > 99 ? "99+" : String(n);
  });
}

/* ------------------- YÊU THÍCH / SỐ DƯ MINEPAY ------------------- */
function getWish() {
  return readLS(KEYS.wish, []);
}
function isWished(id) {
  return getWish().includes(id);
}
function toggleWish(id, btn) {
  const list = getWish();
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
    toast(t("wish.removed"));
  } else {
    list.push(id);
    toast(t("wish.added"), "success");
  }
  writeLS(KEYS.wish, list);
  if (btn) {
    btn.classList.toggle("active", isWished(id));
    btn.innerHTML = isWished(id) ? "♥" : "♡";
    btn.title = isWished(id) ? t("wish.remove") : t("wish.add");
  }
}

/* ---- Ví MinePay: mỗi user có số dư riêng, thiếu tiền thì không mua được ---- */
function allUsers() {
  return getUsers();
}
function findStoredUser(username) {
  return allUsers().find(
    (u) => u.username.toLowerCase() === String(username).toLowerCase()
  );
}
function walletOf(username) {
  const u = findStoredUser(username);
  return u && typeof u.wallet === "number" ? u.wallet : 0;
}
function setUserWallet(username, wallet) {
  const users = allUsers();
  const u = users.find((x) => x.username.toLowerCase() === String(username).toLowerCase());
  if (!u) return false;
  u.wallet = Math.max(0, Math.round(Number(wallet) || 0));
  writeLS(KEYS.users, users);
  renderAuth();
  return true;
}
function debitWallet(username, amount) {
  const bal = walletOf(username);
  if (bal < amount) return false;
  return setUserWallet(username, bal - amount);
}
function creditWallet(username, amount) {
  return setUserWallet(username, walletOf(username) + Number(amount || 0));
}
function userRole(user) {
  if (!user) return "guest";
  const u = findStoredUser(user.username);
  return (u && u.role) || "user";
}
function userWalletAtLogin(user) {
  return user ? walletOf(user.username) : 0;
}

/* ---- Trạng thái & định dạng thời gian dùng chung (orders + admin) ---- */
function orderStatusInfo(order) {
  if (order.status === "Đã huỷ") return { key: "cancel", label: t("status.cancel"), cls: "status-cancel" };
  if (order.status === "Hoàn thành") return { key: "done", label: t("status.done"), cls: "status-done" };
  return { key: "pending", label: order.status === "Chờ xác nhận" ? t("status.pending") : order.status || t("status.pending"), cls: "status-pending" };
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString(CURRENT_LANG === "en" ? "en-US" : "vi-VN", {
    hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
  });
}

/* ------------------- TÀI KHOẢN ------------------- */
function getUsers() {
  let users = readLS(KEYS.users, null);
  if (!users) {
    users = [
      { username: "demo", password: "123456", name: "Khách Demo", role: "user", wallet: 1000000, createdAt: Date.now() },
      { username: "admin", password: "admin123", name: "Quản trị viên", role: "admin", wallet: 999999999, createdAt: Date.now() },
    ];
    writeLS(KEYS.users, users);
  }
  users.forEach((u) => {
    if (u.role == null) u.role = u.username === "admin" ? "admin" : "user";
    if (typeof u.wallet !== "number") u.wallet = u.username === "admin" ? 999999999 : START_WALLET;
  });
  return users;
}
function currentUser() {
  return readLS(KEYS.user, null);
}
function login(username, password) {
  const user = getUsers().find(
    (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );
  if (!user) return { ok: false, message: t("login.neg") };
  if (user.banned) return { ok: false, message: t("login.banned") };
  writeLS(KEYS.user, {
    username: user.username,
    name: user.name || user.username,
    role: user.role || "user",
    wallet: typeof user.wallet === "number" ? user.wallet : 0,
  });
  renderAuth();
  window.dispatchEvent(new Event("ms:auth"));
  return { ok: true };
}
function register(username, password, name) {
  if (username.length < 3) return { ok: false, message: t("reg.short") };
  if (password.length < 6) return { ok: false, message: t("reg.passShort") };
  const users = getUsers();
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, message: t("reg.existed") };
  }
  users.push({
    username,
    password,
    name: name || username,
    role: "user",
    wallet: START_WALLET,
    createdAt: Date.now(),
  });
  writeLS(KEYS.users, users);
  writeLS(KEYS.user, {
    username,
    name: name || username,
    role: "user",
    wallet: START_WALLET,
  });
  renderAuth();
  window.dispatchEvent(new Event("ms:auth"));
  return { ok: true };
}
function logout() {
  try { localStorage.removeItem(KEYS.user); } catch (e) { try { writeLS(KEYS.user, null); } catch (e2) {} }
  renderAuth();
  window.dispatchEvent(new Event("ms:auth"));
  toast(t("logout.ok"));
}

function renderAuth() {
  const user = currentUser();
  const role = userRole(user);
  const headerAuth = $("#header-auth");
  const topbarAuth = $("#topbar-auth");
  if (topbarAuth) {
    topbarAuth.innerHTML = user
      ? `<span>${t("topbar.hello")}, <b>${escapeHtml(user.name)}</b></span>`
      : `<a href="#" data-open-auth="login">${t("topbar.login")}</a> <span class="sep"></span> <a href="#" data-open-auth="register">${t("topbar.register")}</a>`;
  }
  if (!headerAuth) return;
  if (user) {
    headerAuth.innerHTML = `
      <div class="user-chip" id="user-chip">
        <div class="avatar">${escapeHtml(user.name.charAt(0).toUpperCase())}</div>
        <div>
          <div class="u-name">${escapeHtml(user.name)}</div>
          <div class="u-points">💎 ${money(userWalletAtLogin(user))}</div>
        </div>
        <div class="user-menu" id="user-menu">
          <a href="orders.html">📦 ${t("user.menu.orders")}</a>
          <a href="orders.html?lib=1">${t("user.menu.library")}</a>
          <a href="index.html?wish=1">❤️ ${t("user.menu.wish")}</a>
          <a href="cart.html">🛒 ${t("user.menu.cart")}</a>
          ${role === "admin" ? `<a href="admin.html">${t("user.menu.admin")}</a>` : ""}
          <a href="#" id="menu-logout">🚪 ${t("user.menu.logout")}</a>
        </div>
      </div>`;
    const chip = $("#user-chip");
    const menu = $("#user-menu");
    chip.addEventListener("click", (e) => {
      if (e.target.closest("#menu-logout")) {
        e.preventDefault();
        logout();
        return;
      }
      if (e.target.closest("a")) return;
      menu.classList.toggle("open");
    });
    if (!window.__userMenuBound) {
      window.__userMenuBound = true;
      document.addEventListener("click", (e) => {
        if (!e.target.closest("#user-chip")) {
          const m = $("#user-menu");
          if (m) m.classList.remove("open");
        }
      });
    }
  } else {
    headerAuth.innerHTML = `
      <button class="btn btn-outline btn-sm" data-open-auth="login">${t("btn.login")}</button>
      <button class="btn btn-primary btn-sm" data-open-auth="register">${t("btn.register")}</button>`;
  }
  bindAuthTriggers();
}

/* ------------------- HEADER / FOOTER ------------------- */
function renderHeader() {
  const host = $("#site-header");
  if (!host) return;

  const page = document.body.dataset.page || "home";
  const cat = param("cat") || "";
  const catLinks = CATEGORIES.map(
    (c) => `<a href="index.html?cat=${c.id}" class="${cat === c.id ? "active" : ""}">${c.icon} ${catName(c.id)}</a>`
  ).join("");
  const langToggle = CURRENT_LANG === "en" ? "VI" : "EN";

  host.innerHTML = `
  <div class="topbar">
    <div class="container topbar-inner">
      <div class="topbar-left">
        <a href="#"><span class="tb-icon">🏪</span> ${t("topbar.seller")}</a>
        <span class="sep"></span>
        <a href="#"><span class="tb-icon">📱</span> ${t("topbar.app")}</a>
        <span class="sep"></span>
        <a href="#" class="hide-sm"><span class="tb-icon">🌐</span> ${t("topbar.connect")}</a>
      </div>
      <div class="topbar-right">
        <a href="orders.html"><span class="tb-icon">🔔</span> ${t("topbar.notify")}</a>
        <a href="#" class="hide-sm"><span class="tb-icon">❓</span> ${t("topbar.help")}</a>
        <a href="#" data-lang-toggle title="Change language">🌐 ${t("lang.switch")}</a>
        <span class="sep hide-sm"></span>
        <span id="topbar-auth"></span>
      </div>
    </div>
  </div>

  <header class="main-header">
    <div class="container">
      <div class="header-inner">
        <a class="logo" href="index.html" aria-label="MineShopee">
          <span class="logo-mark">⛏️</span>
          <span class="logo-text"><span class="logo-name">Mine<em>Shopee</em></span><small>${t("site.tagline")}</small></span>
        </a>

        <div class="search-wrap">
          <form class="search-bar" id="search-form" role="search">
            <input id="search-input" name="q" type="search" autocomplete="off"
              placeholder="${t("search.placeholder")}"
              value="${escapeHtml(param("q") || "")}">
            <button type="submit" aria-label="${t("nav.home")}">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                <circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.6-3.6"></path>
              </svg>
            </button>
          </form>
          <div class="search-tags">
            <a href="index.html?q=lunar">${t("search.tag1")}</a>
            <a href="index.html?q=hack client">${t("search.tag2")}</a>
            <a href="index.html?q=cape">${t("search.tag3")}</a>
            <a href="index.html?q=fps">${t("search.tag4")}</a>
            <a href="index.html?q=tài khoản">${t("search.tag5")}</a>
            <a href="index.html?q=modpack">${t("search.tag6")}</a>
          </div>
        </div>

        <div class="header-actions">
          <a class="cart-link" href="cart.html" aria-label="${t("cart.pageTitle")}">
            <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="20" r="1.6"></circle><circle cx="18" cy="20" r="1.6"></circle>
              <path d="M2 3h3l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"></path>
            </svg>
            <span class="cart-badge">0</span>
          </a>
          <div class="auth-btns" id="header-auth"></div>
        </div>
      </div>
    </div>
    <nav class="cat-nav">
      <div class="container cat-nav-inner">
        <a href="index.html" class="${page === "home" && !cat && !param("q") ? "active" : ""}">🏠 ${t("nav.home")}</a>
        <a href="index.html?q=flash" class="hot">⚡ ${t("nav.flash")}</a>        ${catLinks}
        <a href="orders.html">📦 ${t("nav.orders")}</a>
        ${page !== "admin" ? `<a href="admin.html" class="admin-link">🛠️ ${t("nav.admin")}</a>` : ""}
      </div>
    </nav>
  </header>`;

  updateCartBadge();
  renderAuth();
  bindAuthTriggers();
  const langBtn = $("[data-lang-toggle]", host);
  if (langBtn) {
    langBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setLang(CURRENT_LANG === "en" ? "vi" : "en");
    });
  }

  const form = $("#search-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#search-input").value.trim();
    if (page === "home") {
      const url = new URL(location.href);
      if (q) url.searchParams.set("q", q);
      else url.searchParams.delete("q");
      url.searchParams.delete("cat");
      try {
        history.pushState({}, "", url);
      } catch (err) {
        /* file:// có thể chặn pushState - bỏ qua, vẫn lọc bình thường */
      }
      window.dispatchEvent(new CustomEvent("ms:search", { detail: { q } }));
    } else {
      location.href = "index.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    }
  });
}

function renderFooter() {
  const host = $("#site-footer");
  if (!host) return;
  host.innerHTML = `
  <div class="container">
    <div class="footer-top">
      <div class="footer-col">
        <h4>${t("footer.cs")}</h4>
        <a href="#">${t("footer.help")}</a>
        <a href="orders.html">${t("footer.buy")}</a>
        <a href="#">${t("footer.pay")}</a>
        <a href="#">${t("footer.warranty")}</a>
        <a href="#">${t("footer.return")}</a>
      </div>
      <div class="footer-col">
        <h4>${t("footer.about")}</h4>
        <a href="#">${t("footer.intro")}</a>
        <a href="#">${t("footer.job")}</a>
        <a href="#">${t("footer.privacy")}</a>
        <a href="#">${t("footer.tos")}</a>
        <a href="#">${t("footer.contact2")}</a>
      </div>
      <div class="footer-col">
        <h4>${t("footer.cats")}</h4>
        <a href="index.html?cat=pvp">${t("cat.pvp")}</a>
        <a href="index.html?cat=survival">${t("cat.survival")}</a>
        <a href="index.html?cat=mod">${t("cat.mod")}</a>
        <a href="index.html?cat=account">${t("cat.account")}</a>
        <a href="index.html?cat=service">${t("cat.service")}</a>
      </div>
      <div class="footer-col">
        <h4>${t("footer.payment")}</h4>
        <div class="footer-pay">
          <span>VISA</span><span>Mastercard</span><span>Momo</span>
          <span>ZaloPay</span><span>VNPay</span><span>MinePay</span>
        </div>
        <h4 style="margin-top:16px">${t("footer.follow")}</h4>
        <a href="#">Facebook</a>
        <a href="#">Discord</a>
        <a href="#">TikTok</a>
      </div>
      <div class="footer-col">
        <h4>Liên hệ</h4>
        <p>📧 support@mineshopee.vn</p>
        <p>☎️ 1900 1234 (8:00 - 22:00)</p>
        <p>📍 123 Nguyễn Văn Cừ, Q.5, TP.HCM</p>
        <p style="font-size:11px;color:#999">${t("footer.demo")}</p>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="copy">© 2026 <strong>MineShopee</strong> - ${t("footer.copy")}</div>
      <div>${t("footer.inspired")}</div>
    </div>
  </div>`;
}

/* ------------------- MODAL ĐĂNG NHẬP ------------------- */
function mountAuthModal() {
  if ($("#auth-modal")) return;
  const wrap = document.createElement("div");
  wrap.className = "modal-mask";
  wrap.id = "auth-modal";
  wrap.innerHTML = `
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
    <div class="modal-head">
      <h3 id="auth-title">${t("btn.login")}</h3>
      <button class="modal-close" type="button" aria-label="Đóng">✕</button>
    </div>
    <div class="modal-body">
      <div class="tabs">
        <button class="tab-btn active" data-tab="login" type="button">${t("btn.login")}</button>
        <button class="tab-btn" data-tab="register" type="button">${t("btn.register")}</button>
      </div>

      <form id="login-form" autocomplete="on">
        <div class="form-error" id="login-error"></div>
        <div class="field">
          <label for="login-user">Tên đăng nhập</label>
          <input id="login-user" placeholder="Ví dụ: demo" required autocomplete="username">
        </div>
        <div class="field">
          <label for="login-pass">Mật khẩu</label>
          <input id="login-pass" type="password" placeholder="••••••" required autocomplete="current-password">
        </div>
        <button class="btn btn-primary btn-block btn-lg" type="submit">${t("btn.login")}</button>
        <p class="auth-alt">${t("auth.demohint")}: <b>demo</b> / <b>123456</b></p>
      </form>

      <form id="register-form" class="hidden">
        <div class="form-error" id="register-error"></div>
        <div class="field">
          <label for="reg-name">Tên hiển thị</label>
          <input id="reg-name" placeholder="Nguyễn Văn A" required>
        </div>
        <div class="field">
          <label for="reg-user">Tên đăng nhập</label>
          <input id="reg-user" placeholder="Tối thiểu 3 ký tự" required autocomplete="username">
        </div>
        <div class="field">
          <label for="reg-pass">Mật khẩu</label>
          <input id="reg-pass" type="password" placeholder="Tối thiểu 6 ký tự" required autocomplete="new-password">
        </div>
        <div class="field">
          <label for="reg-pass2">Nhập lại mật khẩu</label>
          <input id="reg-pass2" type="password" placeholder="Nhập lại mật khẩu" required autocomplete="new-password">
        </div>
        <button class="btn btn-primary btn-block btn-lg" type="submit">Tạo tài khoản</button>
      </form>
    </div>
  </div>`;
  document.body.appendChild(wrap);

  const modal = $("#auth-modal");
  const title = $("#auth-title");
  const tabs = $$(".tab-btn", modal);

  function switchTab(name) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    $("#login-form").classList.toggle("hidden", name !== "login");
    $("#register-form").classList.toggle("hidden", name !== "register");
    title.textContent = name === "login" ? t("btn.login") : t("btn.register");
    $$(".form-error", modal).forEach((e) => e.classList.remove("show"));
  }

  tabs.forEach((t) => t.addEventListener("click", () => switchTab(t.dataset.tab)));
  $(".modal-close", modal).addEventListener("click", closeAuth);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAuth();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAuth();
  });

  $("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const res = login($("#login-user").value.trim(), $("#login-pass").value);
    if (!res.ok) {
      const err = $("#login-error");
      err.textContent = res.message;
      err.classList.add("show");
      return;
    }
    closeAuth();
    toast(t("login.ok"), "success");
  });

  $("#register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const pass = $("#reg-pass").value;
    const err = $("#register-error");
    if (pass !== $("#reg-pass2").value) {
      err.textContent = t("reg.mismatch");
      err.classList.add("show");
      return;
    }
    const res = register($("#reg-user").value.trim(), pass, $("#reg-name").value.trim());
    if (!res.ok) {
      err.textContent = res.message;
      err.classList.add("show");
      return;
    }
    closeAuth();
    toast(t("reg.ok"), "success");
  });

  window.__switchAuthTab = switchTab;
}

function openAuth(tab = "login") {
  mountAuthModal();
  const modal = $("#auth-modal");
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  if (window.__switchAuthTab) window.__switchAuthTab(tab);
  setTimeout(() => {
    const input = tab === "register" ? $("#reg-name") : $("#login-user");
    if (input) input.focus();
  }, 60);
}
function closeAuth() {
  const modal = $("#auth-modal");
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
}
function bindAuthTriggers() {
  $$("[data-open-auth]").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openAuth(btn.dataset.openAuth || "login");
    });
  });
}

/* ------------------- KHỞI ĐỘNG ------------------- */
document.addEventListener("DOMContentLoaded", () => {
  document.body.dataset.page = document.body.dataset.page || "home";
  renderHeader();
  renderFooter();
  mountAuthModal();
  renderAuth();
  updateCartBadge();

  // đồng bộ giỏ hàng giữa các tab
  window.addEventListener("storage", (e) => {
    if (e.key === KEYS.cart) updateCartBadge();
  });

  // nút "lên đầu trang" cho trang dài
  const top = document.createElement("button");
  top.id = "back-top";
  top.innerHTML = "↑";
  top.setAttribute("aria-label", "Lên đầu trang");
  top.style.cssText =
    "position:fixed;right:18px;bottom:20px;width:42px;height:42px;border-radius:50%;border:1px solid #eee;background:#fff;color:#ee4d2d;font-size:20px;box-shadow:0 6px 18px rgba(0,0,0,.12);display:none;z-index:120;";
  document.body.appendChild(top);
  top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => {
    top.style.display = window.scrollY > 600 ? "block" : "none";
  });

  // nút yêu thích (dùng chung mọi trang)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-wish]");
    if (!btn) return;
    e.preventDefault();
    toggleWish(btn.dataset.wish, btn);
  });
});

/* ------------------- CARD SẢN PHẨM ------------------- */
function cardHTML(p) {
  const wished = isWished(p.id);
  return `
  <article class="product-card">
    <a class="thumb" href="product.html?id=${p.id}" aria-label="${escapeHtml(p.name)}">
      <img src="${p.thumb}" alt="${escapeHtml(p.name)}" loading="lazy">
      ${p.discount ? `<div class="ribbon">${p.discount}%<small>${t("flash.raid")}</small></div>` : ""}
      ${(p.badges || []).includes("Flash Sale") ? `<div class="promo-badge">⚡ Flash Sale - Giao key tự động</div>` : ""}
    </a>
    <button class="wish-btn ${wished ? "active" : ""}" data-wish="${p.id}"
      title="${wished ? t("wish.remove") : t("wish.add")}" aria-label="${t("wish.add")}">${wished ? "♥" : "♡"}</button>
    <div class="p-card-body">
      <a class="p-name" href="product.html?id=${p.id}">${escapeHtml(p.name)}</a>
      <div class="p-price-row">
        <span class="p-price">${money(p.price)}</span>
        ${p.oldPrice > p.price ? `<span class="p-old">${money(p.oldPrice)}</span>` : ""}
      </div>
      <div class="p-meta">
        <span class="p-stars">${stars(p.rating)}</span>
        <span>${p.rating.toFixed(1)}</span>
        <span class="p-sold">${t("sold")} ${soldText(p.sold)}</span>
      </div>
      <div class="p-shop">
        ${p.mall ? `<span class="tag-mall">${t("tag.mall")}</span>` : p.fav ? `<span class="tag-fav">${t("tag.fav")}</span>` : ""}
        <span>${escapeHtml(p.shop)}</span>
        <span class="p-loc">📍 ${escapeHtml(p.location)}</span>
      </div>
    </div>
  </article>`;
}

