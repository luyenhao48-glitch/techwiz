# FandomVerse — Component Library Spec
**Version:** 1.0
**Tham chiếu token:** [01-design-system.md](./01-design-system.md)

---

## 1. Button

### 1.1 Biến thể

| Variant | Nền | Chữ | Border | Dùng cho |
|---|---|---|---|---|
| **Primary** | `--color-primary`, hover `--color-primary-dark` | `--text-on-primary` | none | CTA chính: "Explore Now", "Search", "Send" (chatbot) |
| **Accent** | `--color-accent`, hover đậm 10% | `--text-on-primary` | none | "Add to Cart", nút giá tiền nổi bật |
| **Secondary (Outline)** | transparent, hover `--color-primary-light` | `--color-primary` | 1.5px `--color-primary` | "View Details", "Filter", nút phụ cạnh Primary |
| **Ghost/Text** | transparent | `--text-secondary`, hover `--color-primary` | none | "Cancel", link trong modal, breadcrumb |
| **Danger** | transparent, hover `--color-danger` nền nhạt | `--color-danger` | 1px `--color-danger` | "Remove" (cart/bookmark) |
| **Icon button** | transparent, hover `--bg-surface-alt` tròn | icon `--text-secondary`/`--color-primary` khi active | none | Bookmark, cart icon, đóng modal, next/prev lightbox |

### 1.2 Kích thước

| Size | Height | Padding ngang | Font size | Dùng cho |
|---|---|---|---|---|
| `lg` | 52px | 28px | `--fs-body-lg` (18px), weight 600 | Hero CTA |
| `md` (mặc định) | 44px | 20px | `--fs-body` (16px), weight 500 | CTA thông thường, form submit |
| `sm` | 36px | 14px | `--fs-body-sm` (14px), weight 500 | Nút trong card, filter chip |

### 1.3 Trạng thái
- **Default / Hover / Active(pressed)**: theo bảng biến thể ở trên, hover luôn có `transition: 150ms`.
- **Focus-visible**: outline 2px `--color-primary`, offset 2px (bắt buộc — accessibility keyboard nav).
- **Disabled**: opacity 0.5, `cursor: not-allowed`, không có hover effect.
- **Loading** (khi cần, vd submit form dummy): thay label bằng spinner nhỏ (Bootstrap spinner), giữ nguyên kích thước nút.

### 1.4 Bo góc
- Nút CTA chính (Primary/Accent, `lg`/`md`): `--radius-pill` (bo tròn hoàn toàn) — tạo cảm giác thân thiện, mềm mại.
- Nút phụ/icon button: `--radius-md`.

---

## 2. Card

### 2.1 ContentCard (article / gallery / video / audio)
```
┌─────────────────────────────┐
│ [Thumbnail 16:9]  [♡ bookmark]│ ← icon bookmark nổi góc trên-phải trên ảnh
│                    [▶ badge]  │ ← badge play icon nếu type=video/audio, góc dưới-trái ảnh
├─────────────────────────────┤
│ [Badge Category màu accent]  │
│ Tiêu đề (fs-h4, 2 dòng max)   │
│ Mô tả ngắn (fs-body-sm, 2 dòng, ellipsis) │
│ 🕒 dateAdded        [Xem thêm →]│
└─────────────────────────────┘
```
- Nền `--bg-surface`, bo góc `--radius-md`, `--shadow-sm` mặc định → `--shadow-md` + nhấc nhẹ khi hover.
- Toàn bộ card clickable (trừ icon bookmark có `stopPropagation`).
- Badge category: nền accent 12% opacity, chữ accent đậm, `--radius-sm`, `--fs-caption`.

### 2.2 CharacterCard
```
┌───────────────┐
│  [Avatar tròn] │  ← ảnh nhân vật, khung tròn 96px (desktop) / 72px (mobile)
│   Tên (fs-h4)   │
│  Franchise (fs-body-sm, --text-secondary) │
│  [Trait chip] [Trait chip]  │ ← tối đa 3 chip, --radius-pill, nền --bg-surface-alt
└───────────────┘
```
- Layout dạng cột căn giữa (center-aligned), khác ContentCard (căn trái) để tạo nhịp điệu thị giác phân biệt section.

### 2.3 EventCard
```
┌───┬─────────────────────────────┐
│ 15 │ Tiêu đề sự kiện (fs-h4)       │
│ Th3│ 📍 Location  ·  [Badge Upcoming/Past] │
│    │ Mô tả ngắn (fs-body-sm)        │
└───┴─────────────────────────────┘
```
- Cột ngày bên trái dạng "date block" (ngày lớn `--fs-h2`, tháng viết tắt `--fs-caption`), nền `--color-primary-light`.
- Badge trạng thái: "Upcoming" nền `--color-warning` nhạt, "Past" nền `--bg-surface-alt` chữ `--text-secondary`.

### 2.4 MerchCard
```
┌─────────────────────────────┐
│ [Product Image vuông 1:1]     │
├─────────────────────────────┤
│ Tên sản phẩm (fs-h4, 1 dòng)   │
│ $Price (fs-h3, weight 600, --color-accent) │
│        [Button Accent: Add to Cart] (full-width, sm) │
└─────────────────────────────┘
```

---

## 3. Badge / Chip

| Loại | Style |
|---|---|
| Category badge | Nền accent 12% opacity, chữ accent, `--radius-sm`, `--fs-caption`, padding 4×8px |
| Status badge (Upcoming/Released/Past) | Nền pastel theo trạng thái (warning/success/neutral), pill shape |
| Filter chip (active) | Nền `--color-primary`, chữ trắng, `--radius-pill` |
| Filter chip (inactive) | Border 1px `--border-color`, chữ `--text-secondary`, hover border `--color-primary` |

---

## 4. Form Elements (Search bar, Login/Signup, Note textarea)

- **Input/Textarea**: height 44px (input) / min-height 96px (textarea), `--radius-sm`, border 1px `--border-color`, focus → border `--color-primary` + shadow nhẹ `0 0 0 3px rgba(108,92,231,0.15)`.
- **Label**: `--fs-body-sm`, weight 500, `--text-secondary`, margin-bottom 6px.
- **Placeholder**: `--text-muted`.
- **Validation error**: border `--color-danger`, text lỗi bên dưới `--fs-caption` màu `--color-danger`.
- **Search bar (Navbar)**: input pill-shaped (`--radius-pill`), icon kính lúp bên trái trong input, nền `--bg-surface-alt` khi không focus → `--bg-surface` + border primary khi focus.

---

## 5. Navigation

### 5.1 NavBar (Desktop, sticky top)
```
[Logo FandomVerse]   [Anime][Gaming][Movies][TV Shows][K-Pop][Comics][Manga]   [🔍 Search bar]  [🔖][🛒 2][👤 Login]
```
- Height 72px, nền `--bg-surface`, `--shadow-sm` khi scroll (sticky).
- Category link active: chữ `--color-primary` + underline 2px bên dưới màu accent riêng của category đó.
- Cart icon có badge tròn đỏ (`--color-danger`) hiển thị số lượng item.

### 5.2 NavBar (Mobile, < 768px)
```
[☰]   [Logo]        [🔍][🛒][👤]
```
- Menu hamburger mở Offcanvas (Bootstrap Offcanvas) từ trái, liệt kê 7 category dạng list + link Trailers/Merchandise/Bookmarks/Contact/About/Login.
- Search bar mobile: thu gọn thành icon, click mở full-width search input phía trên nội dung.

### 5.3 Breadcrumb
- `--fs-body-sm`, separator `/` màu `--text-muted`, segment cuối `--text-primary` weight 500 (không phải link), các segment trước là link `--text-secondary` hover `--color-primary`.

### 5.4 Footer
- Nền `--bg-surface-alt`, 3 cột (desktop) / stack (mobile): (1) Logo + mô tả ngắn, (2) Quick links (About/Contact/Trailers), (3) Social icons + RealTimeClock + VisitorCounter.

---

## 6. Modal / Lightbox / Drawer

### 6.1 Lightbox Gallery
- Overlay nền đen `rgba(0,0,0,0.85)`, ảnh căn giữa max-height 85vh, nút prev/next 2 bên (icon button trắng trên nền tối), nút đóng góc trên-phải, counter "3 / 8" dưới ảnh (`--fs-body-sm`, màu trắng 70% opacity).
- Focus trap + Esc để đóng (theo Clean Code Guidelines §8).

### 6.2 CartDrawer (Offcanvas bên phải)
```
┌─────────────────────────────┐
│ Giỏ hàng của bạn         [X] │
├─────────────────────────────┤
│ [Ảnh] Tên SP   [- 2 +]  $xx  [🗑]│
│ ... (list item, scroll nếu dài) │
├─────────────────────────────┤
│ Tổng cộng            $xx.xx  │
│ [Button Primary, full-width: Xem chi tiết giỏ hàng] │
└─────────────────────────────┘
```

### 6.3 ChatbotWidget (nổi góc dưới-phải mọi trang)
```
        ┌───────────────────────────┐
        │ 🤖 FandomBot        [—][X] │
        ├───────────────────────────┤
        │  (bong bóng chat bot: nền │
        │   --bg-surface-alt, trái)  │
        │            (bong bóng user:│
        │        nền --color-primary,│
        │             chữ trắng, phải)│
        │  [Quick reply chip][chip]  │
        ├───────────────────────────┤
        │ [Nhập câu hỏi...]     [➤] │
        └───────────────────────────┘
   [🤖]  ← launcher icon tròn 56px, --color-primary, --shadow-lg, luôn nổi góc dưới-phải, badge "1" nếu có tin nhắn chào mới
```
- Panel: width 360px (desktop) / full-width trừ margin 16px (mobile), height max 480px, `--radius-lg`, `--shadow-lg`.
- Bong bóng chat: `--radius-md`, max-width 80% panel, `--fs-body-sm`.

---

## 7. Toast / Notification
- Vị trí: góc trên-phải (desktop) / top full-width (mobile), tự ẩn sau 3s.
- Success: icon check + border-left `--color-success`. Error: border-left `--color-danger`. Nền `--bg-surface`, `--shadow-md`.

---

## 8. Keyboard Shortcuts (bắt buộc theo SRS §1.7 — Accessibility "keyboard shortcuts")

| Phím | Ngữ cảnh | Hành động |
|---|---|---|
| `Tab` / `Shift+Tab` | Toàn site | Di chuyển focus tới/lùi qua phần tử tương tác, outline focus 2px `--color-primary` luôn hiển thị |
| `Enter` / `Space` | Button, Card, Chip đang focus | Kích hoạt hành động (giống click) |
| `Esc` | Lightbox, CartDrawer, ChatbotWidget, Modal bất kỳ | Đóng overlay, trả focus về phần tử đã mở nó |
| `←` / `→` | Lightbox Gallery đang mở, Carousel Home đang focus | Chuyển ảnh/slide trước-sau |
| `/` | Bất kỳ trang nào (không đang gõ trong input khác) | Focus nhanh vào ô Search trên NavBar |
| `Alt+C` | Bất kỳ trang nào | Mở/đóng ChatbotWidget nhanh (phím tắt bổ sung ngoài click icon) |

Toàn bộ shortcut trên là bắt buộc tối thiểu để đáp ứng yêu cầu "keyboard shortcuts" trong SRS §1.7; không được implement dạng chỉ-click-chuột cho các tương tác modal/gallery/chatbot.

---

## 9. Empty State
- Icon minh họa đơn sắc (outline, `--text-muted`) cỡ 64px + tiêu đề `--fs-h4` + mô tả `--fs-body-sm --text-secondary` + (nếu phù hợp) 1 nút Primary/Secondary gợi ý hành động tiếp theo (vd "Khám phá Category khác").
