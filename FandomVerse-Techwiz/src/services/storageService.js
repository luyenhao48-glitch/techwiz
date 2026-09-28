import { STORAGE_KEYS } from '../constants.js';

export const storageService = {
  // Cart (LocalStorage)
  loadCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('Không thể đọc dữ liệu giỏ hàng từ LocalStorage:', error);
      return [];
    }
  },

  saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (error) {
      console.warn('Không thể lưu giỏ hàng vào LocalStorage:', error);
    }
  },

  // Bookmarks (LocalStorage)
  loadBookmarks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('Không thể đọc bookmark từ LocalStorage:', error);
      return [];
    }
  },

  saveBookmarks(bookmarks) {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (error) {
      console.warn('Không thể lưu bookmark vào LocalStorage:', error);
    }
  },

  // Notes (SessionStorage - session-only)
  loadNotes() {
    try {
      const data = sessionStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.warn('Không thể đọc ghi chú từ SessionStorage:', error);
      return {};
    }
  },

  saveNote(itemId, noteText) {
    try {
      const notes = this.loadNotes();
      if (!noteText || noteText.trim() === '') {
        delete notes[itemId];
      } else {
        notes[itemId] = noteText.trim();
      }
      sessionStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (error) {
      console.warn('Không thể lưu ghi chú vào SessionStorage:', error);
    }
  },

  deleteNote(itemId) {
    try {
      const notes = this.loadNotes();
      delete notes[itemId];
      sessionStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (error) {
      console.warn('Không thể xóa ghi chú khỏi SessionStorage:', error);
    }
  },

  // Visitor Counter (LocalStorage)
  getVisitorCount() {
    try {
      const count = localStorage.getItem(STORAGE_KEYS.VISITOR_COUNT);
      return count ? parseInt(count, 10) : 1248; // Base seed count
    } catch (error) {
      return 1248;
    }
  },

  incrementVisitorCount() {
    try {
      const current = this.getVisitorCount();
      const updated = current + 1;
      localStorage.setItem(STORAGE_KEYS.VISITOR_COUNT, updated.toString());
      return updated;
    } catch (error) {
      return 1248;
    }
  },

  // Users / Auth (LocalStorage)
  loadUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('Không thể đọc dữ liệu tài khoản từ LocalStorage:', error);
      return [];
    }
  },

  saveUsers(users) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.warn('Không thể lưu dữ liệu tài khoản vào LocalStorage:', error);
    }
  },

  loadCurrentUser() {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || null;
    } catch (error) {
      console.warn('Không thể đọc phiên đăng nhập từ LocalStorage:', error);
      return null;
    }
  },

  saveCurrentUser(email) {
    try {
      if (!email) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      } else {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, email);
      }
    } catch (error) {
      console.warn('Không thể lưu phiên đăng nhập vào LocalStorage:', error);
    }
  },

  // Language Preference (LocalStorage)
  loadLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || null;
    } catch (error) {
      return null;
    }
  },

  saveLanguage(language) {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (error) {
      console.warn('Không thể lưu ngôn ngữ vào LocalStorage:', error);
    }
  },

  // Orders / Transactions (LocalStorage)
  loadOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Seed with initial order matching the user's completed checkout
      const initialOrders = [
        {
          orderId: 'FV-864983',
          date: '26/09/2026, 22:41:28',
          createdAt: '2026-09-26T15:41:28.000Z',
          userEmail: 'luyenhao48@gmail.com',
          userName: 'hào',
          items: [
            {
              id: 'merch-onepiece-luffy-gear5',
              name: 'Luffy Gear 5 Sun God Nika Master Stars Piece Figure',
              price: 89.99,
              quantity: 3,
              image: '/image/luffy.jpg',
            },
            {
              id: 'merch-witcher-geralt-ursine',
              name: 'Geralt of Rivia Grandmaster Ursina Armor 1/6 Scale Statue',
              price: 149.99,
              quantity: 1,
              image: '/image/model_denjji.jpg',
            },
          ],
          shippingInfo: {
            fullName: 'hào',
            phone: '123456789',
            email: 'luyenhao48@gmail.com',
            city: 'Hà Nội',
            district: 'Xuân Phương',
            address: 'Xuân Phương, Nam Từ Liêm',
          },
          paymentMethod: 'momo',
          subtotal: 419.96,
          discount: 0,
          shippingFee: 0,
          vatTax: 33.60,
          total: 453.56,
          status: 'completed',
        },
      ];
      this.saveOrders(initialOrders);
      return initialOrders;
    } catch (error) {
      console.warn('Không thể đọc lịch sử đơn hàng từ LocalStorage:', error);
      return [];
    }
  },

  saveOrders(orders) {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (error) {
      console.warn('Không thể lưu đơn hàng vào LocalStorage:', error);
    }
  },

  addOrder(order) {
    try {
      const orders = this.loadOrders();
      const existingIdx = orders.findIndex((o) => o.orderId === order.orderId);
      if (existingIdx >= 0) {
        orders[existingIdx] = order;
      } else {
        orders.unshift(order);
      }
      this.saveOrders(orders);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('fv_order_created', { detail: order }));
      }
      return orders;
    } catch (error) {
      console.warn('Không thể thêm đơn hàng mới:', error);
      return [];
    }
  },
};
