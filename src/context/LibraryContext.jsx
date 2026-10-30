import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const LibraryContext = createContext(null);
const STORAGE_KEY = 'steamlite_library';

function loadLibrary() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function LibraryProvider({ children }) {
  // Cada elemento: { id, purchasedAt }
  const [owned, setOwned] = useState(loadLibrary);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(owned));
    } catch {
      /* sin espacio o navegación privada: no pasa nada */
    }
  }, [owned]);

  // Recibe una lista de juegos (por ejemplo los del carrito) y los agrega sin repetir
  const addToLibrary = useCallback((games) => {
    setOwned((prev) => {
      const have = new Set(prev.map((o) => o.id));
      const now = new Date().toISOString();
      const fresh = games
        .filter((g) => !have.has(g.id))
        .map((g) => ({ id: g.id, purchasedAt: now }));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, []);

  const value = useMemo(
    () => ({
      owned,
      ownedIds: owned.map((o) => o.id),
      addToLibrary,
      isOwned: (id) => owned.some((o) => o.id === id),
    }),
    [owned, addToLibrary]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary debe usarse dentro de <LibraryProvider>');
  return ctx;
}