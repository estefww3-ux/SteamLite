import { Link, useParams } from 'react-router-dom';
import useGames from '../hooks/useGames.js';
import { useLibrary } from '../context/LibraryContext.jsx';
import { GAME_COMPONENTS } from '../games/index.js';
import '../biblioteca.css';

export default function Play() {
  const { id } = useParams();
  const { games, loading, error } = useGames();
  const { isOwned } = useLibrary();

  if (loading) return <p className="empty">Cargando juego…</p>;
  if (error) return <p className="empty">{error}</p>;

  const game = games.find((g) => g.id === id);

  if (!game) {
    return (
      <div className="empty">
        <h2>Ese juego no existe</h2>
        <Link className="btn btn-primary" to="/">Volver a la tienda</Link>
      </div>
    );
  }

  // Solo se puede jugar si el juego está en la biblioteca
  if (!isOwned(game.id)) {
    return (
      <div className="empty">
        <h2>Aún no tienes {game.title}</h2>
        <p>Cómpralo para poder jugarlo.</p>
        <Link className="btn btn-primary" to={`/game/${game.id}`}>Ver el juego</Link>
      </div>
    );
  }

  const GameComponent = GAME_COMPONENTS[game.gameKey];

  return (
    <>
      <Link to="/library" className="back">← Volver a mi biblioteca</Link>
      <h1>{game.title}</h1>

      <div className="play-layout">
        <div className="play-stage">
          {GameComponent ? (
            <GameComponent />
          ) : (
            <div className="play-soon">
              <span aria-hidden="true">{game.emoji}</span>
              <p>Este juego estará disponible muy pronto.</p>
            </div>
          )}
        </div>

        <aside className="play-info">
          <h2>Controles</h2>
          <p className="muted">{game.controls}</p>
          <h2>Sobre el juego</h2>
          <p className="muted">{game.tagline}</p>
        </aside>
      </div>
    </>
  );
}