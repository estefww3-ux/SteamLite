import { formatPrice } from '../utils/format.js';

export default function GameCard({ game }) {
  return (
    <article>
      <h3>{game.emoji} {game.title}</h3>
      <p>{game.genre}, ★ {game.rating}</p>
      <p>{formatPrice(game.price)}</p>
    </article>
  );
}