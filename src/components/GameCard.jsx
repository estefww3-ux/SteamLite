import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext.jsx';
import { formatPrice } from '../utils/format.js';
import CoverArt from './CoverArt.jsx';
import '../biblioteca.css';

export default function GameCard({ game }) {
  const { isOwned } = useLibrary();
  const owned = isOwned(game.id);

  return (
    <article className="card">
      <Link to={`/game/${game.id}`} className="card-link">
        <CoverArt game={game} />
        <div className="card-body">
          <span className="tag">{game.genre}</span>
          <h3>{game.title}</h3>
          <p className="muted">★ {game.rating.toFixed(1)}</p>
        </div>
      </Link>
      <div className="card-foot">
        {owned ? (
          <>
            <span className="owned-badge">✓ En tu biblioteca</span>
            <Link className="btn btn-primary btn-sm" to={`/play/${game.id}`}>▶ Jugar</Link>
          </>
        ) : (
          <>
            <span className="price">{formatPrice(game.price)}</span>
            <Link className="btn btn-ghost btn-sm" to={`/game/${game.id}`}>Ver detalles</Link>
          </>
        )}
      </div>
    </article>
  );
}