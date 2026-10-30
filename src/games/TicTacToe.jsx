import { useEffect, useState } from 'react';
import useBest from './useBest.js';

// Las 8 formas de ganar: 3 filas, 3 columnas y 2 diagonales
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const emptyBoard = () => Array(9).fill(null);

// Revisa si alguien ganó o si hay empate
function check(board) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return board.every(Boolean) ? { winner: 'draw', line: [] } : null;
}

// La IA: gana si puede, bloquea si debe, prefiere el centro y las esquinas.
// El 15% de las veces juega al azar, así se le puede ganar.
function pickMove(board) {
  const empty = board.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  const random = (list) => list[Math.floor(Math.random() * list.length)];
  if (Math.random() < 0.15) return random(empty);

  // Busca una línea con 2 marcas iguales y una casilla vacía
  const find = (mark) => {
    for (const cells of LINES) {
      const marks = cells.map((i) => board[i]);
      if (marks.filter((m) => m === mark).length === 2 && marks.includes(null)) {
        return cells[marks.indexOf(null)];
      }
    }
    return -1;
  };

  const win = find('O'); // 1. ¿puedo ganar?
  if (win >= 0) return win;
  const block = find('X'); // 2. ¿debo bloquear al jugador?
  if (block >= 0) return block;
  if (!board[4]) return 4; // 3. el centro
  const corners = [0, 2, 6, 8].filter((i) => !board[i]);
  return corners.length ? random(corners) : random(empty); // 4. una esquina o lo que quede
}

export default function TicTacToe() {
  const [board, setBoard] = useState(emptyBoard);
  const [turn, setTurn] = useState('X'); // tú eres X, la IA es O
  const [status, setStatus] = useState('ready'); // 'ready' | 'playing' | 'over'
  const [outcome, setOutcome] = useState(null);
  const [tally, setTally] = useState({ x: 0, o: 0, d: 0 }); // marcador de esta visita
  const [totalWins, , addWin] = useBest('steamlite_best_tictactoe'); // victorias guardadas

  // Empieza una ronda nueva
  const start = () => {
    setBoard(emptyBoard());
    setTurn('X');
    setOutcome(null);
    setStatus('playing');
  };

  // Después de cada jugada: revisa si terminó y, si es turno de la IA, la hace jugar
  useEffect(() => {
    if (status !== 'playing') return;

    const res = check(board);
    if (res) {
      setOutcome(res);
      setStatus('over');
      setTally((t) => ({
        x: t.x + (res.winner === 'X' ? 1 : 0),
        o: t.o + (res.winner === 'O' ? 1 : 0),
        d: t.d + (res.winner === 'draw' ? 1 : 0),
      }));
      if (res.winner === 'X') addWin();
      return;
    }

    if (turn === 'O') {
      const t = setTimeout(() => {
        const i = pickMove(board);
        setBoard((b) => b.map((v, k) => (k === i ? 'O' : v)));
        setTurn('X');
      }, 450); // pequeña pausa para que parezca que "piensa"
      return () => clearTimeout(t);
    }
  }, [board, turn, status, addWin]);

  // Tu jugada
  const play = (i) => {
    if (status !== 'playing' || turn !== 'X' || board[i]) return;
    setBoard((b) => b.map((v, k) => (k === i ? 'X' : v)));
    setTurn('O');
  };

  const title =
    outcome?.winner === 'X' ? '¡Ganaste!' : outcome?.winner === 'O' ? 'Ganó la IA' : 'Empate';
  const sub =
    outcome?.winner === 'X'
      ? 'Le ganaste a la máquina'
      : outcome?.winner === 'O'
        ? 'Inténtalo de nuevo'
        : 'Nadie completó una línea';

  return (
    <div className="game">
      <div className="game-hud">
        <span>
          Tú {tally.x} - {tally.o} IA <span className="muted">(empates: {tally.d})</span>
        </span>
        <span>Victorias: <strong>{totalWins}</strong></span>
      </div>

      <div className="game-frame">
        <div className="ttt-board">
          {board.map((cell, i) => (
            <button
              key={i}
              className={`ttt-cell ${cell ? cell.toLowerCase() : ''} ${outcome?.line.includes(i) ? 'win' : ''}`}
              onClick={() => play(i)}
              aria-label={cell ? `Casilla ${i + 1}: ${cell}` : `Casilla ${i + 1} vacía`}
            >
              {cell}
            </button>
          ))}
        </div>

        {status !== 'playing' && (
          <div className="game-overlay">
            {status === 'ready' && (
              <>
                <h2>Tres en Raya</h2>
                <p>Tú juegas con X y la máquina con O.</p>
              </>
            )}
            {status === 'over' && (
              <>
                <h2>{title}</h2>
                <p>{sub}</p>
              </>
            )}
            <button className="btn btn-primary" onClick={start}>
              {status === 'over' ? 'Jugar de nuevo' : 'Jugar'}
            </button>
          </div>
        )}
      </div>

      <p className="muted">Haz clic o toca una casilla vacía.</p>
    </div>
  );
}