import { useCallback, useEffect, useRef, useState } from 'react';
import useBest from './useBest.js';

const W = 480;
const H = 360;
const COLS = 10;
const ROWS = 5;
const BW = 44;
const BH = 16;
const GAP = 4;
const TOP = 44;
const LEFT = (W - (COLS * (BW + GAP) - GAP)) / 2;
const PAD_W = 84;
const PAD_H = 12;
const PAD_Y = H - 28;
const R = 7;
const LIVES = 3;
const BASE_SPEED = 5;
const ROW_COLORS = ['#ff5d8f', '#ff9a5d', '#f9c74f', '#90be6d', '#3fd0c9'];

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function createBricks() {
  const bricks = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      bricks.push({ x: LEFT + col * (BW + GAP), y: TOP + row * (BH + GAP), row, alive: true });
    }
  }
  return bricks;
}

function launch(speed) {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
  return { x: W / 2, y: PAD_Y - R - 2, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
}

// Crea una partida nueva desde cero
function createGame() {
  return {
    px: W / 2 - PAD_W / 2,
    ball: launch(BASE_SPEED),
    bricks: createBricks(),
    remaining: ROWS * COLS, // ladrillos que quedan
    score: 0,
    lives: LIVES,
    speed: BASE_SPEED,
    left: false,
    right: false,
  };
}

export default function Breakout() {
  const canvasRef = useRef(null);
  const game = useRef(createGame());
  const [status, setStatus] = useState('ready'); // 'ready' | 'playing' | 'paused' | 'over'
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [note, setNote] = useState(''); // aviso al perder una vida
  const [result, setResult] = useState({ title: '', sub: '' });
  const [best, submit] = useBest('steamlite_best_breakout');

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const g = game.current;

    ctx.fillStyle = '#0d0e18';
    ctx.fillRect(0, 0, W, H);

    g.bricks.forEach((b) => {
      if (!b.alive) return;
      ctx.fillStyle = ROW_COLORS[b.row];
      ctx.fillRect(b.x, b.y, BW, BH);
    });

    ctx.fillStyle = '#3fd0c9';
    ctx.fillRect(g.px, PAD_Y, PAD_W, PAD_H);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(g.ball.x, g.ball.y, R, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  // Un solo botón para empezar, pausar y continuar
  const toggle = useCallback(() => {
    if (status === 'playing') {
      setStatus('paused');
    } else if (status === 'paused') {
      setNote('');
      setStatus('playing');
    } else {
      // 'ready' u 'over': partida nueva
      game.current = createGame();
      setScore(0);
      setLives(LIVES);
      setNote('');
      draw();
      setStatus('playing');
    }
  }, [status, draw]);

  // ---------- Bucle del juego: solo corre cuando status es 'playing' ----------
  useEffect(() => {
    if (status !== 'playing') return;
    const g = game.current;
    let raf;
    let last = performance.now();
    let stop = false;

    const finish = (won) => {
      stop = true;
      submit(g.score);
      setResult(
        won
          ? { title: '¡Muro destruido!', sub: `Hiciste ${g.score} puntos` }
          : { title: 'Game over', sub: `Hiciste ${g.score} puntos` }
      );
      setStatus('over');
    };

    const frame = (now) => {
      const dt = Math.min(2, (now - last) / 16.667);
      last = now;

      g.px = clamp(g.px + ((g.right ? 1 : 0) - (g.left ? 1 : 0)) * 7 * dt, 0, W - PAD_W);

      const b = g.ball;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.x < R) {
        b.x = R;
        b.vx = Math.abs(b.vx);
      } else if (b.x > W - R) {
        b.x = W - R;
        b.vx = -Math.abs(b.vx);
      }
      if (b.y < R) {
        b.y = R;
        b.vy = Math.abs(b.vy);
      }

      if (b.vy > 0 && b.y + R >= PAD_Y && b.y + R <= PAD_Y + PAD_H + 8 && b.x >= g.px - R && b.x <= g.px + PAD_W + R) {
        const rel = clamp((b.x - (g.px + PAD_W / 2)) / (PAD_W / 2), -1, 1);
        const angle = rel * (Math.PI / 3);
        b.vx = Math.sin(angle) * g.speed;
        b.vy = -Math.cos(angle) * g.speed;
        b.y = PAD_Y - R;
      }

      // Ladrillos
      for (const brick of g.bricks) {
        if (!brick.alive) continue;
        const cx = clamp(b.x, brick.x, brick.x + BW);
        const cy = clamp(b.y, brick.y, brick.y + BH);
        const dx = b.x - cx;
        const dy = b.y - cy;
        if (dx * dx + dy * dy <= R * R) {
          brick.alive = false;
          g.remaining -= 1;
          g.score += (ROWS - brick.row) * 10; // las filas de arriba valen más
          setScore(g.score);
          if (Math.abs(dx) > Math.abs(dy)) b.vx = -b.vx;
          else b.vy = -b.vy;
          // Cada ladrillo roto acelera un poco la bola
          g.speed = Math.min(8, BASE_SPEED + (ROWS * COLS - g.remaining) * 0.04);
          const k = g.speed / Math.hypot(b.vx, b.vy);
          b.vx *= k;
          b.vy *= k;
          break;
        }
      }

      // ¿Ya no quedan ladrillos?
      if (g.remaining === 0) {
        draw();
        finish(true);
        return;
      }

      // La bola se cae: pierdes una vida
      if (b.y - R > H) {
        g.lives -= 1;
        setLives(g.lives);
        if (g.lives <= 0) {
          draw();
          finish(false);
          return;
        }
        g.ball = launch(g.speed);
        g.px = W / 2 - PAD_W / 2;
        draw();
        setNote(`Perdiste una vida. Te quedan ${g.lives}`);
        setStatus('paused');
        return;
      }

      draw();
      if (!stop) raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [status, draw, submit]);

  // ---------- Teclado ----------
  useEffect(() => {
    const onDown = (e) => {
      const k = e.key.toLowerCase();

      if (e.code === 'Space') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        toggle();
        return;
      }

      const isLeft = k === 'arrowleft' || k === 'a';
      const isRight = k === 'arrowright' || k === 'd';
      if (!isLeft && !isRight) return;
      e.preventDefault();
      if (status === 'ready' || status === 'over') toggle(); // una flecha también empieza
      if (status === 'paused') return;
      if (isLeft) game.current.left = true;
      if (isRight) game.current.right = true;
    };

    const onUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') game.current.left = false;
      if (k === 'arrowright' || k === 'd') game.current.right = false;
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [status, toggle]);

  // Mover la paleta con el mouse o el dedo
  const onPointerMove = (e) => {
    if (status !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    game.current.px = clamp(((e.clientX - rect.left) * W) / rect.width - PAD_W / 2, 0, W - PAD_W);
  };

  // Botones táctiles: mientras se mantienen pulsados, la paleta se mueve
  const hold = (dir, value) => () => {
    game.current[dir] = value;
  };

  return (
    <div className="game">
      <div className="game-hud">
        <span>Puntos: <strong>{score}</strong></span>
        <span>Vidas: <strong>{lives}</strong></span>
        <span>Récord: <strong>{best}</strong></span>
        <button className="btn btn-ghost btn-sm" onClick={toggle}>
          {status === 'playing' ? 'Pausa' : status === 'paused' ? 'Continuar' : 'Jugar'}
        </button>
      </div>

      <div className="game-frame">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="game-canvas"
          style={{ aspectRatio: `${W} / ${H}` }}
          onPointerMove={onPointerMove}
          aria-label="Tablero de Brick Breaker"
        />

        {status !== 'playing' && (
          <div className="game-overlay">
            {status === 'ready' && (
              <>
                <h2>Brick Breaker</h2>
                <p>Rompe todos los ladrillos. Tienes {LIVES} vidas.</p>
              </>
            )}
            {status === 'paused' && <h2>{note || 'Pausa'}</h2>}
            {status === 'over' && (
              <>
                <h2>{result.title}</h2>
                <p>{result.sub}</p>
              </>
            )}
            <button className="btn btn-primary" onMouseDown={(e) => e.preventDefault()} onClick={toggle}>
              {status === 'paused' ? 'Continuar' : status === 'over' ? 'Jugar de nuevo' : 'Jugar'}
            </button>
          </div>
        )}
      </div>

      <p className="muted">Flechas o A/D, o mueve el mouse o el dedo sobre el tablero. Espacio pausa.</p>

      <div className="dpad" aria-label="Controles táctiles">
        {[['left', '◀', 'Izquierda'], ['right', '▶', 'Derecha']].map(([dir, icon, label]) => (
          <button
            key={dir}
            className={dir}
            aria-label={label}
            style={{ touchAction: 'none' }}
            onPointerDown={hold(dir, true)}
            onPointerUp={hold(dir, false)}
            onPointerLeave={hold(dir, false)}
            onPointerCancel={hold(dir, false)}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}