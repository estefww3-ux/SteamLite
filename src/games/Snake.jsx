import { useCallback, useEffect, useRef, useState } from 'react';

const COLS = 20;
const ROWS = 20;
const CELL = 20;
const SIZE = COLS * CELL;
const START_DELAY = 130; // milisegundos entre movimientos al empezar
const MIN_DELAY = 60; // velocidad máxima
const BEST_KEY = 'steamlite_best_snake';

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const KEYS = {
  arrowup: 'up',
  w: 'up',
  arrowdown: 'down',
  s: 'down',
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
};
const START_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

function randomFood(snake) {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

function createGame(food) {
  return {
    snake: START_SNAKE.map((s) => ({ ...s })),
    dir: 'right', // dirección con la que se movió la última vez
    nextDir: 'right', // dirección pedida por el jugador
    food,
    score: 0,
  };
}

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    /* sin espacio o navegación privada: no pasa nada */
  }
}

export default function Snake() {
  const canvasRef = useRef(null);
  const game = useRef(createGame({ x: 15, y: 10 }));
  const [status, setStatus] = useState('ready'); // 'ready' | 'playing' | 'paused' | 'over'
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(loadBest);
  const bestRef = useRef(best);

  // ---------- Dibujo ----------
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const g = game.current;

    // Fondo y cuadrícula
    ctx.fillStyle = '#0d0e18';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 1; i < COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(SIZE, i * CELL);
      ctx.stroke();
    }

    // Comida (con brillo)
    ctx.shadowColor = '#ff5d8f';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ff5d8f';
    ctx.beginPath();
    ctx.arc(g.food.x * CELL + CELL / 2, g.food.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
    ctx.fill();

    // Serpiente (con brillo neón)
    ctx.shadowColor = '#3fd0c9';
    ctx.shadowBlur = 10;
    g.snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#7ff5ee' : '#12c2a6';
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
    ctx.shadowBlur = 0;
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  // ---------- Acciones ----------
  const reset = useCallback(() => {
    game.current = createGame(randomFood(START_SNAKE));
    setScore(0);
    draw();
  }, [draw]);

  const toggle = useCallback(() => {
    if (status === 'playing') {
      setStatus('paused');
    } else if (status === 'paused') {
      setStatus('playing');
    } else {
      reset(); // 'ready' u 'over': empieza una partida nueva
      setStatus('playing');
    }
  }, [status, reset]);

  const turn = useCallback(
    (dir) => {
      if (status === 'paused') return;
      if (status !== 'playing') {
        reset();
        setStatus('playing');
      }
      const g = game.current;
      // No se puede dar media vuelta sobre sí misma
      if (OPPOSITE[dir] !== g.dir) g.nextDir = dir;
    },
    [status, reset]
  );

  // ---------- Bucle del juego ----------
  useEffect(() => {
    if (status !== 'playing') return;
    let timer;

    const tick = () => {
      const g = game.current;
      g.dir = g.nextDir;
      const d = DIRS[g.dir];
      const head = { x: g.snake[0].x + d.x, y: g.snake[0].y + d.y };

      const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
      const willEat = head.x === g.food.x && head.y === g.food.y;
      // Si no come, la cola se mueve y libera su casilla
      const body = willEat ? g.snake : g.snake.slice(0, -1);
      const hitSelf = body.some((s) => s.x === head.x && s.y === head.y);

      if (hitWall || hitSelf) {
        if (g.score > bestRef.current) {
          bestRef.current = g.score;
          setBest(g.score);
          saveBest(g.score);
        }
        setStatus('over');
        return;
      }

      g.snake = [head, ...body];
      if (willEat) {
        g.score += 10;
        g.food = randomFood(g.snake);
        setScore(g.score);
      }
      draw();

      // Cada 5 comidas va un poco más rápido
      const delay = Math.max(MIN_DELAY, START_DELAY - Math.floor(g.score / 50) * 10);
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, START_DELAY);
    return () => clearTimeout(timer);
  }, [status, draw]);

  // ---------- Teclado ----------
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
        return;
      }
      const dir = KEYS[e.key.toLowerCase()];
      if (!dir) return;
      e.preventDefault(); // evita que las flechas muevan la página
      turn(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle, turn]);

  return (
    <div className="game">
      <div className="game-hud">
        <span>Puntos: <strong>{score}</strong></span>
        <span>Récord: <strong>{best}</strong></span>
        <button className="btn btn-ghost btn-sm" onClick={toggle}>
          {status === 'playing' ? 'Pausa' : status === 'paused' ? 'Continuar' : 'Jugar'}
        </button>
      </div>

      <div className="game-frame">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="game-canvas"
          aria-label="Tablero de Neon Snake"
        />

        {status !== 'playing' && (
          <div className="game-overlay">
            {status === 'ready' && (
              <>
                <h2>Neon Snake</h2>
                <p>Pulsa Espacio o una flecha para empezar</p>
              </>
            )}
            {status === 'paused' && <h2>Pausa</h2>}
            {status === 'over' && (
              <>
                <h2>Game over</h2>
                <p>Hiciste {score} puntos</p>
              </>
            )}
            <button className="btn btn-primary" onClick={toggle}>
              {status === 'paused' ? 'Continuar' : status === 'over' ? 'Jugar de nuevo' : 'Jugar'}
            </button>
          </div>
        )}
      </div>

      <div className="dpad" aria-label="Controles táctiles">
        <button className="up" onClick={() => turn('up')} aria-label="Arriba">▲</button>
        <button className="left" onClick={() => turn('left')} aria-label="Izquierda">◀</button>
        <button className="down" onClick={() => turn('down')} aria-label="Abajo">▼</button>
        <button className="right" onClick={() => turn('right')} aria-label="Derecha">▶</button>
      </div>
    </div>
  );
}