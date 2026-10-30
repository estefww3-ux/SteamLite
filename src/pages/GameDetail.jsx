import { useEffect, useState } from 'react';
import '../detalle.css';
import { useCart } from '../context/CartContext.jsx';
import { Link, useParams } from 'react-router-dom';
import useGames from '../hooks/useGames.js';
import CoverArt from '../components/CoverArt.jsx';
import Shot from '../components/Shot.jsx';
import ScreenshotModal from '../components/ScreenshotModal.jsx';
import { formatPrice } from '../utils/format.js';
import { useLibrary } from '../context/LibraryContext.jsx';

const TABS = [
  { key: 'descripcion', label: 'Descripción' },
  { key: 'capturas', label: 'Capturas' },
  { key: 'resenas', label: 'Reseñas' },
];

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default function GameDetail() {
  const { id } = useParams();
  const { games, loading, error } = useGames();
  const { addToCart, isInCart } = useCart();
  const { isOwned } = useLibrary();
  const [tab, setTab] = useState('descripcion');
  const [shotIndex, setShotIndex] = useState(null); // null = modal cerrado

  // Al cambiar de juego, vuelve a la primera pestaña y cierra el modal
  useEffect(() => {
    setTab('descripcion');
    setShotIndex(null);
  }, [id]);

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

  // Si el juego no trae "screenshots" en el JSON, se usa su portada como captura
  const shots = game.screenshots?.length
    ? game.screenshots
    : [game.image ?? null];
  const reviews = game.reviews ?? [];
  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null;

  const inCart = isInCart(game.id);
  const owned = isOwned(game.id);

  return (
    <>
      <Link to="/" className="back">← Volver a la tienda</Link>

      <section className="detail">
        <div className="detail-cover">
          <CoverArt game={game} />
        </div>

        <div className="detail-info">
          <span className="tag">{game.genre}</span>
          <h1>{game.title}</h1>
          <p className="muted">{game.tagline}</p>
          <p className="muted">
            ★ {game.rating.toFixed(1)} · Lanzamiento: {game.releaseDate}
          </p>

          <div className="detail-actions">
            <span className="price price-lg">{formatPrice(game.price)}</span>
            {owned ? (
  <>
    <span className="owned-badge">✓ En tu biblioteca</span>
    <Link className="btn btn-primary" to={`/play/${game.id}`}>▶ Jugar</Link>
  </>
) : inCart ? (
  <Link className="btn btn-ghost" to="/cart">✓ En el carrito · Ver carrito</Link>
) : (
  <button className="btn btn-primary" onClick={() => addToCart(game)}>
    {game.price === 0 ? 'Obtener gratis' : 'Comprar'}
  </button>
)}
          </div>
        </div>
      </section>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={`tab ${tab === t.key ? 'is-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.key === 'resenas' && ` (${reviews.length})`}
          </button>
        ))}
      </div>

      <section className="tab-panel">
        {tab === 'descripcion' && (
          <>
            <p>{game.description}</p>
            <h3>Controles</h3>
            <p className="muted">{game.controls}</p>
          </>
        )}

        {tab === 'capturas' && (
          <div className="shots-grid">
            {shots.map((src, i) => (
              <button
                key={i}
                className="shot-btn"
                onClick={() => setShotIndex(i)}
                aria-label={`Ampliar captura ${i + 1}`}
              >
                <Shot game={game} src={src} label={`Captura ${i + 1} de ${game.title}`} />
              </button>
            ))}
          </div>
        )}

        {tab === 'resenas' && (
          <>
            {avg !== null && (
              <p className="muted">
                Promedio: <strong>{avg.toFixed(1)}</strong> / 5 · {reviews.length} reseña(s)
              </p>
            )}
            {reviews.length === 0 && <p className="muted">Aún no hay reseñas.</p>}
            <ul className="reviews">
              {reviews.map((r, i) => (
                <li key={i} className="review">
                  <div className="review-head">
                    <strong>{r.user}</strong>
                    <span className="stars" aria-label={`${r.rating} de 5`}>{stars(r.rating)}</span>
                  </div>
                  <p>{r.text}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {shotIndex !== null && (
        <ScreenshotModal
          game={game}
          shots={shots}
          index={shotIndex}
          onClose={() => setShotIndex(null)}
          onChange={setShotIndex}
        />
      )}
    </>
  );
}