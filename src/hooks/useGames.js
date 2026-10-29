import { useEffect, useState } from 'react';

export default function useGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/data/games.json')
      .then((r) => {
        if (!r.ok) throw new Error('Error al cargar');
        return r.json();
      })
      .then(setGames)
      .catch(() => setError('No se pudo cargar el catálogo.'))
      .finally(() => setLoading(false));
  }, []);

  return { games, loading, error };
}