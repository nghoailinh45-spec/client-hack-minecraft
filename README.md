# ⛏️ MineShopee — Sàn bán Minecraft Hack Client + Dịch vụ Setup Server (giao diện kiểu Shopee)

Website demo bán **Minecraft hack client / mod / cape / tài khoản game / thuê setup server** với
giao diện lấy cảm hứng từ Shopee. Toàn bộ chạy **thuần HTML/CSS/JavaScript**, không cần build.

Dữ liệu (giỏ hàng, tài khoản, số dư MinePay, đơn hàng, key client) lưu ở `localStorage`.

---

## 🚀 Cách chạy

**Cách 1 — mở trực tiếp:** mở `index.html` bằng Chrome / Edge / Firefox.

**Cách 2 — server tĩnh (khuyến nghị):**

```bash
cd mineshopee
python -m http.server 8765
# mở http://localhost:8765
```

---

## 👤 Tài khoản demo

| Tên đăng nhập | Mật khẩu | Quyền | Số dư MinePay |
|---|---|---|---|
| `demo` | `123456` | Khách hàng | 1.000.000₫ |
| `admin` | `admin123` | Quản trị (truy cập `admin.html`) | — |

> Tài khoản mới đăng ký được tặng sẵn 500.000₫ MinePay.
> **Chưa đăng nhập vẫn xem/thêm giỏ hàng. Cần đăng nhập + đủ tiền MinePay mới đặt được hàng.**

---

## ✨ Tính năng chính

### 🧊 Hack client — mặt hàng số
- Danh mục **Hack Client PvP** (Rift Hack, Phantom Hack, Nebula...), Client Survival, Modpack, Cape & Skin, Tài khoản Game.
- Mỗi đơn hàng khi mua **sinh tự động**: 🔑 key kích hoạt, 📥 link tải client, 🔐 tài khoản + mật khẩu game.
- Vào **Đơn mua → bấm vào sản phẩm đã mua** → hiện modal "Kho Client": tên client, nút tải, key và
  **thông tin acc game** (user/pass) kèm nút sao chép + cảnh bảo mật ("không chia sẻ cho ai").

### 💎 Ví MinePay — không đủ tiền là không mua được
- Mỗi user có **số dư MinePay** riêng (hiện ngay trên chip tài khoản).
- Giỏ hàng kiểm tra số dư: thiếu tiền → **chặn mua**, hiện "Cần thêm xxx", có nút **Nạp MinePay**.
- Đặt hàng thành công → trừ số dư ngay. Admin huỷ đơn → hệ thống **hoàn tiền** cho khách.
- Nạp tiền: nút trong giỏ hàng hoặc admin nạp trực tiếp trong Panel quản trị.

### 🎟️ Mã giảm giá
- `MINE10` — giảm 10% (tối đa 50K), `NEWBIE30` — giảm 30K, `WELCOME50` — giảm 50K cho đơn từ 200K.
- **Đã xoá mã freeship** — toàn bộ mặt hàng là key số, không thu phí vận chuyển.

### 🛠️ Dịch vụ thuê server Minecraft
- 3 gói ở danh mục "Dịch vụ Setup Server": Setup cơ bản (Paper + 10 plugins), Setup Pro
  (host 1 tháng + anti-DDoS + panel), Thuê host theo tháng (2/6/12GB RAM).
- Đơn dịch vụ sinh **ticket SV-XXXX**; kỹ thuật viên "liên hệ đặt lịch" trong modal Kho Client.

### 🛠️ Panel quản trị (`admin.html`)
Đăng nhập bằng `admin / admin123`. Có 4 tab, **tự động cập nhật realtime** (storage event):
1. **Tổng quan** — doanh thu, doanh thu tháng này, tổng đơn, tổng user, số key đã bán.
2. **Quản lý người dùng** — bảng user: số dư, số đơn + chi tiêu, vai trò; nút Nạp tiền (+500K),
   Phong làm admin / hạ xuống user, Xoá tài khoản.
3. **Thống kê bán hàng theo tháng** — biểu đồ cột + bảng 6 tháng gần nhất (đơn, key, doanh thu)
   tự động gom nhóm theo `createdAt` của từng đơn.
4. **Quản lý đơn hàng** — hoàn thành / huỷ đơn (kèm hoàn tiền ví).

### 🌐 Đa ngôn ngữ (VI ⇄ EN)
- Nút **🌐 Tiếng Việt / English** ở topbar, lưu lựa chọn trong `ms_lang`.
- Toàn bộ UI chrome (header, footer, giỏ hàng, thanh toán, admin, kho client...) đổi ngôn ngữ;
  danh mục có tên song song cho từng ngôn ngữ.

### Trang chủ / chi tiết / giỏ hàng / đơn mua
- Banner carousel, danh mục nhanh, **Flash Sale** đếm ngược, voucher sao chép, bộ lọc + sắp xếp.
- Chi tiết sản phẩm: gallery, biến thể (gói 1 tháng / 1 năm / vĩnh viễn), đánh giá, cam kết.
- Giỏ hàng: chọn từng món, đổi số lượng, xoá, áp dụng voucher, kiểm tra số dư, modal thanh toán.
- Đơn mua: lọc trạng thái, huỷ, mua lại, **mở Kho Client** để nhận key/link/acc.

---

## 📁 Cấu trúc

```
mineshopee/
├── index.html              # Trang chủ
├── product.html            # Chi tiết sản phẩm
├── cart.html               # Giỏ hàng + modal thanh toán + nạp MinePay
├── orders.html             # Đơn mua + Kho Client (link tải & acc game)
├── admin.html              # Panel quản trị (chỉ admin)
├── assets/
│   ├── css/style.css       # Giao diện + responsive + admin + kho client
│   └── js/
│       ├── data.js         # Sản phẩm, danh mục, voucher, sinh key/link/acc
│       ├── i18n.js         # Đa ngôn ngữ VI/EN
│       ├── app.js          # Header/footer, auth, ví MinePay, đơn + trạng thái
│       ├── home.js         # Banner, flash sale, bộ lọc
│       ├── product.js      # Trang chi tiết
│       ├── cart.js         # Giỏ hàng, voucher, kiểm tra số dư, tạo đơn
│       ├── orders.js       # Đơn mua + modal Kho Client
│       └── admin.js        # Panel quản trị & thống kê theo tháng
└── README.md
```

---

## 🗝️ Thuộc tính sản phẩm mới (data.js)

```js
{
  id: "rift-hack",
  cat: "pvp",                 // pvp|survival|mod|cosmetic|account = giao KEY (+link +acc)
                              // service = giao TICKET dịch vụ (setup server)
  delivery: "license",        // được chuẩn hoá tự động theo cat
  variants: [...],            // gói giá
}
```

Khi đặt hàng, mỗi sản phẩm nhận một mảng `assets` (đính vào đơn):
- key phép: key `MC-XXXX-XXXX-XXXX`, `downloadUrl` trên CDN demo, `username` + `password` acc game.
- dịch vụ: `ticket: "SV-XXXXXXXX"`.

## 🗃️ Key localStorage

| Key | Nội dung |
|---|---|
| `ms_cart` / `ms_users` / `ms_user` | Giỏ hàng / danh sách user (có `wallet`, `role`) / đang đăng nhập |
| `ms_orders` / `ms_wish` / `ms_voucher` | Đơn có `assets`, key/link/acc / yêu thích / voucher đang chọn |
| `ms_lang` | `vi` hoặc `en` |

---

## ⚠️ Lưu ý

- Website **demo học tập**, không giao dịch thật; mật khẩu còn lưu thô trong localStorage.
- Cần backend thật: API + hash mật khẩu + cổng thanh toán (Momo, VNPay, Stripe...).
- Tên client/shop/review là hư cấu; không liên quan Shopee, Mojang hay các client thương mại.
- Link tải trong demo là link giả (`cdn.mineshopee.vn`) — thay bằng link thật khi triển khai.
# client-hack-minecraft
