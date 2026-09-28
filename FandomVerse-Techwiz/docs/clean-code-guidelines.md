# FandomVerse — Clean Code Guidelines
**Version:** 1.0
**Áp dụng cho:** toàn bộ mã nguồn React/JS trong `src/` khi bắt đầu code.

---

## 1. Nguyên tắc chung
- **Single Responsibility**: mỗi component/hàm chỉ làm một việc. UI hiển thị tách khỏi logic lấy/biến đổi dữ liệu (logic nằm trong `services/`, `context/`, custom hooks; component chỉ render + gọi hàm).
- **No premature abstraction**: không tạo wrapper/HOC/generic component cho tình huống chưa xảy ra. 3 dòng lặp lại còn hơn 1 abstraction sai.
- **Fail gracefully, not silently**: khi dữ liệu thiếu/lỗi (item không tồn tại, JSON rỗng), hiển thị empty-state/"not found" rõ ràng — không throw lỗi trắng trang, không nuốt lỗi im lặng.
- **Không comment thừa**: chỉ viết comment khi giải thích **lý do** (why) không hiển nhiên (vd: workaround, constraint từ SRS), không viết comment mô tả code làm gì (what) vì tên biến/hàm đã rõ.

---

## 2. Cấu trúc & đặt tên file

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component | PascalCase, 1 component/file, tên file = tên component | `ContentCard.jsx`, `ChatbotWidget.jsx` |
| Hook tùy chỉnh | camelCase, tiền tố `use` | `useCategoryData.js`, `useLocalStorage.js` |
| Service (logic thuần, không JSX) | camelCase, hậu tố `Service` | `dataService.js`, `searchService.js` |
| Context | PascalCase, hậu tố `Context` | `CartContext.jsx` |
| Data JSON | snake_case hoặc camelCase nhất quán theo domain | `chatbot_faq.json`, `contents.json` |
| Hằng số dùng chung | UPPER_SNAKE_CASE, khai báo trong `constants.js` | `CATEGORY_LIST`, `STORAGE_KEYS` |

- Import theo thứ tự cố định: **thư viện ngoài → alias nội bộ (`@/…`) → import tương đối** — Prettier/ESLint import-order lo phần sắp xếp, không cần chỉnh tay.
- Không import chéo `pages/` ↔ `pages/`; page chỉ import từ `components/`, `services/`, `context/`, `data/`.

---

## 3. Component design
- **Presentational vs container tách qua hook, không tách qua thư mục riêng**: component nhận data qua props hoặc gọi hook (`useCategoryData(categoryId)`), không tự `fetch`/tự đọc JSON trực tiếp trong JSX component.
- **Props tối giản**: nếu 1 component cần >5-6 props, cân nhắc gộp thành 1 object props (`item`, `options`) thay vì liệt kê rời rạc.
- **Không mutate props/state trực tiếp**: luôn tạo array/object mới (`[...arr]`, `{...obj}`) khi cập nhật — đặc biệt quan trọng với Cart/Bookmark state.
- **Key trong list phải ổn định**: dùng `item.id` từ JSON, không dùng `index` làm `key` (tránh bug re-render khi filter/sort).
- **Không để logic filter/sort trong JSX**: gọi qua `dataService`/`searchService`, JSX chỉ `.map()` render kết quả đã xử lý.

---

## 4. Quy tắc truy cập dữ liệu (JSON) — bắt buộc
1. **Không import JSON trực tiếp vào component.** Mọi truy cập dữ liệu đi qua `dataService` (đọc/lọc/sort) hoặc `searchService` (tìm kiếm toàn site). Lý do: đổi nguồn dữ liệu (vd sau này thêm cache, đổi field) chỉ sửa 1 chỗ.
2. **Không sửa dữ liệu JSON gốc tại runtime.** JSON trong `src/data/` là nguồn chỉ-đọc (read-only) mô phỏng "static dataset" theo Constraint 1.5 của SRS — mọi thay đổi do người dùng tạo ra (cart, bookmark, note, visitor count) đi qua `storageService` và Web Storage, không ghi đè lên file JSON.
3. **Luôn có schema/field bắt buộc nhất quán** (xem [data-structure-and-flow.md](./data-structure-and-flow.md)) — component không tự đoán field, nếu field optional phải có fallback rõ ràng (vd `item.subTags ?? []`).
4. **Filter/sort là hàm thuần (pure function)**: nhận `(items, criteria) => newItems`, không side-effect, dễ test độc lập.

---

## 5. State & Storage
- **Context chỉ dùng cho state thật sự cross-cutting**: Cart, Bookmarks (nhiều component ở nhiều trang cùng cần). State cục bộ của 1 page/component (filter đang chọn, modal open/close) dùng `useState` tại chỗ, không đẩy lên Context.
- **Mọi đọc/ghi Web Storage đi qua `storageService`**, không gọi `localStorage`/`sessionStorage` trực tiếp trong component — để (a) tập trung xử lý lỗi `JSON.parse`, (b) dễ đổi key/versioning sau này, (c) tránh quên `try/catch` khi Storage bị chặn (private mode).
- **Storage key đặt tiền tố `fandomverse_`** để tránh đụng key của app khác trên cùng origin khi dev (xem danh sách key trong data-structure-and-flow.md).
- Context Provider expose action function (`addItem`, `toggleBookmark`) — không expose trực tiếp setter state thô ra ngoài để tránh cập nhật state sai luồng.

---

## 6. Error handling & Edge cases
- Chỉ validate/guard tại **boundary**: nơi dữ liệu vào hệ thống (đọc JSON, đọc Storage, đọc route param). Bên trong logic nội bộ tin tưởng dữ liệu đã hợp lệ.
- Route param (`:categoryId`, `:itemId`) không hợp lệ → render trang "Not found" cục bộ (không crash toàn app); không dùng `try/catch` bọc JSX tràn lan — xử lý bằng điều kiện rẽ nhánh rõ ràng trước khi render.
- `JSON.parse` khi đọc Storage phải bọc `try/catch`, fallback về giá trị mặc định (`[]`, `{}`) nếu parse lỗi hoặc dữ liệu không tồn tại.

---

## 7. Formatting & Lint (thiết lập khi khởi tạo dự án)
- ESLint (`eslint-plugin-react`, `eslint-plugin-react-hooks`) + Prettier, chạy trước khi commit.
- 2-space indent, dấu `'` cho string JS, dấu `"` cho JSX attribute (theo mặc định Prettier).
- Không để `console.log` trong code merge vào nhánh chính (cho phép `console.warn/error` có chủ đích cho fallback).
- Mỗi component export **default** duy nhất; export phụ (helper) nếu cần dùng nơi khác thì tách sang file util riêng, không export ngầm từ file component.

---

## 8. Accessibility (bắt buộc theo SRS 1.7)
- Mọi `<img>` có `alt` mô tả nội dung (không để trống trừ ảnh trang trí thuần túy `alt=""`).
- Mọi control tương tác (button, card click) phải focus được bằng bàn phím và có `aria-label` khi không có text hiển thị rõ nghĩa (icon-only button).
- Modal (Lightbox, Cart, Chatbot) phải: bẫy focus trong modal khi mở, đóng bằng phím `Esc`, trả focus về phần tử đã trigger khi đóng.
- Contrast màu chữ/nền tuân theo WCAG AA tối thiểu (dùng biến màu Bootstrap chuẩn, tránh custom màu nhạt trên nền nhạt).

---

## 9. Git & Commit (khuyến nghị)
- Commit message ngắn gọn, mô tả **why** thay vì liệt kê file đã đổi.
- Không commit `node_modules/`, file build (`dist/`).
- Mỗi commit nên giữ app ở trạng thái chạy được (không commit dở dang gây lỗi build).
