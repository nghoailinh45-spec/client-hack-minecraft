/* =========================================================
   PANEL QUẢN TRỊ - quản lý user, thống kê bán hàng theo tháng
   (chỉ tài khoản có role = "admin" mới vào được)
   ========================================================= */

const ADMIN_STATE = { tab: "dash" };

document.addEventListener("DOMContentLoaded", initAdmin);

function initAdmin() {
  applyStaticI18n();
  $("#admin-title-text").textContent = t("admin.title");

  renderAdmin();
  $("#admin-tabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-atab]");
    if (!btn) return;
    ADMIN_STATE.tab = btn.dataset.atab;
    $$("#admin-tabs button").forEach((b) => b.classList.toggle("active", b === btn));
    renderAdmin();
  });

  // đăng nhập/đăng xuất → render lại panel ngay lập tức
  window.addEventListener("ms:auth", renderAdmin);

  // tự cập nhật realtime khi đơn hàng/điểm dữ liệu thay đổi ở tab khác
  window.addEventListener("storage", (e) => {
    if ([KEYS.orders, KEYS.users, KEYS.cart].includes(e.key)) renderAdmin();
  });
}

function renderAdmin() {
  const root = $("#admin-root");
  const user = currentUser();
  if (!user || userRole(user) !== "admin") {
    root.innerHTML = `
      <div class="admin-locked">
        <div class="big">🔐</div>
        <h3>${t("admin.loginRequired")}</h3>
        <button class="btn btn-primary btn-lg" type="button" id="admin-open-login">${t("btn.login")}</button>
      </div>`;
    const btn = $("#admin-open-login");
    if (btn) btn.addEventListener("click", () => openAuth("login"));
    return;
  }

  if (ADMIN_STATE.tab === "dash") renderDash(root);
  else if (ADMIN_STATE.tab === "users") renderUsers(root);
  else if (ADMIN_STATE.tab === "sales") renderSales(root);
  else renderAdminOrders(root);
}

/* ------------------- TỔNG QUAN ------------------- */
function adminMetrics() {
  const orders = readLS(KEYS.orders, []);
  const users = getUsers();
  const valid = orders.filter((o) => o.status !== "Đã huỷ");
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const keys = valid.reduce((s, o) => s + o.items.reduce((x, i) => x + (i.assets || []).filter((a) => !a.service).length, 0), 0);
  const now = new Date();
  const monthKey = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  const monthRevenue = valid
    .filter((o) => monthOf(o.createdAt) === monthKey)
    .reduce((s, o) => s + o.total, 0);
  return { orders, users, revenue, keys, monthRevenue, orderCount: orders.length, userCount: users.length };
}

function monthOf(ts) {
  const d = new Date(ts);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

function renderDash(root) {
  applyStaticI18n();
  const m = adminMetrics();
  const recent = m.orders.slice(0, 6);
  root.innerHTML = `
    <div class="admin-stats">
      <div class="stat-card"><span class="st-ico">💰</span><b>${money(m.revenue)}</b><span>${t("admin.dash.revenue")}</span></div>
      <div class="stat-card"><span class="st-ico">📅</span><b>${money(m.monthRevenue)}</b><span>${t("admin.dash.month")}</span></div>
      <div class="stat-card"><span class="st-ico">🧾</span><b>${m.orderCount}</b><span>${t("admin.dash.orders")}</span></div>
      <div class="stat-card"><span class="st-ico">👥</span><b>${m.userCount}</b><span>${t("admin.dash.users")}</span></div>
      <div class="stat-card"><span class="st-ico">🔑</span><b>${m.keys}</b><span>${t("admin.dash.library")}</span></div>
    </div>

    <div class="panel admin-recent">
      <div class="panel-head">${t("admin.dash.recent")}</div>
      <div class="panel-body">
        ${recent.length ? recent.map(orderRowHTML).join("") : `<p style="color:#999">${t("orders.empty")}</p>`}
      </div>
    </div>`;
}

function orderRowHTML(o) {
  const st = orderStatusInfo(o);
  return `
    <div class="admin-order-row">
      <span class="code">${o.code}</span>
      <span>${escapeHtml(o.ownerName || (o.customer && o.customer.name) || "—")}</span>
      <span>${formatDate(o.createdAt)}</span>
      <span class="amt">${money(o.total)}</span>
      <span class="status-pill ${st.cls}">${st.label}</span>
    </div>`;
}

/* ------------------- THỐNG KÊ BÁN HÀNG THEO THÁNG ------------------- */
function monthlyStats() {
  const orders = readLS(KEYS.orders, []).filter((o) => o.status !== "Đã huỷ");
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    months.push({ key, label: `${t("common.months")[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, revenue: 0, orders: 0, keys: 0 });
  }
  const byKey = Object.fromEntries(months.map((m) => [m.key, m]));
  orders.forEach((o) => {
    const key = monthOf(o.createdAt);
    if (!byKey[key]) return;
    byKey[key].revenue += o.total;
    byKey[key].orders += 1;
    byKey[key].keys += o.items.reduce((x, i) => x + (i.assets || []).filter((a) => !a.service).length, 0);
  });
  return months;
}

function renderSales(root) {
  applyStaticI18n();
  const stats = monthlyStats();
  const max = Math.max(1, ...stats.map((s) => s.revenue));
  root.innerHTML = `
    <div class="panel">
      <div class="panel-head">${t("admin.sales.title")}</div>
      <div class="panel-body">
        <p class="muted" style="margin:0 0 16px">${t("admin.sales.note")}</p>

        <div class="sales-chart">
          ${stats.map((s) => `
            <div class="bar-col">
              <span class="bar-val">${s.revenue ? money(s.revenue) : ""}</span>
              <div class="bar-track"><i style="height:${Math.round((s.revenue / max) * 100)}%"></i></div>
              <span class="bar-month">${s.label}</span>
            </div>`).join("")}
        </div>

        <table class="spec-table admin-sales-table" style="margin-top:18px">
          <thead>
            <tr><th>${t("admin.sales.month")}</th><th>${t("admin.sales.orders")}</th><th>${t("admin.sales.keys")}</th><th>${t("admin.sales.revenue")}</th></tr>
          </thead>
          <tbody>
            ${stats.map((s) => `<tr><td><b>${s.label}</b></td><td>${s.orders}</td><td>${s.keys}</td><td>${money(s.revenue)}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;
}

/* ------------------- QUẢN LÝ NGƯỜI DÙNG ------------------- */
function renderUsers(root) {
  applyStaticI18n();
  const users = getUsers();
  const orders = readLS(KEYS.orders, []);
  root.innerHTML = `
    <div class="panel">
      <div class="panel-head">${t("admin.tab.users")}</div>
      <div class="panel-body admin-users-wrap">
        <div class="admin-users-table">
          <div class="au-row au-head">
            <span>${t("admin.users.name")}</span><span>${t("admin.users.display")}</span>
            <span>${t("admin.users.balance")}</span><span>${t("admin.users.orders")}</span><span>${t("admin.users.role")}</span>
            <span>${t("admin.users.actions")}</span>
          </div>
          ${users.map((u) => {
            const mine = orders.filter((o) => (o.owner || "").toLowerCase() === u.username.toLowerCase() && o.status !== "Đã huỷ");
            const spent = mine.reduce((s, o) => s + o.total, 0);
            const roleTxt = u.role === "admin" ? t("common.role.admin") : t("common.role.user");
            return `
            <div class="au-row">
              <span><b>${escapeHtml(u.username)}</b></span>
              <span>${escapeHtml(u.name || "")}</span>
              <span class="amt">${money(u.wallet || 0)}</span>
              <span>${mine.length} (${money(spent)})</span>
              <span>${u.role === "admin" ? "🛠️ " + roleTxt : "👤 " + roleTxt}</span>
              <span class="au-actions">
                <button class="btn btn-soft btn-sm" data-topup="${escapeHtml(u.username)}" type="button">💎 ${t("admin.users.topup")}</button>
                <button class="btn btn-plain btn-sm" data-role="${escapeHtml(u.username)}" data-newrole="${u.role === "admin" ? "user" : "admin"}" type="button">
                  ${u.role === "admin" ? t("admin.users.setuser") : t("admin.users.setadmin")}
                </button>
                ${u.username === "admin" ? "" : `<button class="btn btn-plain btn-sm danger" data-deluser="${escapeHtml(u.username)}" type="button">🗑️</button>`}
              </span>
            </div>`;
          }).join("")}
        </div>
        <p class="muted" style="font-size:12px">💡 ${t("topup.hint")}</p>
      </div>
    </div>`;

  bindUserActions();
}

function bindUserActions() {
  const root = $("#admin-root");
  if (root.dataset.actionsBound) return;
  root.dataset.actionsBound = "1";

  root.addEventListener("click", (e) => {
    const topup = e.target.closest("[data-topup]");
    if (topup) {
      const amount = 500000;
      creditWallet(topup.dataset.topup, amount);
      toast(`Đã nạp ${money(amount)} cho ${topup.dataset.topup}`, "success");
      renderAdmin();
      return;
    }

    const role = e.target.closest("[data-role]");
    if (role) {
      const users = getUsers();
      const u = findStoredUser(role.dataset.role);
      if (u) {
        u.role = role.dataset.newrole;
        writeLS(KEYS.users, users);
        toast(`Đã gán vai trò ${role.dataset.newrole === "admin" ? "quản trị" : "khách hàng"} cho ${u.username}`, "success");
      }
      renderAdmin();
      return;
    }

    const del = e.target.closest("[data-deluser]");
    if (del) {
      if (!confirm(`${t("admin.users.confirmDelete")}: ${del.dataset.deluser}?`)) return;
      const users = getUsers().filter((u) => u.username.toLowerCase() !== del.dataset.deluser.toLowerCase());
      writeLS(KEYS.users, users);
      toast("Đã xoá tài khoản " + del.dataset.deluser);
      renderAdmin();
      return;
    }

    const done = e.target.closest("[data-order-done]");
    if (done) {
      const orders = readLS(KEYS.orders, []);
      const o = orders.find((x) => x.code === done.dataset.orderDone);
      if (o) o.status = "Hoàn thành";
      writeLS(KEYS.orders, orders);
      toast("Đơn " + done.dataset.orderDone + " → Hoàn thành", "success");
      renderAdmin();
      return;
    }

    const ocancel = e.target.closest("[data-order-cancel]");
    if (ocancel) {
      const orders = readLS(KEYS.orders, []);
      const o = orders.find((x) => x.code === ocancel.dataset.orderCancel);
      if (o && o.status !== "Đã huỷ") {
        // hoàn tiền cho khách khi admin huỷ
        const owner = o.owner || (o.customer && o.customer.username) || null;
        if (owner) creditWallet(owner, o.total);
        o.status = "Đã huỷ";
      }
      writeLS(KEYS.orders, orders);
      toast("Đã huỷ đơn " + ocancel.dataset.orderCancel + (o.owner ? " (đã hoàn tiền MinePay)" : ""));
      renderAdmin();
      return;
    }
  });
}

/* ------------------- QUẢN LÝ ĐƠN HÀNG ------------------- */
function renderAdminOrders(root) {
  applyStaticI18n();
  const orders = readLS(KEYS.orders, []);
  root.innerHTML = `
    <div class="panel">
      <div class="panel-head">${t("admin.tab.orders")}</div>
      <div class="panel-body">
        ${orders.length ? orders.map((o) => `
          <div class="admin-order-row admin-order-manage">
            <span class="code">${o.code}</span>
            <span>${escapeHtml(o.ownerName || (o.customer && o.customer.name) || "—")}</span>
            <span>${formatDate(o.createdAt)}</span>
            <span class="amt">${money(o.total)}</span>
            <span class="status-pill ${orderStatusInfo(o).cls}">${orderStatusInfo(o).label}</span>
            <span class="au-actions">
              ${o.status !== "Hoàn thành" ? `<button class="btn btn-soft btn-sm" data-order-done="${o.code}" type="button">✅ ${t("admin.orders.setDone")}</button>` : ""}
              ${o.status !== "Đã huỷ" ? `<button class="btn btn-plain btn-sm danger" data-order-cancel="${o.code}" type="button">${t("orders.cancel")}</button>` : ""}
            </span>
          </div>`).join("") : `<p style="color:#999">${t("orders.empty")}</p>`}
      </div>
    </div>`;
}
