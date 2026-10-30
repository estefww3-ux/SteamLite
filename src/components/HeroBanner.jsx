import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CoverArt from './CoverArt.jsx';

export default function HeroBanner({ games }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || games.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % games.length), 5000);
    return () => clearInterval(t);
  }, [paused, games.length]);

  if (!games.length) return null;
  const game = games[index % games.length];
  const go = (d) => setIndex((i) => (i + d + games.length) % games.length);

  return (
    <section
      className="hero"
      aria-label="Juegos destacados"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-text">
        <p className="muted">Destacado</p>
        <h1>{game.title}</h1>
        <p className="hero-tagline">{game.tagline}</p>
        <Link className="btn btn-primary" to={`/game/${game.id}`}>Ver detalles</Link>
      </div>
      <CoverArt game={game} className="hero-cover" />
      <div className="hero-controls">
        <button className="btn btn-ghost btn-sm" onClick={() => go(-1)} aria-label="Anterior">‹</button>
        {games.map((g, i) => (
          <button
            key={g.id}
            className={`dot ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Ir a ${g.title}`}
          />
        ))}
        <button className="btn btn-ghost btn-sm" onClick={() => go(1)} aria-label="Siguiente">›</button>
      </div>
    </section>
  );
}