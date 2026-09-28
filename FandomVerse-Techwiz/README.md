# FandomVerse — Vũ Trụ Fandom Của Bạn

Nền tảng Single Page Application (SPA) tổng hợp thông tin, nhân vật, sự kiện, media, merchandise và chatbot ảo cho cộng đồng người hâm mộ trên toàn thế giới.  
Dự án tham dự kỳ thi **TechWir — Web Innovation Unleashed** (Publisher: © Aptech Limited).

---

## 🌟 Tính Năng Chính
- **7 Danh Mục Fandom Toàn Diện:** Anime, Gaming, Movies, TV Shows, K-Pop, Comics, Manga.
- **Tìm Kiếm Toàn Cục (Global Search):** Tìm kiếm tức thì không giật lag, hỗ trợ lọc theo danh mục và loại nội dung.
- **Khám Phá Đa Phương Tiện:** Thư viện ảnh với chế độ xem phóng to (Lightbox), trình phát trailer video YouTube nhúng.
- **Hồ Sơ Nhân Vật & Sự Kiện:** Hơn 35 nhân vật chi tiết (≥5 nhân vật/danh mục) và hơn 21 sự kiện nổi bật (≥3 sự kiện/danh mục).
- **Gian Hàng Lưu Niệm & Giỏ Hàng Ảo:** Danh mục sản phẩm lưu niệm, giỏ hàng tạm tính tổng tiền tự động bằng JavaScript (No-Backend).
- **Trợ Lý Ảo AI Rule-Based:** Chatbot widget hỗ trợ giải đáp thắc mắc thường gặp và điều hướng nhanh (Deep-linking) mà không cần backend hay API ngoài.
- **Lưu Yêu Thích & Ghi Chú Cá Nhân:** Lưu bài viết qua `LocalStorage`, viết ghi chú cá nhân theo phiên qua `SessionStorage`, xuất file danh sách định dạng `.txt`.
- **Tiện Ích Đi Kèm:** Đồng hồ thời gian thực (Live Clock), Bộ đếm lượt truy cập (Simulated Visitor Counter), Bản đồ chỉ đường Contact Us với GPS.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)
- **Frontend Framework:** React 18 (Vite)
- **CSS / UI Library:** Bootstrap 5.3 + Bootstrap Icons
- **Routing:** `react-router-dom` (v6) với `HashRouter` (chạy mượt trên GitHub Pages và máy chấm offline)
- **State Management:** React Context API (`CartContext`, `BookmarkContext`)
- **Data Layer:** 6 tệp JSON tĩnh chuẩn hóa trong `src/data/` (No-Backend Architecture)
- **Storage:** Web Storage API (`localStorage` & `sessionStorage`)

---

## 🚀 Cài Đặt & Chạy Ứng Dụng

### Yêu Cầu Môi Trường
- Node.js: v18.0 trở lên (khuyên dùng Node 20+)
- Trình quản lý gói: npm hoặc yarn

### Khởi Chạy
```bash
# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển (Dev server)
npm run dev

# 3. Mở trình duyệt tại địa chỉ
http://localhost:5173
```

### Đóng Gói Sản Phẩm (Production Build)
```bash
npm run build
```
Thư mục `dist/` sẽ chứa toàn bộ sản phẩm hoàn thiện sẵn sàng để triển khai hoặc nộp bài.

---

## 📂 Tài Liệu Dự Án
- [plan.md](./plan.md): Kế hoạch triển khai chi tiết 5 giai đoạn
- [fandomverse-srs-v2.md](./fandomverse-srs-v2.md): Đặc tả yêu cầu kỹ thuật gốc (SRS v2.0)
- [docs/srs-compliance-matrix.md](./docs/srs-compliance-matrix.md): Ma trận tuân thủ yêu cầu đề bài
- [docs/data-structure-and-flow.md](./docs/data-structure-and-flow.md): Chuẩn cấu trúc dữ liệu JSON & DFD
- [docs/clean-code-guidelines.md](./docs/clean-code-guidelines.md): Quy chuẩn viết mã sạch
- [docs/usecase-specification.md](./docs/usecase-specification.md): Đặc tả 24 Use Cases
- [FandomVerse_TestCase_UI_HuongDan_DaSua.xlsx](./FandomVerse_TestCase_UI_HuongDan_DaSua.xlsx): Bộ 200 UI Test Cases chính thức
- [design/](./design/): Toàn bộ tài liệu Design System, Components và Page Layouts