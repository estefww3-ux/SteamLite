export default function CoverArt({ game, className = '' }) {
  const [c1, c2] = game.colors;
  return (
    <div
      className={`cover ${className}`}
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
      role="img"
      aria-label={`Portada de ${game.title}`}
    >
      {game.image ? (
        <img src={game.image} alt="" className="cover-img" loading="lazy" />
      ) : (
        <span className="cover-emoji">{game.emoji}</span>
      )}
    </div>
  );
}