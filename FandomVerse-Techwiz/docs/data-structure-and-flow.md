# FandomVerse — Data Structure & Data Flow
**Tham chiếu:** [fandomverse-srs-v2.md §1.10](../fandomverse-srs-v2.md#110-system-architecture--diagrams), [clean-code-guidelines.md](./clean-code-guidelines.md)
**Version:** 1.0

---

## 1. Danh sách category chuẩn hóa (dùng làm `category` value trong mọi JSON)

```
"anime" | "gaming" | "movies" | "tvshows" | "kpop" | "comics" | "manga"
```

Giá trị hiển thị (label) tương ứng: Anime, Gaming, Movies, TV Shows, K-Pop, Comics, Manga — map trong `constants.js` (`CATEGORY_LIST = [{ id, label, icon }]`), không hard-code chuỗi hiển thị rải rác trong component.

---

## 2. JSON Schema từng file dữ liệu

### 2.1 `contents.json`
Bao gồm article, gallery, video, audio.

```jsonc
{
  "id": "anime-article-001",       // string, unique toàn dataset
  "category": "anime",              // 1 trong 7 category chuẩn
  "type": "article",                 // "article" | "gallery" | "video" | "audio"
  "title": "string",
  "shortDescription": "string",      // dùng cho card
  "body": "string | null",           // long-form content, null nếu type != article
  "thumbnail": "url string",
  "images": ["url", "..."],          // dùng cho LightboxGallery, [] nếu không có
  "mediaUrl": "url string | null",   // YouTube link hoặc path media tĩnh, dùng cho video/audio
  "subTags": ["string"],             // dùng cho filter phụ
  "featured": true,                    // boolean, dùng cho Home carousel & sort "Featured"
  "dateAdded": "YYYY-MM-DD"           // dùng cho sort "Newest"
}
```

### 2.2 `characters.json` (≥5 record/category)
```jsonc
{
  "id": "anime-char-001",
  "category": "anime",
  "name": "string",
  "image": "url string",
  "franchise": "string",             // dùng cho filter theo franchise
  "biography": "string",
  "traits": ["string"]
}
```

### 2.3 `events.json` (≥3 record/category)
```jsonc
{
  "id": "anime-event-001",
  "category": "anime",
  "title": "string",
  "date": "YYYY-MM-DD",              // so sánh với ngày hiện tại để phân nhóm Upcoming/Past
  "location": "string",
  "description": "string"
}
```

### 2.4 `trailers.json`
```jsonc
{
  "id": "anime-trailer-001",
  "category": "anime",
  "title": "string",
  "thumbnail": "url string",
  "mediaUrl": "url string",          // YouTube embed link
  "status": "upcoming",                // "upcoming" | "released"
  "releaseDate": "YYYY-MM-DD"
}
```

### 2.5 `merchandise.json`
```jsonc
{
  "id": "anime-merch-001",
  "category": "anime",
  "name": "string",
  "image": "url string",
  "price": 19.99,                      // number, đơn vị USD — dùng làm giá tối thiểu khi là "Price Range"
  "priceMax": null,                    // number | null — có giá trị (giá tối đa) khi là "Price Range", null nếu giá cố định
  "shortDescription": "string",
  "productType": "figure"              // "collectible" | "apparel" | "accessory" | "plushie" | "figure"
}
```

### 2.6 `chatbot_faq.json`
```jsonc
{
  "id": "faq-001",
  "keywords": ["merchandise", "shop", "buy"],  // match input theo lowercase includes
  "question": "Làm sao để mua merchandise?",     // hiển thị trong quick-reply
  "answer": "Bạn có thể xem toàn bộ sản phẩm tại trang Merchandise...",
  "link": "#/merchandise"                          // optional deep-link route nội bộ
}
```

**Quy tắc chung mọi file:** `id` duy nhất trong phạm vi file, format `<category>-<loại>-<số thứ tự 3 chữ số>`. Mọi field ngày dùng ISO `YYYY-MM-DD` để so sánh/sort được trực tiếp bằng string hoặc `new Date()`.

---

## 3. Storage Schema (LocalStorage / SessionStorage)

| Key | Storage | Kiểu dữ liệu | Ghi/đọc bởi |
|---|---|---|---|
| `fandomverse_cart` | LocalStorage | `[{ productId, quantity }]` | `storageService.saveCart/loadCart`, `CartContext` |
| `fandomverse_bookmarks` | LocalStorage | `[{ itemId, itemType, addedAt }]` | `storageService.saveBookmarks/loadBookmarks`, `BookmarkContext` |
| `fandomverse_notes` | SessionStorage | `{ [itemId]: "note text" }` | `storageService.saveNote/loadNotes` |
| `fandomverse_visitor_count` | LocalStorage | `number` | `storageService.incrementVisitorCount` |

`itemType` trong bookmark dùng để biết tra cứu lại record gốc ở dataset nào (`content` / `character` / `event` / `merchandise` / `trailer`), vì bookmark chỉ lưu `itemId` tham chiếu — không lưu trùng lặp toàn bộ object (tránh dữ liệu bookmark bị "cũ" nếu JSON gốc thay đổi).

---

## 4. Luồng dữ liệu tổng quát (đối chiếu SRS §1.10.1 – SPA Architecture)

> **Đối chiếu đặt tên module với diagram gốc trong SRS §1.10.1**: diagram gọi router là `SPA Router (app.js)` — trong dự án React, module này tương ứng `App.jsx` (khởi tạo `HashRouter` + khai báo route `#home`, `#category`, `#search`, `#merchandise`, `#bookmarks`, và các route bổ sung theo yêu cầu chức năng khác trong SRS §1.6.9/1.6.13 như `#trailers`, `#contact`, `#about`, `#login`, `#signup`). Tên 3 service gốc trong diagram (`dataService.js`, `searchService.js`, `storageService.js`) và file `chatbot_faq.json` giữ **nguyên xi** theo đúng diagram để đảm bảo khớp 100% kiến trúc đã duyệt trong SRS — không đổi tên khi code.
>
> **Bổ sung `chatbotService.js` (service thứ 4, ngoài diagram gốc):** SRS §1.10.1 vẽ `ChatbotWidget` đọc thẳng `chatbot_faq.json`, nhưng điều này vi phạm quy tắc bắt buộc "không import JSON trực tiếp vào component" ở [clean-code-guidelines.md §4.1](./clean-code-guidelines.md). Do đó dự án tách logic match keyword ra `chatbotService.js` (cùng nhóm `services/` với 3 service kia) để nhất quán kiến trúc truy cập dữ liệu — đây là tinh chỉnh có chủ đích so với diagram SRS, không phải sai lệch, và được ghi nhận tại đây để mọi tài liệu khác dùng đúng tên `chatbotService.js` khi tham chiếu luồng chatbot (xem §5.5).

```
User Action (click/type)
     │
     ▼
View/Page component (Home, CategoryHub, SearchResults, Merchandise, Bookmarks...)
     │  gọi qua hook / service, KHÔNG tự đọc JSON/Storage trực tiếp
     ▼
┌───────────────────────────────────────────────────────────┐
│ services/                                                   │
│  dataService.js    → load + filter/sort JSON theo category  │
│  searchService.js  → quét toàn dataset theo keyword+filter   │
│  storageService.js → get/set LocalStorage & SessionStorage   │
│  chatbotService.js → match keyword trong chatbot_faq.json    │
└───────────────────────────────────────────────────────────┘
     │                                   │
     ▼                                   ▼
src/data/*.json (read-only)     Browser Web Storage (read/write)
                                  - LocalStorage: cart, bookmarks, visitor count
                                  - SessionStorage: notes
```

- **Content/Character/Event/Trailer/Merchandise data**: luôn 1 chiều `JSON → dataService/searchService → component state → render`. Không có ghi ngược lại JSON (đúng constraint no-backend).
- **Cart/Bookmark/Note/VisitorCount**: 2 chiều `component action → Context → storageService → Web Storage`, và khi load lại app: `Web Storage → storageService → Context → component render`.

---

## 5. Luồng cụ thể theo tính năng

### 5.1 Category Hub load (khớp Sequence Diagram §1.10.3)
```
User click category tab
  → Router điều hướng #/category/:id
  → CategoryHub gọi useCategoryData(id)
    → dataService.getContentsByCategory(id)
    → dataService.getCharactersByCategory(id)
    → dataService.getEventsByCategory(id)
  → CategoryHub render ContentCard[], CharacterCard[], EventCard[]
  → User chọn filter/sort → dataService áp dụng trên mảng đã có (không load lại JSON)
```

### 5.2 Search (khớp DFD P1.0)
```
User nhập keyword + Enter
  → SearchResults đọc query param `q`
  → searchService.search(q, { category, type })
      quét contents/characters/events/merchandise/trailers theo title/description/tags
  → render danh sách kết quả
```

### 5.3 Cart (khớp DFD P3.0)
```
User click "Add to Cart"
  → CartContext.addItem(productId)
      → tính lại state cart (thêm mới hoặc tăng quantity)
      → storageService.saveCart(cart) ghi LocalStorage
  → CartContext tính lại total = Σ(product.price × quantity)
      (product detail được tra cứu lại từ merchandise.json qua dataService theo productId)
  → UI (badge, CartDrawer, total) re-render theo Context state mới
```

### 5.4 Bookmark & Note (khớp DFD P4.0)
```
User click bookmark icon
  → BookmarkContext.toggleBookmark(itemId, itemType)
      → storageService.saveBookmarks() ghi LocalStorage
User nhập note ở trang Bookmarks
  → storageService.saveNote(itemId, text) ghi SessionStorage
User click Export
  → đọc bookmarks (LocalStorage) + notes (SessionStorage)
  → build text content → tạo Blob → trigger file download .txt
```

### 5.5 Chatbot (khớp DFD P5.0)
```
User gửi câu hỏi trong ChatbotWidget
  → chatbotService.matchAnswer(inputText)
      → so khớp inputText.toLowerCase() với keywords[] trong chatbot_faq.json
      → trả về entry khớp đầu tiên, hoặc fallback entry mặc định nếu không khớp
  → ChatbotWidget hiển thị answer + nút deep-link (nếu có field link)
```

---

## 6. Ràng buộc dữ liệu bắt buộc (Definition of Done cho bước tạo data)
- Mỗi trong 7 category phải có: ≥1 content mỗi loại (article/gallery/video/audio) nếu khả thi, ≥5 character, ≥3 event, ≥1 trailer, ≥3 merchandise item.
- Toàn bộ `id` trong từng file không được trùng.
- Toàn bộ ảnh dùng placeholder từ dịch vụ công khai, miễn phí bản quyền (vd `picsum.photos`, `placehold.co`) — tuân Constraint 1.5.2 (không dùng ảnh có bản quyền).
- `chatbot_faq.json` phải có ít nhất 1 entry không có `keywords` khớp gì (dùng làm fallback mặc định) — đánh dấu bằng `id: "faq-fallback"`.
