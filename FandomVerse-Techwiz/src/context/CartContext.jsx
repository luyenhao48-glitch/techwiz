import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { storageService } from '../services/storageService.js';
import { dataService } from '../services/dataService.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => storageService.loadCart());
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to LocalStorage on change
  useEffect(() => {
    storageService.saveCart(cart);
  }, [cart]);

  const addItem = (productId, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId, quantity }];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Enriched Cart Items with product details
  const enrichedCart = useMemo(() => {
    const allMerch = dataService.getAllMerchandise();
    const merchMap = new Map(allMerch.map((m) => [m.id, m]));

    return cart
      .map((item) => {
        const product = merchMap.get(item.productId);
        if (!product) return null;
        return {
          ...product,
          quantity: item.quantity,
          subtotal: Number((product.price * item.quantity).toFixed(2)),
        };
      })
      .filter(Boolean);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return enrichedCart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [enrichedCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: enrichedCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được sử dụng bên trong CartProvider');
  }
  return context;
}
