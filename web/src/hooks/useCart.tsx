'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Book, BookVariant, CartItem } from '@/types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (book: Book, quantity: number, selectedVariant?: BookVariant) => void;
  removeFromCart: (bookId: string, variantId?: string) => void;
  updateQuantity: (bookId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('boki_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.error('Failed to parse cart items', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('boki_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (book: Book, quantity: number, selectedVariant?: BookVariant) => {
    setCartItems((prevItems) => {
      const existingItemIdx = prevItems.findIndex(
        (item) => item.book.id === book.id && item.selectedVariant?.id === selectedVariant?.id
      );

      const stock = selectedVariant ? selectedVariant.stockQuantity : book.stockQuantity;
      const maxStock = book.isPreOrder ? Math.max(stock, 99) : stock;

      if (existingItemIdx > -1) {
        const existingItem = prevItems[existingItemIdx];
        const newQuantity = Math.min(existingItem.quantity + quantity, maxStock);
        const updatedItems = [...prevItems];
        updatedItems[existingItemIdx] = {
          ...existingItem,
          quantity: newQuantity,
        };
        return updatedItems;
      } else {
        const addedQuantity = Math.min(quantity, maxStock);
        return [...prevItems, { book, selectedVariant, quantity: addedQuantity }];
      }
    });
  };

  const removeFromCart = (bookId: string, variantId?: string) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.book.id === bookId && item.selectedVariant?.id === variantId)
      )
    );
  };

  const updateQuantity = (bookId: string, quantity: number, variantId?: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.book.id === bookId && item.selectedVariant?.id === variantId) {
          const stock = item.selectedVariant ? item.selectedVariant.stockQuantity : item.book.stockQuantity;
          const maxStock = item.book.isPreOrder ? Math.max(stock, 99) : stock;
          const newQty = Math.max(1, Math.min(quantity, maxStock));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => {
    const itemPrice = item.selectedVariant ? item.selectedVariant.price : item.book.price;
    return total + item.quantity * itemPrice;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
