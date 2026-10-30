import { useEffect, useState } from 'react';

export default function CoverArt({ game, className = '' }) {
  const [c1, c2] = game.colors;
  const [failed, setFailed] = useState(false);

  // Si cambia de juego (por ejemplo en el carrusel), vuelve a intentar con su imagen
  useEffect(() => {
    setFailed(false);
  }, [game.image]);

  const showImage = game.image && !failed;

  return (
    <div
      className={`cover ${className}`}
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
      role="img"
      aria-label={`Portada de ${game.title}`}
    >
      {showImage ? (
        <img
          src={game.image}
          alt=""
          className="cover-img"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="cover-emoji">{game.emoji}</span>
      )}
    </div>
  );
}