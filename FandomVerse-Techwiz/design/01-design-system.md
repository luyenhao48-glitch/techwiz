# FandomVerse — Design System
**Version:** 1.0

---

## 1. Màu sắc (Color Palette)

Triết lý: nền trung tính sáng/tối rõ ràng, 1 màu **Primary** xuyên suốt thương hiệu (nút CTA, link, active state), 1 màu **Accent** phụ trợ, và **7 màu category** để phân biệt nhanh nội dung theo fandom — đảm bảo thân thiện, dễ nhìn, đủ tương phản.

### 1.1 Core palette

| Token | Hex | Dùng cho |
|---|---|---|
| `--color-primary` | `#6C5CE7` (Vibrant Indigo) | Nút CTA chính, link active, icon nhấn mạnh, focus ring |
| `--color-primary-dark` | `#5849C2` | Hover/active state của primary button |
| `--color-primary-light` | `#EDEBFD` | Nền badge/hover nhẹ, nền section highlight |
| `--color-accent` | `#FF6B81` (Coral Pink) | Nút phụ, giá tiền, nút "Add to Cart", cảnh báo nhẹ mang tính vui tươi |
| `--color-success` | `#00B894` | Toast thành công, badge "Released" |
| `--color-warning` | `#FDCB6E` | Badge "Upcoming", cảnh báo |
| `--color-danger` | `#FF4757` | Nút xóa/remove, lỗi form |
| `--color-info` | `#0984E3` | Link phụ, badge thông tin |

### 1.2 Neutral / Nền / Chữ (Light mode — mặc định)

| Token | Hex | Dùng cho |
|---|---|---|
| `--bg-body` | `#F8F9FC` | Nền toàn trang |
| `--bg-surface` | `#FFFFFF` | Nền card, modal, navbar |
| `--bg-surface-alt` | `#F1F2F9` | Nền section xen kẽ (zebra section trên Home) |
| `--text-primary` | `#2D3436` | Tiêu đề, nội dung chính |
| `--text-secondary` | `#636E72` | Mô tả phụ, meta text (ngày, tác giả) |
| `--text-muted` | `#A0A4B8` | Placeholder, disabled text |
| `--border-color` | `#E4E6F0` | Border card/input mặc định |
| `--text-on-primary` | `#FFFFFF` | Chữ trên nền primary/accent |

### 1.3 Dark mode (tuỳ chọn mở rộng — theo `prefers-color-scheme`)

| Token | Hex |
|---|---|
| `--bg-body` | `#15151F` |
| `--bg-surface` | `#1E1E2F` |
| `--bg-surface-alt` | `#26263A` |
| `--text-primary` | `#F1F2F9` |
| `--text-secondary` | `#B2B5C9` |
| `--border-color` | `#33334A` |

> Ghi chú: Dark mode là **nice-to-have**, không nằm trong scope bắt buộc của SRS — chỉ cần khai báo biến CSS sẵn để bật sau nếu có thời gian.

### 1.4 Màu accent theo Category (dùng cho badge, border-left card, icon nav)

| Category | Accent Hex | Ghi chú sắc thái |
|---|---|---|
| Anime | `#FF6B81` | Hồng năng động |
| Gaming | `#00B894` | Xanh lá – năng lượng, thử thách |
| Movies | `#0984E3` | Xanh dương – điện ảnh, tin cậy |
| TV Shows | `#6C5CE7` | Tím – giải trí, kịch tính (trùng primary, dùng biến thể đậm hơn `#5849C2` để phân biệt navbar) |
| K-Pop | `#E84393` | Hồng magenta – trẻ trung, thần tượng |
| Comics | `#FDCB6E` | Vàng cam – năng động, truyện tranh |
| Manga | `#E17055` | Cam đất – phong cách Nhật |

Quy tắc dùng: mỗi CategoryCard/Badge lấy đúng accent trên làm `border-left` (4px) hoặc nền badge nhạt 12% opacity + chữ đậm màu accent — không dùng accent làm nền full-block lớn (dễ chói, giảm khả năng đọc).

### 1.5 Kiểm tra tương phản (Accessibility)
- Text chính (`#2D3436`) trên nền `#FFFFFF`/`#F8F9FC`: tỉ lệ tương phản > 12:1 — đạt AAA.
- `--color-primary` (`#6C5CE7`) trên nền trắng dùng cho text: tỉ lệ ~4.6:1 — đạt AA cho text ≥ 14px bold hoặc ≥ 18px regular; với text nhỏ hơn dùng `--color-primary-dark`.
- Không bao giờ đặt text `--text-secondary` lên nền accent màu (K-Pop, Comics...) — luôn dùng `--text-on-primary` (trắng) hoặc `--text-primary` tối trên nền accent nhạt.

---

## 2. Typography

### 2.1 Font family
- **Heading font:** `Poppins` (Google Fonts) — hình khối tròn, hiện đại, thân thiện, nổi bật cho tiêu đề/branding.
- **Body font:** `Inter` (Google Fonts) — độ dễ đọc cao ở cỡ nhỏ, trung tính, chuẩn cho UI text/đoạn văn dài (article detail).
- **Fallback stack:** `"Poppins", "Inter", -apple-system, "Segoe UI", Roboto, sans-serif`.

```css
--font-heading: 'Poppins', 'Inter', -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-body: 'Inter', -apple-system, 'Segoe UI', Roboto, sans-serif;
```

### 2.2 Type scale (base 16px, tỉ lệ ~1.25)

| Token | Size (desktop) | Size (mobile) | Weight | Line-height | Dùng cho |
|---|---|---|---|---|---|
| `--fs-display` | 3rem / 48px | 2.25rem / 36px | 700 (Bold) | 1.15 | Hero title (Home) |
| `--fs-h1` | 2.25rem / 36px | 1.75rem / 28px | 700 | 1.2 | Tiêu đề trang (Category Hub, page title) |
| `--fs-h2` | 1.75rem / 28px | 1.5rem / 24px | 600 (SemiBold) | 1.25 | Tiêu đề section ("Featured", "Characters") |
| `--fs-h3` | 1.375rem / 22px | 1.25rem / 20px | 600 | 1.3 | Tiêu đề card lớn, tên nhân vật |
| `--fs-h4` | 1.125rem / 18px | 1.0625rem / 17px | 600 | 1.35 | Tiêu đề card nhỏ, tên sản phẩm |
| `--fs-body-lg` | 1.125rem / 18px | 1rem / 16px | 400 | 1.6 | Nội dung article detail |
| `--fs-body` | 1rem / 16px | 0.9375rem / 15px | 400 | 1.5 | Text mặc định, mô tả card |
| `--fs-body-sm` | 0.875rem / 14px | 0.875rem / 14px | 400 | 1.5 | Meta text (ngày, tag, breadcrumb) |
| `--fs-caption` | 0.75rem / 12px | 0.75rem / 12px | 500 (Medium) | 1.4 | Badge, label nhỏ, timestamp chatbot |

**Quy tắc:** không dùng cỡ chữ < 12px ở bất kỳ đâu (giới hạn dễ đọc). Tiêu đề luôn dùng `--font-heading`; mọi đoạn văn, label, button text dùng `--font-body`.

### 2.3 Font weight
- Poppins: dùng 2 weight — 600 (SemiBold, mặc định cho heading) và 700 (Bold, chỉ Hero/Display).
- Inter: dùng 3 weight — 400 (Regular, body), 500 (Medium, label/button), 600 (SemiBold, nhấn mạnh nhẹ như giá tiền).

---

## 3. Spacing scale (base 4px)

| Token | Value | Dùng cho |
|---|---|---|
| `--space-1` | 4px | Khoảng cách icon–text sát nhau |
| `--space-2` | 8px | Padding badge, gap giữa icon & label |
| `--space-3` | 12px | Padding trong input nhỏ |
| `--space-4` | 16px | Padding card mặc định, gap grid mobile |
| `--space-5` | 24px | Margin giữa các block trong 1 section |
| `--space-6` | 32px | Padding section (mobile) |
| `--space-8` | 48px | Padding section (desktop), khoảng cách giữa các section lớn |
| `--space-10` | 64px | Margin trên/dưới Hero section |

---

## 4. Bo góc & Đổ bóng

| Token | Value | Dùng cho |
|---|---|---|
| `--radius-sm` | 6px | Input, badge |
| `--radius-md` | 12px | Card, modal |
| `--radius-lg` | 20px | Hero banner, Chatbot widget panel |
| `--radius-pill` | 999px | Button CTA chính, tag/filter chip |
| `--shadow-sm` | `0 1px 3px rgba(45,52,54,0.08)` | Card mặc định |
| `--shadow-md` | `0 6px 16px rgba(45,52,54,0.12)` | Card hover, dropdown |
| `--shadow-lg` | `0 12px 32px rgba(45,52,54,0.18)` | Modal, Chatbot widget nổi |

---

## 5. Breakpoints (theo Bootstrap 5 — mobile-first)

| Breakpoint | Width | Grid columns gợi ý cho Card grid |
|---|---|---|
| Mobile (`xs`) | < 576px | 1 cột |
| Mobile lớn (`sm`) | ≥ 576px | 2 cột |
| Tablet (`md`) | ≥ 768px | 3 cột |
| Desktop (`lg`) | ≥ 992px | 4 cột |
| Desktop lớn (`xl`) | ≥ 1200px | 4 cột, tăng max-width container lên 1140–1200px |

Container max-width: `1200px`, căn giữa, padding ngang `--space-4` (mobile) → `--space-6` (desktop).

---

## 6. Icon
- Bộ icon: **Bootstrap Icons** (đồng bộ với Bootstrap 5, nhẹ, không cần build SVG riêng) — dùng cho nav, filter, cart, bookmark, chatbot, social.
- Kích thước chuẩn: 16px (inline text), 20px (button icon), 24px (nav icon), 32px (feature icon Home).
- Icon luôn đi kèm `aria-label` nếu không có text hiển thị cạnh (đúng Clean Code Guidelines §8).

---

## 7. Chuyển động (Motion)
- Transition mặc định: `150ms ease-in-out` cho hover màu/border, `250ms ease-out` cho mở/đóng modal & dropdown.
- Card hover: `translateY(-4px)` + đổi từ `--shadow-sm` sang `--shadow-md`.
- Tránh animation > 400ms hoặc hiệu ứng giật/nảy mạnh — giữ cảm giác mượt, không gây mất tập trung (thân thiện, không "flashy" quá mức).
