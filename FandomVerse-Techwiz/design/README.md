# FandomVerse — Design Folder

Thư mục này chứa toàn bộ đặc tả giao diện (UI/UX spec) cho FandomVerse, tách riêng khỏi `docs/` (tài liệu use case/test case/kiến trúc) để designer/dev dễ tra cứu khi build giao diện.

## Danh sách tài liệu
1. [01-design-system.md](./01-design-system.md) — Màu sắc, Typography (font & cỡ chữ), spacing, breakpoint, border-radius, shadow, icon.
2. [02-components.md](./02-components.md) — Thư viện component dùng chung: Button, Card (4 loại), Badge, Form, Modal, Navbar, Chatbot Widget, Toast...
3. [03-page-layouts.md](./03-page-layouts.md) — Layout chi tiết từng trang (Home, Category Hub, Search, Trailers, Merchandise & Cart, Bookmarks, Contact/About, Login/Signup) theo 3 breakpoint: Mobile / Tablet / Desktop.

## Nguyên tắc thiết kế cốt lõi
- **Thân thiện, dễ tiếp cận** (SRS §1.7): tương phản màu đạt WCAG AA, cỡ chữ tối thiểu 14px, khoảng chạm (tap target) tối thiểu 44×44px trên mobile.
- **Nhất quán**: mọi trang dùng chung 1 bộ token màu/font/spacing từ `01-design-system.md` — không tự chế màu/size riêng lẻ theo trang.
- **Responsive-first**: thiết kế từ Mobile → Desktop (mobile-first), dùng breakpoint chuẩn Bootstrap 5.
- **Vui tươi nhưng không rối mắt**: mỗi 7 category có 1 màu accent riêng để nhận diện nhanh, nhưng nền tổng thể trung tính để accent nổi bật, tránh loạn màu.

## Liên kết chéo
- Cấu trúc trang/route tương ứng use case trong [../docs/usecase-specification.md](../docs/usecase-specification.md).
- Component đọc dữ liệu theo schema trong [../docs/data-structure-and-flow.md](../docs/data-structure-and-flow.md).
