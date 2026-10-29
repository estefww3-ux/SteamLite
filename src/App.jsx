import { useMemo, useState } from 'react';
import useGames from './hooks/useGames.js';
import GameCard from './components/GameCard.jsx';
import { normalize } from './utils/format.js';

export default function App() {
  const { games, loading, error } = useGames();
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('Todos');

  const genres = useMemo(() => ['Todos', ...new Set(games.map((g) => g.genre))], [games]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    return games.filter(
      (g) =>
        (genre === 'Todos' || g.genre === genre) &&
        normalize(`${g.title} ${g.genre} ${g.description}`).includes(q)
    );
  }, [games, query, genre]);

  if (loading) return <p>Cargando catálogo…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>SteamLite</h1>
      <input
        type="search"
        placeholder="Buscar juegos"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div>
        {genres.map((g) => (
          <button key={g} onClick={() => setGenre(g)} disabled={g === genre}>
            {g}
          </button>
        ))}
      </div>
      {results.length === 0 && <p>No hay juegos con esos filtros.</p>}
      {results.map((g) => (
        <GameCard key={g.id} game={g} />
      ))}
    </div>
  );
}