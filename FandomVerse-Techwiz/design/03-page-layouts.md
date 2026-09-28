# FandomVerse — Page Layouts
**Version:** 1.0
**Tham chiếu:** [01-design-system.md](./01-design-system.md), [02-components.md](./02-components.md), route theo [../docs/usecase-specification.md](../docs/usecase-specification.md)

Mỗi trang mô tả: mục đích, layout Desktop (≥992px), điều chỉnh Tablet (768–991px), điều chỉnh Mobile (<576px), và các component sử dụng.

---

## 1. Home (`#/`)

**Mục đích:** ấn tượng đầu tiên, dẫn dắt nhanh tới 7 category + nội dung nổi bật.

### Desktop layout
```
┌───────────────────────────────────────────────────────────┐
│ NavBar (sticky)                                              │
├───────────────────────────────────────────────────────────┤
│ HERO SECTION (padding-y: --space-10, nền gradient           │
│   --color-primary → --color-accent nhẹ 8% opacity trên      │
│   --bg-body, hoặc ảnh minh họa collage bên phải)              │
│   fs-display: "Khám phá vũ trụ Fandom của bạn"                │
│   fs-body-lg: mô tả ngắn 1-2 dòng                              │
│   [Button lg Primary: "Khám phá ngay"]                          │
├───────────────────────────────────────────────────────────┤
│ SECTION: "Danh mục nổi bật" (fs-h2, căn giữa)                  │
│  [Grid 7 CategoryTile, 4 cột x 2 hàng desktop]                 │
│   mỗi tile: icon 32px + label, nền --bg-surface, border-left  │
│   4px màu accent riêng, hover translateY(-4px)                 │
├───────────────────────────────────────────────────────────┤
│ SECTION: "Nội dung nổi bật" (fs-h2 + link "Xem tất cả")        │
│  [Carousel ContentCard, 4 card/view desktop, autoplay 5s,      │
│   nút prev/next 2 bên]                                          │
├───────────────────────────────────────────────────────────┤
│ SECTION: "Trailer mới" (nền --bg-surface-alt full-width)        │
│  [Grid 3 TrailerCard]  [Button Secondary: "Xem tất cả Trailer"] │
├───────────────────────────────────────────────────────────┤
│ SECTION: "Sự kiện sắp tới"                                      │
│  [Danh sách ngang 3 EventCard]                                   │
├───────────────────────────────────────────────────────────┤
│ Footer                                                          │
└───────────────────────────────────────────────────────────┘
[ChatbotWidget launcher — cố định góc dưới-phải, luôn nổi trên mọi section]
```

### Tablet
- Grid CategoryTile: 3 cột x 3 hàng (7 items, ô cuối để trống hoặc canh giữa).
- Carousel: 2–3 card/view.

### Mobile
- Hero: ảnh minh họa ẩn hoặc thu nhỏ phía trên text, CTA full-width.
- CategoryTile: grid 2 cột.
- Carousel: 1 card/view, vuốt ngang (swipe).
- Section Trailer/Event: stack dọc, mỗi card full-width.

---

## 2. Category Hub (`#/category/:id`)

**Mục đích:** trung tâm khám phá 1 fandom — nội dung, nhân vật, sự kiện.

### Desktop layout
```
┌───────────────────────────────────────────────────────────┐
│ NavBar                                                        │
│ Breadcrumb: Home / Anime                                       │
├───────────────────────────────────────────────────────────┤
│ CATEGORY HEADER (nền --bg-surface-alt, border-left accent)     │
│   Icon lớn + fs-h1 "Anime" + fs-body-sm mô tả ngắn category     │
├───────────────────────────────────────────────────────────┤
│ TAB BAR: [Nội dung] [Nhân vật] [Sự kiện]  (sticky dưới header) │
├───────────────────────────────────────────────────────────┤
│ TAB "Nội dung":                                                │
│   [FilterSortBar: chip Type (All/Article/Gallery/Video/Audio) │
│    + Dropdown Sort]                                             │
│   [Grid ContentCard 4 cột]                                      │
├───────────────────────────────────────────────────────────┤
│ TAB "Nhân vật":                                                 │
│   [Dropdown filter Franchise]                                   │
│   [Grid CharacterCard 5-6 cột, card nhỏ hơn ContentCard]        │
├───────────────────────────────────────────────────────────┤
│ TAB "Sự kiện":                                                  │
│   [Toggle: Sắp diễn ra | Đã diễn ra]                             │
│   [List EventCard dọc]                                          │
├───────────────────────────────────────────────────────────┤
│ Footer                                                          │
└───────────────────────────────────────────────────────────┘
```
- Header đổi màu border-left/icon theo accent của category đang xem (7 màu ở §1.4 design-system).
- Click ảnh trong ContentCard type=gallery → mở LightboxGallery full overlay.

### Tablet
- Grid ContentCard: 3 cột. CharacterCard: 4 cột.
- Tab bar vẫn dạng ngang, có thể scroll ngang nếu chật.

### Mobile
- Tab bar chuyển thành segmented control full-width, chỉ hiện label ngắn.
- Grid ContentCard: 2 cột (hoặc 1 cột nếu ưu tiên đọc mô tả).
- Grid CharacterCard: 2 cột.
- FilterSortBar: filter chip scroll ngang (horizontal scroll), Sort dropdown thu gọn thành icon.

---

## 3. Search Results (`#/search?q=...`)

### Desktop
```
NavBar (search bar đã có sẵn giá trị query)
Breadcrumb: Home / Kết quả tìm kiếm "naruto"
┌─────────────┬─────────────────────────────────────┐
│ SIDEBAR      │  "Tìm thấy 12 kết quả cho 'naruto'"   │
│ Filter:       │  [Grid kết quả — mix ContentCard/    │
│ - Category    │   CharacterCard/MerchCard theo type] │
│   (checkbox)  │                                        │
│ - Type        │                                        │
│   (checkbox)  │                                        │
└─────────────┴─────────────────────────────────────┘
Footer
```
- Sidebar width cố định 260px, sticky khi cuộn.
- Empty state khi không có kết quả: icon kính lúp mờ + "Không tìm thấy kết quả phù hợp" + gợi ý category nổi bật.

### Tablet/Mobile
- Sidebar filter chuyển thành nút "Bộ lọc" mở Offcanvas/Bottom-sheet chứa checkbox filter.
- Kết quả: grid 2 cột (tablet) / 1 cột (mobile).

---

## 4. Trailers Hub (`#/trailers`)

### Desktop
```
NavBar / Breadcrumb: Home / Trailers
Page title fs-h1 "Trailer Hub" + mô tả ngắn
[FilterSortBar: chip Category (All/Anime/Gaming/...) + Toggle Upcoming/Released]
[Grid TrailerCard 3 cột — card lớn hơn ContentCard, thumbnail 16:9 nổi bật, badge status góc trên-trái]
```
### Tablet/Mobile
- Grid: 2 cột (tablet) / 1 cột (mobile), filter category chip scroll ngang.

---

## 5. Merchandise (`#/merchandise`)

### Desktop
```
NavBar / Breadcrumb: Home / Merchandise
┌─────────────┬─────────────────────────────────────┐
│ Filter sidebar│ [FilterSortBar phụ: Sort theo giá]    │
│ - Category    │ [Grid MerchCard 4 cột]                 │
│ - ProductType │                                          │
└─────────────┴─────────────────────────────────────┘
[CartDrawer trigger: icon 🛒 ở NavBar mở Offcanvas — không phải section riêng trên trang]
Footer
```
- MerchCard "Add to Cart" → micro-interaction: icon giỏ hàng ở NavBar "nảy nhẹ" (scale 1.2 → 1, 200ms) + toast "Đã thêm vào giỏ hàng".

### Tablet
- Grid 3 cột, filter sidebar → Offcanvas trên nút "Bộ lọc".

### Mobile
- Grid 2 cột, CartDrawer mở full-screen (thay vì offcanvas hẹp).

---

## 6. Bookmarks (`#/bookmarks`)

### Desktop
```
NavBar / Breadcrumb: Home / Bookmarks của tôi
Page title fs-h1 "Bookmarks của tôi"  [Button Secondary: "Xuất ra file .txt"] (góc phải)
[Tab: Tất cả | Nội dung | Nhân vật | Sự kiện | Merchandise]
[List item dạng row: Ảnh nhỏ trái - Tiêu đề/loại giữa - [Textarea note thu gọn] - icon bookmark(xóa) phải]
```
- Mỗi row có thể expand để lộ ô "Ghi chú cá nhân" (textarea, auto-save khi blur, hiển thị "đã lưu" nhỏ).
- Empty state: "Bạn chưa lưu nội dung nào" + Button Primary "Khám phá ngay" → Home.

### Tablet/Mobile
- Row chuyển thành Card dọc (ảnh trên, nội dung dưới), note textarea luôn hiển thị (không cần expand) để dễ thao tác chạm.
- Nút Export chuyển xuống dưới cùng danh sách, full-width trên mobile.

---

## 7. Contact Us (`#/contact`) & About Us (`#/about`)

### Layout chung (đơn giản, tĩnh)
```
NavBar / Breadcrumb
Page title fs-h1
┌─────────────┬─────────────────────┐
│ Nội dung text │ [Google Maps iframe]  │  ← chỉ Contact có bản đồ
│ (fs-body-lg)  │  bo góc --radius-md    │
└─────────────┴─────────────────────┘
Footer
```
- About: 1 cột nội dung căn giữa max-width 800px, có thể thêm section "Đội ngũ thực hiện" dạng avatar row nếu cần.
- Mobile: 2 cột → stack dọc, bản đồ full-width height 240px.

---

## 8. Login (`#/login`) / Signup (`#/signup`) — Dummy UI

### Layout (giống nhau, khác field)
```
┌───────────────────────────────┐
│      [Logo FandomVerse]         │
│      fs-h2 "Đăng nhập"           │
│      [Input Email]               │
│      [Input Password]            │
│      [Button lg Primary full-width: "Đăng nhập"] │
│      fs-body-sm: "Chế độ demo — không lưu dữ liệu thật" │
│      Link phụ: "Chưa có tài khoản? Đăng ký" → #/signup   │
└───────────────────────────────┘
```
- Form căn giữa màn hình, nền `--bg-surface`, card max-width 420px, `--radius-lg`, `--shadow-md`, đặt trên nền `--bg-body` (có thể thêm hoạ tiết mờ fandom phía sau cho vui mắt).
- Submit → hiển thị Toast "Đây là chế độ demo, không xử lý đăng nhập thật" (không điều hướng đi đâu, không gọi network).

### Mobile
- Card chiếm full-width trừ margin 16px, không đổi cấu trúc field.

---

## 9. Quy tắc responsive chung áp dụng mọi trang
- Mọi Grid card dùng CSS Grid/Bootstrap Row-Col với `gap: --space-4` (mobile) / `--space-5` (desktop).
- Mọi section cách nhau tối thiểu `--space-6` (mobile) / `--space-8` (desktop) theo trục dọc.
- NavBar mobile luôn ưu tiên: Logo + icon Search/Cart/Menu — không nhồi nhét text category ra ngoài (đã chuyển vào Offcanvas).
- ChatbotWidget luôn giữ vị trí cố định góc dưới-phải ở mọi trang/breakpoint, không che nút quan trọng (margin-bottom đủ lớn để không đè lên CTA cuối trang trên mobile).
