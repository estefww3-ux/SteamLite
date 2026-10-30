import { useEffect } from 'react';
import Shot from './Shot.jsx';

export default function ScreenshotModal({ game, shots, index, onClose, onChange }) {
  const total = shots.length;
  const prev = () => onChange((index - 1 + total) % total);
  const next = () => onChange((index + 1) % total);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = oldOverflow;
    };
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Captura ${index + 1} de ${total}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        <Shot game={game} src={shots[index]} label={`Captura ${index + 1} de ${game.title}`} />
        <div className="modal-nav">
          <button className="btn btn-ghost btn-sm" onClick={prev}>‹ Anterior</button>
          <span className="muted">{index + 1} / {total}</span>
          <button className="btn btn-ghost btn-sm" onClick={next}>Siguiente ›</button>
        </div>
      </div>
    </div>
  );
}