export const CATEGORY_LIST = [
  {
    id: 'anime',
    label: 'Anime',
    icon: 'bi-stars',
    accentColor: 'var(--accent-anime)',
    description: 'Khám phá thế giới hoạt hình Nhật Bản, từ các shounen kinh điển đến những tác phẩm mùa mới nhất.',
  },
  {
    id: 'gaming',
    label: 'Gaming',
    icon: 'bi-controller',
    accentColor: 'var(--accent-gaming)',
    description: 'Thế giới game đỉnh cao, eSports, các tựa game bom tấn AAA và những viên ngọc indie sáng giá.',
  },
  {
    id: 'movies',
    label: 'Movies',
    icon: 'bi-camera-reels',
    accentColor: 'var(--accent-movies)',
    description: 'Vũ trụ điện ảnh, các siêu phẩm Hollywood, bom tấn hành động và thế giới giả tưởng bất tận.',
  },
  {
    id: 'tvshows',
    label: 'TV Shows',
    icon: 'bi-tv',
    accentColor: 'var(--accent-tvshows)',
    description: 'Các series phim truyền hình kịch tính, chương trình truyền hình ăn khách và series kinh điển.',
  },
  {
    id: 'kpop',
    label: 'K-Pop',
    icon: 'bi-music-note-beamed',
    accentColor: 'var(--accent-kpop)',
    description: 'Làn sóng Hallyu bùng nổ, các nhóm nhạc thần tượng hàng đầu, âm nhạc sôi động và visual đỉnh cao.',
  },
  {
    id: 'comics',
    label: 'Comics',
    icon: 'bi-book',
    accentColor: 'var(--accent-comics)',
    description: 'Vũ trụ siêu anh hùng Marvel, DC, các graphic novel huyền thoại và những trang truyện màu sắc.',
  },
  {
    id: 'manga',
    label: 'Manga',
    icon: 'bi-journal-bookmark',
    accentColor: 'var(--accent-manga)',
    description: 'Truyện tranh Nhật Bản đa dạng thể loại, các tác phẩm vượt thời gian và những nét vẽ tinh tế.',
  },
];

// Category filter / select options shared by the Admin management pages
export const ADMIN_CATEGORY_OPTIONS = [
  { id: 'all', label: 'Tất cả danh mục' },
  ...CATEGORY_LIST.map(({ id, label }) => ({ id, label })),
];

export const STORAGE_KEYS = {
  CART: 'fandomverse_cart',
  BOOKMARKS: 'fandomverse_bookmarks',
  NOTES: 'fandomverse_notes',
  VISITOR_COUNT: 'fandomverse_visitor_count',
  USERS: 'fandomverse_users',
  CURRENT_USER: 'fandomverse_current_user',
  LANGUAGE: 'fv_language',
  ORDERS: 'fandomverse_orders',
};

export const PRODUCT_TYPES = [
  { id: 'all', label: 'Tất cả loại', icon: '📦' },
  { id: 'figure', label: 'Mô hình (Figure)', icon: '🗿' },
  { id: 'collectible', label: 'Đồ sưu tầm', icon: '🏆' },
  { id: 'apparel', label: 'Trang phục & Áo', icon: '👕' },
  { id: 'accessory', label: 'Phụ kiện', icon: '🎒' },
  { id: 'plushie', label: 'Gấu bông (Plushie)', icon: '🧸' },
];

