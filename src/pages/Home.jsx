import { useMemo, useState } from 'react';
import useGames from '../hooks/useGames.js';
import GameCard from '../components/GameCard.jsx';
import HeroBanner from '../components/HeroBanner.jsx';
import { normalize } from '../utils/format.js';

export default function Home() {
  const { games, loading, error } = useGames();
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('Todos');

  const genres = useMemo(() => [...new Set(games.map((g) => g.genre))], [games]);
  const featured = useMemo(() => games.filter((g) => g.featured), [games]);
  const filtering = query.trim() !== '' || genre !== 'Todos';

  const results = useMemo(() => {
    const q = normalize(query.trim());
    return games.filter(
      (g) =>
        (genre === 'Todos' || g.genre === genre) &&
        normalize(`${g.title} ${g.genre} ${g.description}`).includes(q)
    );
  }, [games, query, genre]);

  if (loading) return <p className="empty">Cargando catálogo…</p>;
  if (error) return <p className="empty">{error}</p>;

  return (
    <>
      <HeroBanner games={featured} />

      <div className="toolbar">
        <input
          type="search"
          className="input"
          placeholder="Buscar juegos por nombre, género o descripción"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips">
          {['Todos', ...genres].map((g) => (
            <button
              key={g}
              className={`chip ${genre === g ? 'active' : ''}`}
              onClick={() => setGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

            <section>
        <h2 className="section-title">
          {filtering ? `${results.length} resultados` : 'Todos los juegos'}
        </h2>
        {results.length === 0 ? (
          <p className="empty">No hay juegos con esos filtros.</p>
        ) : (
          <div className="grid">
            {results.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        )}
      </section>
    </>
  );
}