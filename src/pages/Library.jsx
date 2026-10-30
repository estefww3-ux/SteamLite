import { Link } from 'react-router-dom';
import useGames from '../hooks/useGames.js';
import { useLibrary } from '../context/LibraryContext.jsx';
import CoverArt from '../components/CoverArt.jsx';
import '../biblioteca.css';

const dateFormat = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function Library() {
  const { games, loading, error } = useGames();
  const { owned } = useLibrary();

  if (loading) return <p className="empty">Cargando biblioteca…</p>;
  if (error) return <p className="empty">{error}</p>;

  // Une cada compra con los datos del catálogo, las más recientes primero
  const mine = owned
    .map((o) => ({ game: games.find((g) => g.id === o.id), purchasedAt: o.purchasedAt }))
    .filter((x) => x.game)
    .sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));

  if (mine.length === 0) {
    return (
      <div className="empty">
        <h2>Tu biblioteca está vacía</h2>
        <p>Los juegos que compres aparecerán aquí para que puedas jugarlos.</p>
        <Link className="btn btn-primary" to="/">Ir a la tienda</Link>
      </div>
    );
  }

  return (
    <>
      <h1>Mi biblioteca</h1>
      <p className="muted">
        {mine.length} {mine.length === 1 ? 'juego' : 'juegos'} en tu colección
      </p>

      <div className="grid library-grid">
        {mine.map(({ game, purchasedAt }) => (
          <article key={game.id} className="card">
            <Link to={`/play/${game.id}`} className="card-link">
              <CoverArt game={game} />
              <div className="card-body">
                <span className="tag">{game.genre}</span>
                <h3>{game.title}</h3>
                <p className="muted">Comprado el {dateFormat.format(new Date(purchasedAt))}</p>
              </div>
            </Link>
            <div className="card-foot">
              <Link className="btn btn-ghost btn-sm" to={`/game/${game.id}`}>Detalles</Link>
              <Link className="btn btn-primary btn-sm" to={`/play/${game.id}`}>▶ Jugar</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}