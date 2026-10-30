export default function Shot({ game, src, label }) {
  if (src) {
    return <img className="shot-img" src={src} alt={label} loading="lazy" />;
  }
  const [a, b] = game.colors;
  return (
    <div
      className="shot-img shot-placeholder"
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
      role="img"
      aria-label={label}
    >
      <span>{game.emoji}</span>
    </div>
  );
}