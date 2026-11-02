/* =========================================================
   MineShopee - Guard: bắt lỗi toàn cục + chống storage chặn
   Load ĐẦU TIÊN trong mọi trang. Nếu có lỗi nào xảy ra,
   một thanh đỏ sẽ hiện ngay trên màn hình (không chết im lặng).
   ========================================================= */

(function () {
  "use strict";

  // ---- 1. Phòng hộ storage: tor/private mode có thể chặn localStorage ----
  function safeStorage() {
    try {
      var s = window.localStorage;
      var probe = "__ms_probe__";
      s.setItem(probe, "1");
      s.removeItem(probe);
      return s;
    } catch (e) {
      // Storage bị chặn -> dùng bộ nhớ tạm (mất khi đóng trang, nhưng web vẫn chạy)
      var mem = {};
      return {
        getItem: function (k) { return k in mem ? mem[k] : null; },
        setItem: function (k, v) { mem[k] = String(v); },
        removeItem: function (k) { delete mem[k]; },
        clear: function () { mem = {}; },
        key: function (i) { return Object.keys(mem)[i] || null; },
        get length() { return Object.keys(mem).length; },
      };
    }
  }
  try {
    var safe = safeStorage();
    // Chỉ thay khi native không dùng được (defineProperty giữ nguyên giá trị đã lưu)
    var probeKey = "__ms_probe2__";
    var nativeOk = true;
    try {
      window.localStorage.setItem(probeKey, "1");
      window.localStorage.removeItem(probeKey);
    } catch (e) {
      nativeOk = false;
    }
    if (!nativeOk) {
      Object.defineProperty(window, "localStorage", { value: safe, configurable: true });
      try { Object.defineProperty(window, "sessionStorage", { value: safe, configurable: true }); } catch (e2) {}
      window.addEventListener("DOMContentLoaded", function () {
        var bar = document.createElement("div");
        bar.style.cssText = "background:#fff7e6;color:#a35400;padding:8px 16px;font-size:13px;text-align:center;border-bottom:1px solid #ffe1a8";
        bar.textContent = "⚠ Trình duyệt đang chặn lưu trữ (localStorage) — dữ liệu giỏ hàng/đăng nhập sẽ không được ghi nhớ sau khi đóng trang.";
        document.body.insertBefore(bar, document.body.firstChild);
      });
    }
  } catch (e) { /* im lặng */ }

  // ---- 2. Bắt lỗi global: hiện thanh đỏ thay vì chết im lặng ----
  var errBox = null;
  function showError(msg) {
    if (errBox) {
      var line = document.createElement("div");
      line.textContent = "→ " + msg;
      errBox.appendChild(line);
      return;
    }
    errBox = document.createElement("div");
    errBox.style.cssText = [
      "position:fixed", "top:0", "left:0", "right:0", "z-index:99999",
      "background:#dc2626", "color:#fff", "padding:10px 16px",
      "font:13px/1.5 monospace", "white-space:pre-wrap", "word-break:break-all"
    ].join(";");
    errBox.appendChild(document.createTextNode("⚠ Lỗi website MineShopee (báo lại lỗi này cho admin):"));
    var m = document.createElement("div");
    m.textContent = msg;
    errBox.appendChild(m);
    // Nút đóng để không che nội dung
    var close = document.createElement("button");
    close.textContent = "✕";
    close.style.cssText = "position:absolute;top:6px;right:10px;background:#fff;color:#dc2626;border:0;border-radius:4px;width:24px;height:24px;cursor:pointer;font-weight:700";
    close.onclick = function () { errBox.remove(); errBox = null; };
    errBox.appendChild(close);
    (document.body || document.documentElement).appendChild(errBox);
  }

  window.addEventListener("error", function (e) {
    if (e && e.message) {
      var src = e.filename ? " (" + e.filename.split("/").pop() + (e.lineno ? ":" + e.lineno : "") + ")" : "";
      showError(e.message + src);
    }
  });
  window.addEventListener("unhandledrejection", function (e) {
    var r = e && e.reason;
    showError("Promise: " + (r && r.message ? r.message : String(r)));
  });
})();
