/* =========================================================
   MineShopee - Dữ liệu sản phẩm (Minecraft Clients)
   ========================================================= */

const CATEGORIES = [
  { id: "pvp", name: "Hack Client PvP", icon: "⚔️" },
  { id: "survival", name: "Client Survival", icon: "🌲" },
  { id: "mod", name: "Mod & Modpack", icon: "🧩" },
  { id: "cosmetic", name: "Cape & Skin", icon: "🧥" },
  { id: "account", name: "Tài khoản Game", icon: "🎮" },
  { id: "service", name: "Dịch vụ Setup Server", icon: "🛠️" },
];

/* Tạo ảnh thumbnail bằng SVG (không cần internet) */
function makeThumb(p, index = 0) {
  const icons = [p.emoji, "⛏️", "🧱", "💎"];
  const icon = icons[index % icons.length];
  const tag = index === 0 ? "MINECRAFT • JAVA" : ["PvP READY", "FULL MOD", "PREMIUM"][index % 3];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${p.c1}"/>
        <stop offset="1" stop-color="${p.c2}"/>
      </linearGradient>
      <pattern id="px" width="48" height="48" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="#ffffff" opacity="0.07"/>
        <rect x="24" y="24" width="24" height="24" fill="#000000" opacity="0.06"/>
      </pattern>
    </defs>
    <rect width="600" height="600" fill="url(#g)"/>
    <rect width="600" height="600" fill="url(#px)"/>
    <circle cx="500" cy="80" r="170" fill="#ffffff" opacity="0.08"/>
    <circle cx="70" cy="540" r="140" fill="#000000" opacity="0.12"/>
    <text x="300" y="320" font-size="210" text-anchor="middle" dominant-baseline="middle">${icon}</text>
    <text x="300" y="468" font-size="34" font-weight="700" text-anchor="middle"
      font-family="Segoe UI, Arial, sans-serif" fill="#ffffff">${escapeXml(p.short)}</text>
    <text x="300" y="508" font-size="19" letter-spacing="3" text-anchor="middle"
      font-family="Segoe UI, Arial, sans-serif" fill="#ffffff" opacity="0.75">${tag}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
  }[c]));
}

const PRODUCTS = [
  {
    id: "rift-hack",
    name: "Rift Hack Client Premium · Glow ESP, KillAura chuẩn 1.8.9 & 1.21",
    short: "RIFT HACK",
    cat: "pvp", emoji: "🜲", c1: "#7e22ce", c2: "#db2777",
    variants: [
      { name: "Gói 1 Tháng", price: 59000, oldPrice: 119000 },
      { name: "Gói 1 Năm", price: 189000, oldPrice: 379000 },
      { name: "Vĩnh Viễn (Lifetime)", price: 299000, oldPrice: 599000 },
    ],
    sold: 1450, rating: 4.9, ratingCount: 512,
    shop: "Rift Team", mall: true, fav: true, location: "TP. Hồ Chí Minh",
    badges: ["Flash Sale", "Chính hãng"],
    desc: "Rift Hack Client là bản hack client nổi tiếng của cộng đồng PvP: KillAura mượt, Glow ESP nhìn xuyên tường, anti-knockback tinh chỉnh được... Cập nhật bypass mới mỗi tuần.",
    features: [
      "KillAura, Velocity, Criticals tinh chỉnh mượt",
      "Glow ESP / Chest ESP nhìn xuyên tường",
      "Bypass Hypixel & server Việt Nam cập nhật tuần",
      "GUI phân loại module rõ ràng, config chia sẻ 1 click",
    ],
    specs: [["Phiên bản", "1.8.9 - 1.21.4"], ["Hệ điều hành", "Windows 10/11"], ["Mod hack", "70+"], ["Kích hoạt", "Key bản quyền"]],
  },
  {
    id: "phantom-hack",
    name: "Phantom Hack Client VIP - Aim thần tốc cho Bedwars & Skywars",
    short: "PHANTOM HACK",
    cat: "pvp", emoji: "👻", c1: "#1e293b", c2: "#06b6d4",
    variants: [
      { name: "Gói 1 Tháng", price: 65000, oldPrice: 129000 },
      { name: "Gói 1 Năm", price: 199000, oldPrice: 399000 },
    ],
    sold: 920, rating: 4.8, ratingCount: 305,
    shop: "Phantom Guild", mall: true, fav: true, location: "Hà Nội",
    badges: ["Bán chạy"],
    desc: "Phantom Hack Client chuyên dùng cho Bedwars, Skywars: AimAssist dịu, Scaffold chuẩn nhịp, auto bridge dựa theo ping server. Đi kèm config tuyển thủ.",
    features: [
      "AimAssist dịu, không bị phát hiện bởi replay",
      "Scaffold + Godbridge theo ping server",
      "Chống crash & chống kick khi combat dài",
      "Kèm 5 config tuyển thủ PvP sẵn",
    ],
    specs: [["Phiên bản", "1.8.9 / 1.12.2 / 1.20+"], ["Hệ điều hành", "Windows 10/11"], ["Mod hack", "85+"], ["Bảo hành", "12 tháng"]],
  },
  {
    id: "nebula-pro",
    name: "Nebula Client Pro - Client PvP mượt nhất cho 1.8.9 & 1.21",
    short: "NEBULA CLIENT",
    cat: "pvp", emoji: "🌌", c1: "#7c3aed", c2: "#22d3ee",
    variants: [
      { name: "Gói 1 Tháng", price: 39000, oldPrice: 79000 },
      { name: "Gói 1 Năm", price: 149000, oldPrice: 299000 },
      { name: "Vĩnh Viễn (Lifetime)", price: 249000, oldPrice: 499000 },
    ],
    sold: 1240, rating: 4.9, ratingCount: 386,
    shop: "Nebula Studio", mall: true, fav: true, location: "TP. Hồ Chí Minh",
    badges: ["Flash Sale", "Chính hãng"],
    desc: "Nebula Client Pro là client PvP được tối ưu riêng cho cộng đồng Minecraft Việt Nam. FPS ổn định, hit registration mượt, kho mod đồ sộ và giao diện cực nhẹ. Hỗ trợ 1.8.9 cho PvP và 1.21 cho survival.",
    features: [
      "Tối ưu FPS, giảm lag tới 60% so với bản gốc",
      "Kho mod PvP: CPS, Keystrokes, Reach Display, Armor HUD...",
      "Cập nhật miễn phí trọn đời gói đang dùng",
      "Hỗ trợ 1.8.9 - 1.21.4, cài đặt 1 click",
    ],
    specs: [["Phiên bản", "1.8.9 - 1.21.4"], ["Hệ điều hành", "Windows / macOS"], ["Ram đề nghị", "4GB+"], ["Kích hoạt", "Key bản quyền"]],
  },
  {
    id: "vortex-elite",
    name: "Vortex Client Elite - Combo PvP + Reach Display + Cape",
    short: "VORTEX ELITE",
    cat: "pvp", emoji: "⚡", c1: "#ef4444", c2: "#f59e0b",
    variants: [
      { name: "Gói 1 Tháng", price: 49000, oldPrice: 99000 },
      { name: "Gói 1 Năm", price: 179000, oldPrice: 329000 },
      { name: "Vĩnh Viễn (Lifetime)", price: 299000, oldPrice: 599000 },
    ],
    sold: 2100, rating: 4.8, ratingCount: 642,
    shop: "Vortex Team", mall: true, fav: true, location: "Hà Nội",
    badges: ["Bán chạy"],
    desc: "Vortex Client Elite dành cho các game thủ PvP chuyên nghiệp. Tích hợp sẵn cape động, mod chỉnh tay, profile riêng cho từng server và chế độ chống crash khi combat.",
    features: [
      "Profile riêng cho từng server (Hypixel, Việt Nam, v.v.)",
      "Cape động + wings hiệu ứng độc quyền",
      "Mod chỉnh tay, autoclicker hợp lệ theo luật server",
      "Hỗ trợ cài đặt qua TeamViewer miễn phí",
    ],
    specs: [["Phiên bản", "1.8.9 / 1.12.2 / 1.20+"], ["Hệ điều hành", "Windows 10/11"], ["Số mod", "120+"], ["Bảo hành", "12 tháng"]],
  },
  {
    id: "aurora-plus",
    name: "Aurora Client Plus - Client Survival đẹp, nhẹ, nhiều mod",
    short: "AURORA PLUS",
    cat: "survival", emoji: "🌸", c1: "#ec4899", c2: "#8b5cf6",
    variants: [
      { name: "Gói 1 Tháng", price: 35000, oldPrice: 69000 },
      { name: "Gói 1 Năm", price: 119000, oldPrice: 239000 },
      { name: "Vĩnh Viễn (Lifetime)", price: 199000, oldPrice: 399000 },
    ],
    sold: 860, rating: 4.8, ratingCount: 214,
    shop: "Aurora Labs", mall: false, fav: true, location: "Đà Nẵng",
    badges: ["Mới"],
    desc: "Aurora Client Plus mang tới trải nghiệm survival nhẹ nhàng với shader đẹp, minimap, inventory tweak và hàng trăm mod xây dựng. Phù hợp cả máy yếu.",
    features: [
      "Shader + resource pack tối ưu sẵn",
      "Mod xây dựng: Litematica, WorldEdit, Schematic",
      "Minimap, waypoint, tọa độ thông minh",
      "Chế độ tiết kiệm pin cho laptop",
    ],
    specs: [["Phiên bản", "1.16 - 1.21.4"], ["Hệ điều hành", "Windows / macOS / Linux"], ["Ram đề nghị", "4GB+"], ["Kích hoạt", "Key bản quyền"]],
  },
  {
    id: "titan-lifetime",
    name: "Titan Client Lifetime - Mua 1 lần dùng mãi mãi",
    short: "TITAN CLIENT",
    cat: "pvp", emoji: "🛡️", c1: "#334155", c2: "#f59e0b",
    variants: [
      { name: "Gói 1 Năm", price: 199000, oldPrice: 399000 },
      { name: "Vĩnh Viễn (Lifetime)", price: 349000, oldPrice: 699000 },
    ],
    sold: 530, rating: 4.7, ratingCount: 158,
    shop: "Titan Store", mall: false, fav: false, location: "TP. Hồ Chí Minh",
    badges: ["Giá tốt"],
    desc: "Titan Client là lựa chọn của các bạn trẻ yêu PvP với ngân sách hợp lý. Bản Lifetime không giới hạn thiết bị, chuyển máy thoải mái, bảo hành 24 tháng.",
    features: [
      "Không giới hạn thiết bị, đổi máy không mất key",
      "Bảo hành 24 tháng, 1 đổi 1 nếu lỗi",
      "Kho mod PvP + Bridge + Bedwars",
      "Hỗ trợ Zalo 24/7",
    ],
    specs: [["Phiên bản", "1.8.9 - 1.20.4"], ["Hệ điều hành", "Windows"], ["Kích hoạt", "Key bản quyền"], ["Bảo hành", "24 tháng"]],
  },
  {
    id: "frostbyte",
    name: "Frostbyte Client - FPS cao, chống lag cho máy yếu",
    short: "FROSTBYTE",
    cat: "pvp", emoji: "❄️", c1: "#06b6d4", c2: "#2563eb",
    variants: [
      { name: "Gói 1 Tháng", price: 45000, oldPrice: 89000 },
      { name: "Gói 1 Năm", price: 129000, oldPrice: 259000 },
      { name: "Vĩnh Viễn (Lifetime)", price: 219000, oldPrice: 439000 },
    ],
    sold: 980, rating: 4.9, ratingCount: 301,
    shop: "Frostbyte VN", mall: true, fav: true, location: "Hải Phòng",
    badges: ["Flash Sale"],
    desc: "Frostbyte tối ưu cực sâu cho máy cấu hình thấp. Chỉ 2GB RAM vẫn chơi mượt 120+ FPS ở chế độ PvP, tự động dọn bộ nhớ và chống tụt frame.",
    features: [
      "Chạy mượt trên máy 2GB RAM",
      "Tự động dọn RAM, chống tụt FPS",
      "Chế độ Low-End siêu nhẹ",
      "Cập nhật theo từng bản Minecraft",
    ],
    specs: [["Phiên bản", "1.8.9 - 1.21"], ["Ram đề nghị", "2GB+"], ["Hệ điều hành", "Windows 7+"], ["Kích hoạt", "Key bản quyền"]],
  },
  {
    id: "ender-premium",
    name: "EnderClient Premium - Survival & Skyblock toàn diện",
    short: "ENDER CLIENT",
    cat: "survival", emoji: "🟣", c1: "#4c1d95", c2: "#0f172a",
    variants: [
      { name: "Gói 1 Tháng", price: 39000, oldPrice: 79000 },
      { name: "Gói 1 Năm", price: 139000, oldPrice: 279000 },
      { name: "Vĩnh Viễn (Lifetime)", price: 229000, oldPrice: 459000 },
    ],
    sold: 740, rating: 4.6, ratingCount: 187,
    shop: "Ender Shop", mall: false, fav: false, location: "Cần Thơ",
    badges: [],
    desc: "EnderClient Premium tập trung vào survival, skyblock và farming. Tích hợp sẵn mod nông trại, auto-sort rương, thống kê tài nguyên và giao diện tối.",
    features: [
      "Mod nông trại, auto-sort, chest tracker",
      "Giao diện tối chống mỏi mắt",
      "Hỗ trợ Skyblock, OneBlock, SMP",
      "Đồng bộ cài đặt qua tài khoản",
    ],
    specs: [["Phiên bản", "1.12 - 1.21.4"], ["Hệ điều hành", "Windows / macOS"], ["Số mod", "90+"], ["Kích hoạt", "Key bản quyền"]],
  },
  {
    id: "shadow-vip",
    name: "Shadow Client VIP - Client PvP cho Bedwars & Bridge",
    short: "SHADOW VIP",
    cat: "pvp", emoji: "🌑", c1: "#111827", c2: "#6b7280",
    variants: [
      { name: "Gói 1 Tháng", price: 55000, oldPrice: 109000 },
      { name: "Gói 1 Năm", price: 169000, oldPrice: 319000 },
      { name: "Vĩnh Viễn (Lifetime)", price: 279000, oldPrice: 559000 },
    ],
    sold: 1420, rating: 4.8, ratingCount: 429,
    shop: "Shadow Guild", mall: true, fav: true, location: "TP. Hồ Chí Minh",
    badges: ["Yêu thích"],
    desc: "Shadow Client VIP là client quốc dân cho Bedwars và Bridge. Mod xếp block thông minh, keystroke mượt, chống lag khi đánh nhau và cape độc quyền.",
    features: [
      "Mod Bedwars: block counter, team tracker",
      "Keystroke, CPS, ping hiển thị cực mượt",
      "Chống lag khi combat 1v1",
      "Cape + wings độc quyền cho VIP",
    ],
    specs: [["Phiên bản", "1.8.9 / 1.20.4"], ["Hệ điều hành", "Windows 10/11"], ["Số mod", "100+"], ["Bảo hành", "12 tháng"]],
  },
  {
    id: "pixelforge",
    name: "PixelForge Client - Build & sáng tạo không giới hạn",
    short: "PIXELFORGE",
    cat: "mod", emoji: "🧱", c1: "#b45309", c2: "#fbbf24",
    variants: [
      { name: "Gói 1 Tháng", price: 29000, oldPrice: 59000 },
      { name: "Gói 1 Năm", price: 99000, oldPrice: 199000 },
      { name: "Vĩnh Viễn (Lifetime)", price: 169000, oldPrice: 339000 },
    ],
    sold: 610, rating: 4.7, ratingCount: 143,
    shop: "PixelForge", mall: false, fav: true, location: "Bình Dương",
    badges: [],
    desc: "PixelForge dành cho builder: Litematica, WorldEdit, Axiom, camera góc rộng và bảng màu block thông minh. Xây nhà đẹp nhanh gấp 3 lần.",
    features: [
      "Litematica + WorldEdit + Axiom tích hợp",
      "Camera góc rộng, chụp ảnh build",
      "Bảng màu & block palette thông minh",
      "Preset shader cho ảnh build đẹp",
    ],
    specs: [["Phiên bản", "1.19 - 1.21.4"], ["Hệ điều hành", "Windows / macOS"], ["Ram đề nghị", "8GB+"], ["Kích hoạt", "Key bản quyền"]],
  },
  {
    id: "solar-client",
    name: "Solar Client - Client survival nhẹ cho laptop văn phòng",
    short: "SOLAR CLIENT",
    cat: "survival", emoji: "☀️", c1: "#f59e0b", c2: "#f97316",
    variants: [
      { name: "Gói 1 Tháng", price: 42000, oldPrice: 84000 },
      { name: "Gói 1 Năm", price: 132000, oldPrice: 264000 },
      { name: "Vĩnh Viễn (Lifetime)", price: 225000, oldPrice: 450000 },
    ],
    sold: 395, rating: 4.6, ratingCount: 96,
    shop: "Solar Studio", mall: false, fav: false, location: "Nghệ An",
    badges: [],
    desc: "Solar Client siêu nhẹ, khởi động dưới 5 giây, phù hợp laptop văn phòng. Vẫn đầy đủ mod survival cơ bản và giao diện sáng dễ nhìn.",
    features: [
      "Khởi động dưới 5 giây",
      "Dung lượng chỉ 80MB",
      "Mod survival cơ bản, dễ dùng",
      "Giao diện sáng, chữ lớn",
    ],
    specs: [["Phiên bản", "1.16 - 1.21"], ["Dung lượng", "80MB"], ["Hệ điều hành", "Windows"], ["Kích hoạt", "Key bản quyền"]],
  },
  {
    id: "neptune-client",
    name: "Neptune Client - PvP 1.8.9 chuẩn hit, chống ghost hit",
    short: "NEPTUNE",
    cat: "pvp", emoji: "🌊", c1: "#0284c7", c2: "#0ea5e9",
    variants: [
      { name: "Gói 1 Tháng", price: 52000, oldPrice: 99000 },
      { name: "Gói 1 Năm", price: 159000, oldPrice: 299000 },
      { name: "Vĩnh Viễn (Lifetime)", price: 269000, oldPrice: 529000 },
    ],
    sold: 1120, rating: 4.8, ratingCount: 352,
    shop: "Neptune Store", mall: true, fav: true, location: "TP. Hồ Chí Minh",
    badges: ["Bán chạy"],
    desc: "Neptune nổi tiếng với hit registration chuẩn và khả năng chống ghost hit cực tốt. Được nhiều tuyển thủ PvP Việt Nam tin dùng.",
    features: [
      "Hit registration chuẩn 1.8.9",
      "Chống ghost hit, chống lag spike",
      "Mod PvP nâng cao: combo counter, reach",
      "Profile tuyển thủ có sẵn",
    ],
    specs: [["Phiên bản", "1.8.9"], ["Hệ điều hành", "Windows 10/11"], ["Số mod", "80+"], ["Bảo hành", "12 tháng"]],
  },
  {
    id: "optifps-pack",
    name: "OptiFPS Boost Pack 1.21 - Tăng FPS miễn phí trọn đời",
    short: "OPTIFPS PACK",
    cat: "mod", emoji: "🚀", c1: "#10b981", c2: "#0d9488",
    variants: [{ name: "Bản tiêu chuẩn", price: 19000, oldPrice: 39000 }],
    sold: 3400, rating: 4.8, ratingCount: 780,
    shop: "FPS Lab", mall: false, fav: true, location: "Toàn quốc",
    badges: ["Flash Sale", "Giá sốc"],
    desc: "Bộ mod tối ưu FPS cho Minecraft 1.21, tương thích Fabric & Forge. Cài xong tăng 40-80% FPS tùy máy, không ảnh hưởng gameplay.",
    features: [
      "Tăng 40-80% FPS tùy cấu hình",
      "Tương thích Fabric & Forge",
      "Không ảnh hưởng hit registration",
      "Hướng dẫn cài chi tiết từng bước",
    ],
    specs: [["Phiên bản", "1.20 - 1.21.4"], ["Dung lượng", "12MB"], ["Cập nhật", "Miễn phí"], ["Hỗ trợ", "Zalo / Discord"]],
  },
  {
    id: "modpack-survival",
    name: "Modpack Survival Plus - 100+ mod, cài sẵn chơi ngay",
    short: "SURVIVAL PLUS",
    cat: "mod", emoji: "🎒", c1: "#65a30d", c2: "#a16207",
    variants: [{ name: "Bản đầy đủ", price: 25000, oldPrice: 59000 }],
    sold: 1800, rating: 4.7, ratingCount: 402,
    shop: "ModVN", mall: false, fav: true, location: "TP. Hồ Chí Minh",
    badges: ["Bán chạy"],
    desc: "Modpack survival hơn 100 mod: nông trại, du hành, boss, hang động mới... Cài sẵn chỉ việc chơi, kèm server hướng dẫn.",
    features: [
      "100+ mod tuyển chọn, không xung đột",
      "Cài sẵn, giải nén là chơi",
      "Kèm hướng dẫn + server test",
      "Hỗ trợ cập nhật modpack",
    ],
    specs: [["Phiên bản", "1.20.1"], ["Số mod", "100+"], ["Ram đề nghị", "6GB+"], ["Kích thước", "1.2GB"]],
  },
  {
    id: "shader-ultra",
    name: "Shaders Ultra Realistic Pack - Đồ họa điện ảnh",
    short: "ULTRA SHADERS",
    cat: "mod", emoji: "✨", c1: "#6366f1", c2: "#ec4899",
    variants: [{ name: "Pack 12 shader", price: 15000, oldPrice: 35000 }],
    sold: 2600, rating: 4.9, ratingCount: 610,
    shop: "Shader Hub", mall: false, fav: true, location: "Toàn quốc",
    badges: ["Flash Sale"],
    desc: "Bộ 12 shader đẹp nhất: BSL, Complementary, SEUS, Kappa... đã tinh chỉnh sẵn cho máy yếu đến mạnh, kèm preset chụp ảnh.",
    features: [
      "12 shader nổi tiếng, đã tinh chỉnh",
      "Preset riêng cho máy yếu / máy mạnh",
      "Kèm hướng dẫn cài Iris / Optifine",
      "Cập nhật shader mới miễn phí",
    ],
    specs: [["Phiên bản", "1.16 - 1.21.4"], ["Số shader", "12"], ["Ram đề nghị", "4GB+"], ["Định dạng", ".zip"]],
  },
  {
    id: "cape-nebula",
    name: "Cape Nebula - Thiết kế độc quyền, gắn mọi client",
    short: "CAPE NEBULA",
    cat: "cosmetic", emoji: "🧣", c1: "#8b5cf6", c2: "#06b6d4",
    variants: [
      { name: "Cape tĩnh", price: 25000, oldPrice: 49000 },
      { name: "Cape động (Animated)", price: 45000, oldPrice: 89000 },
    ],
    sold: 700, rating: 4.8, ratingCount: 164,
    shop: "CapeCraft", mall: false, fav: true, location: "Hà Nội",
    badges: ["Mới"],
    desc: "Cape Nebula lấy cảm hứng từ dải ngân hà, tương thích mọi client phổ biến. File PNG chuẩn 64x32, gắn bằng mod cape hoặc Lunar/Badlion.",
    features: [
      "File PNG chuẩn 64x32, sắc nét",
      "Tương thích mọi client có mod cape",
      "Hỗ trợ chỉnh màu theo yêu cầu",
      "Tặng kèm hướng dẫn gắn cape",
    ],
    specs: [["Định dạng", "PNG 64x32"], ["Loại", "Cape / Cloak"], ["Tương thích", "Mọi client"], ["Giao hàng", "Tự động qua email"]],
  },
  {
    id: "cape-dragon",
    name: "Cape Fire Dragon - Cape động rực lửa, hiệu ứng đẹp",
    short: "FIRE DRAGON",
    cat: "cosmetic", emoji: "🔥", c1: "#dc2626", c2: "#f59e0b",
    variants: [{ name: "Cape động 8 frame", price: 45000, oldPrice: 89000 }],
    sold: 420, rating: 4.7, ratingCount: 98,
    shop: "DragonCape", mall: false, fav: false, location: "Đồng Nai",
    badges: ["Hot"],
    desc: "Cape rồng lửa 8 frame chuyển động mượt, phát sáng trong bóng tối. Được thiết kế riêng, không bán đại trà.",
    features: [
      "8 frame chuyển động mượt",
      "Hiệu ứng phát sáng ban đêm",
      "Thiết kế độc quyền, giới hạn số lượng",
      "Tặng kèm file PNG tĩnh",
    ],
    specs: [["Định dạng", "PNG 64x32 (8 frame)"], ["Loại", "Cape động"], ["Tương thích", "Lunar, Badlion, LabyMod"], ["Giao hàng", "Tự động qua email"]],
  },
  {
    id: "skin-custom",
    name: "Skin Custom theo yêu cầu - Vẽ riêng 1:1 trong 24h",
    short: "CUSTOM SKIN",
    cat: "cosmetic", emoji: "🎨", c1: "#ec4899", c2: "#14b8a6",
    variants: [
      { name: "Skin cơ bản", price: 59000, oldPrice: 119000 },
      { name: "Skin cao cấp + áo choàng", price: 99000, oldPrice: 199000 },
    ],
    sold: 310, rating: 4.9, ratingCount: 88,
    shop: "SkinArt VN", mall: false, fav: true, location: "TP. Hồ Chí Minh",
    badges: ["Yêu thích"],
    desc: "Đội ngũ artist vẽ skin Minecraft theo yêu cầu: nhân vật anime, nhân vật game, logo team... Giao trong 24h, sửa miễn phí 3 lần.",
    features: [
      "Vẽ tay 100%, không dùng template",
      "Giao trong 24h, nhận file PNG + preview",
      "Sửa miễn phí 3 lần",
      "Tặng kèm render 3D",
    ],
    specs: [["Định dạng", "PNG 64x64"], ["Thời gian", "24 giờ"], ["Sửa đổi", "3 lần miễn phí"], ["Giao hàng", "Email / Zalo"]],
  },
  {
    id: "mc-java-account",
    name: "Minecraft Java Edition - Tài khoản Full chính chủ",
    short: "JAVA ACCOUNT",
    cat: "account", emoji: "🎮", c1: "#4ade80", c2: "#a16207",
    variants: [
      { name: "Tài khoản Full (chính chủ)", price: 199000, oldPrice: 399000 },
      { name: "Tài khoản Full + đổi email", price: 259000, oldPrice: 499000 },
    ],
    sold: 890, rating: 4.6, ratingCount: 233,
    shop: "GameAcc Store", mall: true, fav: true, location: "TP. Hồ Chí Minh",
    badges: ["Chính hãng"],
    desc: "Tài khoản Minecraft Java Edition chính chủ, chơi được mọi server premium như Hypixel. Bảo hành 6 tháng, hỗ trợ đổi email sau khi mua.",
    features: [
      "Chơi được Hypixel, Mineplex, server premium",
      "Bảo hành 6 tháng 1 đổi 1",
      "Hỗ trợ đổi email, đổi mật khẩu",
      "Kích hoạt trên launcher chính thức",
    ],
    specs: [["Nền tảng", "PC Java Edition"], ["Bảo hành", "6 tháng"], ["Đổi email", "Có (gói cao cấp)"], ["Giao hàng", "Ngay sau thanh toán"]],
  },
  {
    id: "mc-bedrock-account",
    name: "Tài khoản Minecraft Bedrock + Java - Chơi mọi thiết bị",
    short: "BEDROCK + JAVA",
    cat: "account", emoji: "📱", c1: "#3b82f6", c2: "#22c55e",
    variants: [{ name: "Full quyền (Bedrock + Java)", price: 249000, oldPrice: 499000 }],
    sold: 460, rating: 4.7, ratingCount: 121,
    shop: "GameAcc Store", mall: true, fav: false, location: "TP. Hồ Chí Minh",
    badges: ["Chính hãng"],
    desc: "Tài khoản Microsoft sở hữu cả Minecraft Bedrock và Java. Chơi trên PC, điện thoại, Xbox, Switch chỉ với 1 tài khoản.",
    features: [
      "Sở hữu cả Bedrock & Java",
      "Chơi trên PC, mobile, console",
      "Đăng nhập bằng Microsoft, bảo mật 2 lớp",
      "Bảo hành 6 tháng",
    ],
    specs: [["Nền tảng", "PC / Mobile / Console"], ["Bảo hành", "6 tháng"], ["Đăng nhập", "Microsoft"], ["Giao hàng", "Ngay sau thanh toán"]],
  },
  {
    id: "nick-dep",
    name: "Tên Ingame Đẹp - Nick 3-4 ký tự, không số",
    short: "NICK ĐẸP",
    cat: "account", emoji: "🏷️", c1: "#eab308", c2: "#92400e",
    variants: [
      { name: "Nick 4 ký tự", price: 149000, oldPrice: 299000 },
      { name: "Nick 3 ký tự", price: 299000, oldPrice: 599000 },
    ],
    sold: 210, rating: 4.5, ratingCount: 57,
    shop: "Nick Store", mall: false, fav: false, location: "Hà Nội",
    badges: [],
    desc: "Kho nick Minecraft 3-4 ký tự, không số, dễ đọc. Kiểm tra nick trước khi mua, đổi tên ngay sau khi thanh toán.",
    features: [
      "Nick 3-4 ký tự, không số, không gạch",
      "Kiểm tra nick trực tiếp trước khi mua",
      "Hỗ trợ đổi tên ngay lập tức",
      "Bảo hành trùng nick",
    ],
    specs: [["Độ dài", "3-4 ký tự"], ["Ký tự", "Chữ cái, không số"], ["Bảo hành", "Trùng nick đổi mới"], ["Giao hàng", "Trong 2 giờ"]],
  },
  {
    id: "setup-1-1",
    name: "Setup Client + Mod 1:1 qua TeamViewer - Tận tay cài đặt",
    short: "SETUP 1:1",
    cat: "service", emoji: "🛠️", c1: "#475569", c2: "#3b82f6",
    variants: [{ name: "Gói cơ bản (30 phút)", price: 79000, oldPrice: 149000 }],
    sold: 150, rating: 4.9, ratingCount: 44,
    shop: "Setup VN", mall: false, fav: true, location: "Toàn quốc",
    badges: ["Uy tín"],
    desc: "Kỹ thuật viên kết nối TeamViewer cài đặt client, mod, shader, tối ưu FPS theo đúng nhu cầu. Cam kết chạy được mới tính tiền.",
    features: [
      "Cài qua TeamViewer, không cần rành máy",
      "Tối ưu theo cấu hình máy",
      "Hướng dẫn sử dụng sau khi cài",
      "Hoàn tiền nếu không chạy được",
    ],
    specs: [["Hình thức", "TeamViewer / UltraViewer"], ["Thời gian", "30-60 phút"], ["Hỗ trợ", "Zalo 24/7"], ["Hoàn tiền", "Nếu không chạy được"]],
  },
  {
    id: "fix-lag",
    name: "Cài đặt + Tối ưu FPS tận tay - Tăng FPS rõ rệt",
    short: "FIX LAG",
    cat: "service", emoji: "⚙️", c1: "#0d9488", c2: "#334155",
    variants: [{ name: "Gói tối ưu 45 phút", price: 49000, oldPrice: 99000 }],
    sold: 240, rating: 4.8, ratingCount: 72,
    shop: "FixLag VN", mall: false, fav: false, location: "Toàn quốc",
    badges: [],
    desc: "Chuyên fix lag, tăng FPS, giảm giật cho Minecraft. Làm qua UltraViewer, cam kết FPS tăng ít nhất 30% mới thu tiền.",
    features: [
      "Cam kết tăng ít nhất 30% FPS",
      "Dọn máy, tắt dịch vụ thừa an toàn",
      "Cài mod tối ưu phù hợp máy",
      "Bảo hành hỗ trợ 7 ngày",
    ],
    specs: [["Hình thức", "UltraViewer"], ["Thời gian", "45 phút"], ["Cam kết", "Tăng 30% FPS"], ["Bảo hành", "7 ngày"]],
  },
  {
    id: "combo-pvp-master",
    name: "Combo PvP Master - Client VIP + Cape + Mod Pack",
    short: "PvP MASTER",
    cat: "pvp", emoji: "⚔️", c1: "#f97316", c2: "#dc2626",
    variants: [{ name: "Combo 3 món", price: 299000, oldPrice: 699000 }],
    sold: 380, rating: 4.9, ratingCount: 102,
    shop: "PvP Master", mall: true, fav: true, location: "TP. Hồ Chí Minh",
    badges: ["Flash Sale", "Combo"],
    desc: "Combo tiết kiệm nhất: 1 client PvP VIP (1 năm), 1 cape động và 1 mod pack PvP đã tinh chỉnh. Tiết kiệm tới 57% so với mua lẻ.",
    features: [
      "Client VIP 1 năm + cape động + mod pack",
      "Tiết kiệm 57% so với mua lẻ",
      "Tặng kèm hướng dẫn PvP 1:1",
      "Hỗ trợ ưu tiên qua Discord",
    ],
    specs: [["Bao gồm", "Client + Cape + Modpack"], ["Thời hạn client", "12 tháng"], ["Bảo hành", "12 tháng"], ["Hỗ trợ", "Discord ưu tiên"]],
  },
  {
    id: "setup-server-basic",
    name: "Thuê Setup Server Minecraft Cơ bản - Paper 1.21 + 10 plugins",
    short: "SETUP SERVER",
    cat: "service", emoji: "🖥️", c1: "#16a34a", c2: "#0d9488",
    variants: [
      { name: "Gói Cơ bản (Paper + 10 plugins)", price: 199000, oldPrice: 399000 },
      { name: "Gói Nâng cao (25 plugins + permissions)", price: 299000, oldPrice: 599000 },
    ],
    sold: 180, rating: 4.9, ratingCount: 52,
    shop: "ServerVN Lab", mall: false, fav: true, location: "Toàn quốc",
    badges: ["Mới"],
    desc: "Dịch vụ thuê kỹ thuật viên setup server Minecraft trọn gói: cài Paper/Spigot 1.21, tối ưu RAM, cài plugins (Essentials, LuckPerms, WorldGuard...), mở port, chống lag.",
    features: [
      "Cài Paper / Spigot / Fabric theo yêu cầu",
      "Tuning server.properties + tối ưu RAM & CPU",
      "Cài plugins + cấu hình quyền từng nhóm",
      "Hướng dẫn vận hành panel sau khi bàn giao",
    ],
    specs: [["Loại", "Thuê setup server"], ["Core", "Paper / Spigot / Fabric"], ["Thời gian", "1-2 ngày"], ["Bảo hành", "7 ngày hậu kiểm"]],
  },
  {
    id: "setup-server-pro",
    name: "Thuê Setup Server Minecraft Pro - SMP/OneBlock + Anti-DDoS + Host 1 tháng",
    short: "SERVER PRO",
    cat: "service", emoji: "🌐", c1: "#2563eb", c2: "#4f46e5",
    variants: [
      { name: "Gói Pro (Host 1 tháng + Anti-DDoS)", price: 349000, oldPrice: 699000 },
      { name: "Gói Fullscale (Host 3 tháng + Domain)", price: 649000, oldPrice: 1299000 },
    ],
    sold: 95, rating: 4.8, ratingCount: 31,
    shop: "ServerVN Lab", mall: false, fav: true, location: "Toàn quốc",
    badges: ["Combo"],
    desc: "Gói dịch vụ thuê setup server trọn gói cho SMP/OneBlock/Survival community: host riêng 1 tháng, chống DDoS, panel quản lý, domain, backup tự động hằng ngày.",
    features: [
      "Host server riêng 1 tháng (khuyến nghị 8GB RAM)",
      "Anti-DDoS + firewall, uptime cam kết 99%",
      "Panel quản lý: start/stop/backup 1 click",
      "Backup tự động hằng ngày + hướng dẫn khôi phục",
    ],
    specs: [["Loại", "Thuê setup + host server"], ["Host tặng kèm", "1 / 3 tháng"], ["Kèm theo", "Panel + Backup + Domain"], ["Bảo hành", "14 ngày"]],
  },
  {
    id: "rent-host",
    name: "Thuê Host Server Minecraft 1 tháng - Chạy SMP, Bedwars, PvP cực mượt",
    short: "HOST 1 THÁNG",
    cat: "service", emoji: "☁️", c1: "#0ea5e9", c2: "#6366f1",
    variants: [
      { name: "Host 2GB RAM (10 người)", price: 89000, oldPrice: 179000 },
      { name: "Host 6GB RAM (40 người)", price: 179000, oldPrice: 349000 },
      { name: "Host 12GB RAM (100 người + IP riêng)", price: 349000, oldPrice: 699000 },
    ],
    sold: 240, rating: 4.7, ratingCount: 68,
    shop: "HostMC VN", mall: true, fav: false, location: "Toàn quốc",
    badges: ["Flash Sale"],
    desc: "Dịch vụ thuê host server Minecraft theo tháng: tích hợp panel Multicraft, cài sẵn Paper + Optimization, mở IP : Port cho bạn chơi cùng ngay sau 5 phút thanh toán.",
    features: [
      "Kích hoạt tức thì, IP:port dùng ngay",
      "Panel Multicraft: console, FTP, backup",
      "Cài sẵn Paper + tuning tối ưu FPS/TPS",
      " Hoàn tiền trong 24h nếu server không up được",
    ],
    specs: [["Loại", "Thuê host server"], ["Uptime", "99%"], ["Panel", "Multicraft"], ["Thời hạn", "30 ngày"]],
  },
];

/* Chuẩn hoá dữ liệu: giá thấp nhất, % giảm, ảnh */
PRODUCTS.forEach((p) => {
  p.variants = p.variants || [{ name: "Mặc định", price: p.price, oldPrice: p.oldPrice }];
  const cheapest = p.variants.reduce((a, b) => (b.price < a.price ? b : a), p.variants[0]);
  p.price = cheapest.price;
  p.oldPrice = cheapest.oldPrice || cheapest.price;
  p.discount = p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  p.thumbs = [0, 1, 2, 3].map((i) => makeThumb(p, i));
  p.thumb = p.thumbs[0];
  p.catName = (CATEGORIES.find((c) => c.id === p.cat) || {}).name || "Khác";
  /* Sản phẩm số: quy định kiểu giao hàng (key bản quyền hoặc dịch vụ setup) */
  p.delivery = ["pvp", "survival", "mod", "cosmetic", "account"].includes(p.cat) ? "license" : "service";
});

/* Sinh key / link tải / thông tin acc game cho từng sản phẩm khi đặt hàng */
function randomKey(prefix) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const gen = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return prefix + "-" + gen(4) + "-" + gen(4) + "-" + gen(4);
}
function randomPass() {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function makeOrderAssets(productId, variantIndex, qty) {
  const p = getProduct(productId);
  const v = (p && p.variants[variantIndex]) || (p && p.variants[0]);
  const units = [];
  const n = Math.max(1, Math.min(qty, 99));
  const ticketChars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  const gen = (n) => Array.from({ length: n }, () => ticketChars[Math.floor(Math.random() * ticketChars.length)]).join("");
  for (let i = 0; i < n; i++) {
    if (!p) {
      units.push({ serial: randomKey("MS") });
      continue;
    }
    if (p.delivery === "service") {
      units.push({
        service: true,
        label: v ? v.name : "Dịch vụ",
        ticket: "SV-" + gen(8),
      });
    } else {
      units.push({
        key: randomKey("MC"),
        downloadUrl: "https://cdn.mineshopee.vn/dl/" + p.id + "/" + randomKey("").toLowerCase().replace(/-/g, "") + ".zip",
        username: (p.id.split("-")[0].replace(/[^a-z]/g, "") || "player") + Math.floor(1000 + Math.random() * 9000),
        password: randomPass(),
        note: v ? v.name : "",
      });
    }
  }
  return units;
}

/* Mã giảm giá (đã bỏ mã freeship) */
const VOUCHERS = [
  { code: "MINE10", label: "Giảm 10%", desc: "Đơn từ 100K, tối đa 50K", type: "percent", value: 10, max: 50000, min: 100000 },
  { code: "NEWBIE30", label: "Giảm 30K", desc: "Đơn từ 99K cho khách mới", type: "fixed", value: 30000, min: 99000 },
  { code: "WELCOME50", label: "Giảm 50K", desc: "Đơn từ 200K, chào khách mới", type: "fixed", value: 50000, min: 200000 },
];

/* Đánh giá mẫu */
const REVIEW_NAMES = ["Nguyễn Minh Khoa", "Trần Bảo Long", "Lê Hoàng Nam", "Phạm Gia Huy", "Đỗ Thanh Tùng", "Vũ Đức Anh", "Bùi Quốc Bảo", "Hoàng Nhật Minh"];
const REVIEW_TEXTS = [
  "Client chạy mượt thật, FPS tăng rõ rệt so với bản gốc. Shop hỗ trợ nhiệt tình, cài giúp luôn qua TeamViewer.",
  "Key kích hoạt nhanh, dùng ổn định mấy tuần nay. Cape đẹp hơn mong đợi, sẽ ủng hộ tiếp.",
  "Máy mình hơi yếu mà cài xong vẫn 120 FPS, quá đáng tiền. Giao hàng tự động, nhận key trong 1 phút.",
  "Mod ổn, không xung đột gì. Shop tư vấn đúng nhu cầu, không bán thêm linh tinh. 5 sao.",
  "Mua lần 2 rồi, chất lượng vẫn vậy. Giá hợp lý cho học sinh, sinh viên.",
  "Hơi khó cài lúc đầu nhưng shop remote hỗ trợ tận tay nên ok. Trừ 1 sao vì chờ hơi lâu.",
];
