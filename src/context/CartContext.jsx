import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'steamlite_cart';

// Guardamos solo lo necesario de cada juego
const slim = (g) => ({
  id: g.id,
  title: g.title,
  price: g.price,
  genre: g.genre,
  image: g.image,
  emoji: g.emoji,
  colors: g.colors,
});

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  // Cada vez que cambia el carrito, se guarda en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* sin espacio o navegación privada: no pasa nada */
    }
  }, [items]);

  const addToCart = useCallback((game) => {
    // Son juegos digitales: una sola copia por juego
    setItems((prev) => (prev.some((i) => i.id === game.id) ? prev : [...prev, slim(game)]));
  }, []);

  const removeFromCart = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    // Se redondea a centavos para evitar errores como 8.979999
    const subtotal = Math.round(items.reduce((sum, i) => sum + i.price, 0) * 100) / 100;
    return {
      items,
      count: items.length,
      subtotal,
      total: subtotal,
      addToCart,
      removeFromCart,
      clearCart,
      isInCart: (id) => items.some((i) => i.id === id),
    };
  }, [items, addToCart, removeFromCart, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}