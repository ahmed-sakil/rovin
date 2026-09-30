import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  productId: string;
  title: string;
  slug: string;
  sku: string;
  price: number;
  image: string;
  quantity: number;
  chosenColor?: string;
  chosenSize?: string;
  stockQuantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: any, quantity?: number, chosenColor?: string, chosenSize?: string) => void;
  removeFromCart: (productId: string, chosenColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, chosenColor?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('rovin_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('rovin_cart', JSON.stringify(items));
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (product: any, quantity = 1, chosenColor?: string, chosenSize?: string) => {
    const unitPrice = product.discountPriceBDT || product.priceBDT;
    const defaultColor = chosenColor || (product.availableColors?.[0]?.name ?? undefined);
    const defaultSize = chosenSize || (product.availableSizes?.[0] ?? undefined);

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === product.id && i.chosenColor === defaultColor
      );

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = Math.min(existing.quantity + quantity, product.stockQuantity);
        const updated = [...prev];
        updated[existingIndex] = { ...existing, quantity: newQty };
        return updated;
      }

      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          slug: product.slug,
          sku: product.sku,
          price: unitPrice,
          image: product.images?.[0] || '/assets/avatars/avatar-m1.svg',
          quantity: Math.min(quantity, product.stockQuantity || 1),
          chosenColor: defaultColor,
          chosenSize: defaultSize,
          stockQuantity: product.stockQuantity || 10,
        },
      ];
    });

    toast.success('Loaded into Cart', {
      description: `${product.title} (x${quantity})`,
    });
  };

  const removeFromCart = (productId: string, chosenColor?: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.chosenColor === chosenColor)));
    toast.info('Item Removed from Cart');
  };

  const updateQuantity = (productId: string, quantity: number, chosenColor?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, chosenColor);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId && i.chosenColor === chosenColor) {
          const clamped = Math.min(quantity, i.stockQuantity);
          return { ...i, quantity: clamped };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
