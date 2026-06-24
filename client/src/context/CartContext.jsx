import { createContext, useEffect, useMemo, useState } from 'react';
import { cartService } from '../services/cartService';
import { storage } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext(null);

const CART_STORAGE_KEY = 'guestCart';

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => storage.get(CART_STORAGE_KEY, []));
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const hydrateCart = async () => {
      if (!isAuthenticated) {
        setItems(storage.get(CART_STORAGE_KEY, []));
        return;
      }

      try {
        setStatus('loading');
        const cart = await cartService.getCart();
        setItems(cart?.items ?? []);
      } finally {
        setStatus('ready');
      }
    };

    hydrateCart();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      storage.set(CART_STORAGE_KEY, items);
    }
  }, [items, isAuthenticated]);

  const syncCart = async (nextItems) => {
    setItems(nextItems);

    if (!isAuthenticated) {
      return nextItems;
    }

    for (const item of nextItems) {
      await cartService.updateItem({ foodId: item.food._id ?? item.food, quantity: item.quantity });
    }

    return nextItems;
  };

  const addItem = async (food) => {
    const existingItem = items.find((item) => (item.food._id ?? item.food) === food._id);
    const nextItems = existingItem
      ? items.map((item) =>
          (item.food._id ?? item.food) === food._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      : [
          ...items,
          {
            food,
            quantity: 1,
            name: food.name,
            image: food.image,
            price: food.price,
          },
        ];

    setItems(nextItems);

    if (isAuthenticated) {
      await cartService.updateItem({ foodId: food._id, quantity: existingItem ? existingItem.quantity + 1 : 1 });
    }
  };

  const updateQuantity = async (foodId, quantity) => {
    const nextItems = items.map((item) =>
      (item.food._id ?? item.food) === foodId ? { ...item, quantity } : item
    );

    setItems(nextItems);

    if (isAuthenticated) {
      await cartService.updateItem({ foodId, quantity });
    }
  };

  const removeItem = async (foodId) => {
    const nextItems = items.filter((item) => (item.food._id ?? item.food) !== foodId);
    setItems(nextItems);

    if (isAuthenticated) {
      await cartService.removeItem(foodId);
    }
  };

  const clearCart = async () => {
    setItems([]);

    if (isAuthenticated) {
      await cartService.clear();
    }

    storage.remove(CART_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      items,
      status,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    [items, status]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};