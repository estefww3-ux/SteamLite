import { useEffect, useState } from 'react';
import useBest from './useBest.js';

const ICONS = ['🚀', '👾', '🎮', '🕹️', '⭐', '💎', '🔥', '🍄'];

function makeDeck() {
  const deck = [...ICONS, ...ICONS].map((icon, id) => ({ id, icon }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export default function Memory() {
  const [deck, setDeck] = useState(makeDeck);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState('ready'); // 'ready' | 'playing' | 'over'
  // 'min' significa que gana el número MÁS BAJO (menos movimientos)
  const [best, submit] = useBest('steamlite_best_memory', 'min');

  // Empieza una partida nueva: mezcla las cartas y reinicia todo
  const start = () => {
    setDeck(makeDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setStatus('playing');
  };

  // Cuando hay dos cartas volteadas, revisamos si son pareja
  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped.map((id) => deck.find((c) => c.id === id));
    setMoves((m) => m + 1);

    if (a.icon === b.icon) {
      setMatched((m) => [...m, a.id, b.id]);
      setFlipped([]);
      return;
    }
    const t = setTimeout(() => setFlipped([]), 800);
    return () => clearTimeout(t);
  }, [flipped, deck]);

  // ¿Ya están todas las parejas? Entonces termina y guarda el récord
  useEffect(() => {
    if (status === 'playing' && matched.length === deck.length) {
      submit(moves);
      setStatus('over');
    }
  }, [matched, moves, status, deck.length, submit]);

  const flip = (id) => {
    if (status !== 'playing') return;
    if (flipped.length >= 2 || flipped.includes(id) || matched.includes(id)) return;
    setFlipped((f) => [...f, id]);
  };

  return (
    <div className="game">
      <div className="game-hud">
        <span>Movimientos: <strong>{moves}</strong></span>
        <span>Mejor: <strong>{best || '–'}</strong></span>
        <button className="btn btn-ghost btn-sm" onClick={start}>
          {status === 'playing' ? 'Reiniciar' : 'Jugar'}
        </button>
      </div>

      <div className="game-frame">
        <div className="memory-grid">
          {deck.map((card) => {
            const isMatched = matched.includes(card.id);
            const show = isMatched || flipped.includes(card.id);
            return (
              <button
                key={card.id}
                className={`mem-card ${show ? 'show' : ''} ${isMatched ? 'matched' : ''}`}
                onClick={() => flip(card.id)}
                aria-label={show ? card.icon : 'Carta oculta'}
              >
                {show ? card.icon : '?'}
              </button>
            );
          })}
        </div>

        {status !== 'playing' && (
          <div className="game-overlay">
            {status === 'ready' && (
              <>
                <h2>Memory Match</h2>
                <p>Encuentra las 8 parejas con la menor cantidad de movimientos.</p>
              </>
            )}
            {status === 'over' && (
              <>
                <h2>¡Completado!</h2>
                <p>Lo lograste en {moves} movimientos</p>
              </>
            )}
            <button className="btn btn-primary" onClick={start}>
              {status === 'over' ? 'Jugar de nuevo' : 'Jugar'}
            </button>
          </div>
        )}
      </div>

      <p className="muted">Haz clic o toca las cartas para voltearlas.</p>
    </div>
  );
}