# FandomVerse — SRS Compliance Matrix
**Mục đích:** đối chiếu **từng mục** của [fandomverse-srs-v2.md](../fandomverse-srs-v2.md) (đề bài thi TechWir) với tài liệu đã tạo trong `docs/` và `design/`, đảm bảo không thiếu/lệch yêu cầu nào trước khi bắt đầu code. Đây là tài liệu tham chiếu bắt buộc — mọi tài liệu khác trong repo phải nhất quán với bảng dưới đây.
**Version:** 1.1

> **Chú thích viết tắt:** "xlsx" = file [`FandomVerse_TestCase_UI_HuongDan_DaSua.xlsx`](../FandomVerse_TestCase_UI_HuongDan_DaSua.xlsx) — bộ 200 test case chi tiết, là tài liệu **duy nhất và chính thức** để thực thi/track kết quả kiểm thử (bản đặc tả sơ bộ `test-cases.md` trước đây đã được xóa vì trùng lặp, nội dung tương ứng nay nằm đầy đủ trong xlsx).

---

## 1. Bảng truy vết (Traceability Table)

| SRS § | Yêu cầu | Tài liệu đáp ứng | Trạng thái |
|---|---|---|---|
| 1.1 | Background & Necessity | Bối cảnh giữ nguyên trong SRS gốc, không cần tài liệu phái sinh | ✅ N/A (tài liệu nguồn) |
| 1.2 | Proposed Solution — 7 category, search/sort/filter, rich content, merchandise+cart ảo, no-backend, SPA, AI chatbot rule-based | [usecase-specification.md](./usecase-specification.md) UC-01→UC-24; [data-structure-and-flow.md](./data-structure-and-flow.md) §4-5; §2 "Tech stack" trong kế hoạch triển khai đã duyệt | ✅ Covered |
| 1.3 | Purpose & Stakeholders | Ghi trong header mỗi tài liệu (SRS reference) | ✅ Covered |
| 1.4 | Scope: Category Hubs, Global Search, Multimedia, Trailers, Merchandise, Chatbot, Responsive | UC-02→UC-11, UC-18; [03-page-layouts.md](../design/03-page-layouts.md) mục 1-5 | ✅ Covered |
| 1.5.1 | No Server-Side DB/Backend — chỉ đọc JSON/TXT tĩnh | [clean-code-guidelines.md](./clean-code-guidelines.md) §4.2; [data-structure-and-flow.md](./data-structure-and-flow.md) §4 (luồng 1 chiều JSON→UI) | ✅ Covered |
| 1.5.2 | Copyright & Licensing — chỉ nội dung royalty-free | [data-structure-and-flow.md](./data-structure-and-flow.md) §6 (placeholder từ picsum/placehold.co) | ✅ Covered |
| 1.5.3 | Chatbot chỉ dùng dataset local, không gọi AI API ngoài | UC-18 (Alternate Flow + note), [FandomVerse_TestCase_UI_HuongDan_DaSua.xlsx](../FandomVerse_TestCase_UI_HuongDan_DaSua.xlsx) TC_BOT_11 | ✅ Covered |
| 1.6.1 | Home Page: logo, animated heading, intro text, category nav, featured showcase, chatbot launcher | UC-01; [03-page-layouts.md](../design/03-page-layouts.md) mục 1 | ✅ Covered |
| 1.6.2 | Category Hubs: catalog card (title/thumbnail/desc/type/sub-tags), filter, sort | UC-02, UC-04; xlsx TC_CAT_xx; schema `contents.json` | ✅ Covered |
| 1.6.3 | Global Search: search bar mọi trang, filter category+type, client-side | UC-03; xlsx TC_SEARCH_xx; [02-components.md](../design/02-components.md) §5.1-5.2 (search bar NavBar) | ✅ Covered |
| 1.6.4 | Image Galleries: lightbox/carousel trong category hub | UC-06; xlsx TC_GAL_xx; [02-components.md](../design/02-components.md) §6.1 | ✅ Covered |
| 1.6.5 | Videos & Audio (YouTube/media path) | UC-07; xlsx TC_MEDIA_xx; schema `mediaUrl` trong `contents.json`/`trailers.json` | ✅ Covered |
| 1.6.6 | Featured Articles long-form + related content | UC-05; xlsx TC_ART_xx | ✅ Covered |
| 1.6.7 | Character Profiles ≥5/category, field Name/Image/Franchise/Bio/Traits, filter franchise | UC-08; xlsx TC_CHAR_xx; schema `characters.json`; [data-structure-and-flow.md](./data-structure-and-flow.md) §6 (ràng buộc ≥5) | ✅ Covered |
| 1.6.8 | Event Highlights ≥3/category, field Title/Date/Location/Description/Category | UC-09; xlsx TC_EVT_xx; schema `events.json`; §6 (ràng buộc ≥3) | ✅ Covered |
| 1.6.9 | Trailers Section: hub tổng hợp, filter category + status | UC-10; xlsx TC_TRL_xx; [03-page-layouts.md](../design/03-page-layouts.md) mục 4 | ✅ Covered |
| 1.6.10 | Merchandise: card Image/Name/Price(Range)/Description; cart tạm tính tổng JS, không checkout thật | UC-11→UC-14; xlsx TC_MERCH_xx; schema `merchandise.json` (price/priceMax); [03-page-layouts.md](../design/03-page-layouts.md) mục 5 | ✅ Covered |
| 1.6.11 | AI Chatbot: widget site-wide, FAQ JSON, quick-reply, deep-link | UC-18; xlsx TC_BOT_xx; schema `chatbot_faq.json`; `chatbotService.js` ([data-structure-and-flow.md](./data-structure-and-flow.md) §4, §5.5); [02-components.md](../design/02-components.md) §6.3 | ✅ Covered |
| 1.6.12 | Bookmark → LocalStorage; Note → SessionStorage (session-only); Export text | UC-15→UC-17; xlsx TC_BM_xx; Storage Schema §3 (`fandomverse_bookmarks`, `fandomverse_notes`) | ✅ Covered |
| 1.6.13 | Visitor Counter, Real-Time Clock, Breadcrumb, Dummy Login/Signup, Contact Us (Maps+GPS), About Us | UC-19→UC-24; xlsx TC_MISC_xx; [02-components.md](../design/02-components.md) §5.3 (Breadcrumb), §5.4 (Footer: Clock + Visitor Counter); [03-page-layouts.md](../design/03-page-layouts.md) mục 7-8 (Contact/About, Login/Signup) | ✅ Covered |
| 1.6.14 | AI Usage Policy Guidelines (cho phép dùng AI hỗ trợ, cấm nộp boilerplate nguyên bản) | §3 tài liệu này ("Ghi nhận sử dụng AI") | ✅ Covered (mục mới, xem bên dưới) |
| 1.7 | Non-Functional: Safety, Accessibility (contrast/keyboard/screen-reader), User-friendliness, Performance, Capacity, Availability, Compatibility | [clean-code-guidelines.md](./clean-code-guidelines.md) §6, §8; [01-design-system.md](../design/01-design-system.md) §1.5; [02-components.md](../design/02-components.md) §8 "Keyboard Shortcuts"; xlsx TC_QA_xx | ✅ Covered |
| 1.8.1 | Hardware Specifications (môi trường dev/test tối thiểu) | §4 tài liệu này | ✅ Covered (ghi nhận, không cần hành động code) |
| 1.8.2 | Software/Tech Stack (IDE, Frontend stack, Design/AI tools, Chatbot engine, Data store) | §2 tài liệu này ("Quyết định Tech Stack") | ✅ Covered |
| 1.9 | Project Deliverables (report PDF, source zip+ReadMe, video demo, hosted URL optional, Lighthouse) | §5 tài liệu này ("Deliverables Checklist") | ⏳ Planned — chưa thực hiện (chỉ thực hiện sau khi code xong) |
| 1.10.1 | SPA Architecture Diagram (Router app.js, 3 service, JSON store, Web Storage) | [data-structure-and-flow.md](./data-structure-and-flow.md) §4 (đối chiếu đặt tên module) | ✅ Covered |
| 1.10.2 | DFD Level 0 & 1 (P1-P5 processes) | [data-structure-and-flow.md](./data-structure-and-flow.md) §5.1→5.5 (map đúng từng process P1-P5) | ✅ Covered |
| 1.10.3 | Sequence Diagram: Category Loading & Bookmarking | [data-structure-and-flow.md](./data-structure-and-flow.md) §5.1, §5.4; UC-02, UC-15 | ✅ Covered |

---

## 2. Quyết định Tech Stack (đối chiếu SRS §1.8.2)

SRS cho phép chọn giữa **Bootstrap / ReactJS / AngularJS**. Dự án chọn:

| Thành phần | Lựa chọn | Lý do bám sát SRS |
|---|---|---|
| Frontend framework | **ReactJS** (Vite build) | Nằm trong danh sách cho phép §1.8.2; component hóa giúp quản lý 7 category hub + nhiều loại card nhất quán |
| CSS framework | **Bootstrap 5** | Cũng nằm trong danh sách cho phép §1.8.2, kết hợp với React qua component; đáp ứng yêu cầu responsive §1.6.13/§1.7 |
| Routing | `react-router-dom` với `HashRouter` | Giữ đúng kiến trúc **"SPA Router"** với route dạng hash (`#home`, `#category`...) như diagram §1.10.1 mô tả, không cần cấu hình server rewrite (đúng constraint "No Backend" §1.5.1) |
| Data store | JSON tĩnh trong `src/data/` | Đúng §1.8.2 "Pre-populated JSON or TXT static files" và Constraint §1.5.1 |
| State/Storage | React Context (Cart, Bookmark) + `storageService.js` bọc LocalStorage/SessionStorage | Đúng §1.6.12 (Bookmark→LocalStorage, Note→SessionStorage) và diagram §1.10.1 (`StorageSvc`) |
| Chatbot | Rule-based JSON engine tự viết (không dùng Tawk.to/Tidio) | Đúng §1.8.2 lựa chọn "Pre-scripted JSON engine" và Constraint §1.5.3 (không gọi AI API ngoài) |
| IDE | VS Code | Nằm trong danh sách cho phép §1.8.1 |

---

## 3. Ghi nhận sử dụng AI (đối chiếu SRS §1.6.14)

- Công cụ AI (Claude) được dùng để **hỗ trợ soạn thảo tài liệu SRS phái sinh** (use case, test case, clean code guideline, data schema, design spec) và sẽ tiếp tục hỗ trợ debug/code khi triển khai — đúng phạm vi cho phép "design assistance, code debugging, FAQ drafting, graphics generation" của §1.6.14.
- Khi code, **không copy nguyên khối boilerplate template có sẵn** — mọi component/service phải được viết/tùy biến theo đúng schema và luồng dữ liệu đã định nghĩa trong [data-structure-and-flow.md](./data-structure-and-flow.md), thể hiện hiểu biết triển khai thực tế (đúng yêu cầu "must demonstrate original understanding and implementation").
- Khuyến nghị: khi nộp bài, ghi rõ trong `ReadMe.doc` (mục 1.9.2) phần nào có hỗ trợ từ AI, theo đúng tinh thần minh bạch của §1.6.14.

---

## 4. Môi trường tham chiếu (đối chiếu SRS §1.8.1)

Yêu cầu phần cứng trong SRS là cấu hình máy **dev/test tối thiểu**, không ảnh hưởng tới code/tài liệu, chỉ cần ghi nhận: Intel Core i5/i7+, RAM ≥8GB, Storage ≥500GB, màn hình Color SVGA, chuột & bàn phím. Không cần hành động gì thêm ở bước tài liệu này.

---

## 5. Deliverables Checklist (đối chiếu SRS §1.9) — thực hiện SAU khi hoàn thành code

| # | Deliverable | Yêu cầu | Trạng thái |
|---|---|---|---|
| 1 | `project_report.pdf` | Problem Definition, Design Specs, DFD/Flowcharts, Test Data, Installation Instructions — **không chứa source code** | ⏳ Chưa làm — sẽ tổng hợp từ `docs/` + `design/` + `fandomverse-srs-v2.md` sau khi code xong |
| 2 | Source Code `.zip` | Toàn bộ HTML/CSS/JS/JSON + `ReadMe.doc` liệt kê assumptions | ⏳ Chưa làm |
| 3 | Video Demo `.mp4` | **Bắt buộc**, quay demo toàn bộ tính năng hoạt động | ⏳ Chưa làm |
| 4 | Live Hosted URL | Tùy chọn (optional) | ⏳ Chưa quyết định (đề xuất GitHub Pages do dùng HashRouter, không cần server) |
| 5 | Quality Assessment | Test bằng Google Lighthouse (performance, accessibility, SEO) | ⏳ Chưa làm — thực hiện ở bước kiểm thử cuối, đối chiếu tiêu chí §1.7 |

> Các mục trên **không thuộc phạm vi giai đoạn tài liệu/thiết kế hiện tại** — liệt kê ở đây để không bị quên khi tới giai đoạn hoàn thiện & nộp bài.

---

## 6. Kết luận đối chiếu
Tất cả mục **Functional (1.6.x)**, **Non-Functional (1.7)**, **Interface (1.8.x)**, và **3 diagram kiến trúc (1.10.x)** trong SRS đã được ánh xạ đầy đủ vào bộ tài liệu hiện có (`docs/` + `design/`), không có yêu cầu nào bị bỏ sót. Riêng **Deliverables (1.9)** là công việc thực hiện ở giai đoạn cuối dự án (sau khi code xong), đã được lập checklist theo dõi ở mục 5 để đảm bảo không thiếu khi nộp bài thi.
