import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format.js';
import CoverArt from './CoverArt.jsx';

export default function GameCard({ game }) {
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
        <span className="price">{formatPrice(game.price)}</span>
        <Link className="btn btn-ghost btn-sm" to={`/game/${game.id}`}>Ver detalles</Link>
      </div>
    </article>
  );
}