import { useCallback, useEffect, useRef, useState } from 'react';
import useBest from './useBest.js';

const W = 480;
const H = 320;
const PH = 64;
const PW = 10;
const R = 7;
const EDGE = 16;
const WIN = 5; // puntos para ganar

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function serve(dir) {
  const angle = (Math.random() - 0.5) * 0.7;
  return { x: W / 2, y: H / 2, vx: Math.cos(angle) * 4.2 * dir, vy: Math.sin(angle) * 4.2 };
}

function bounce(b, paddleY, dir) {
  const rel = clamp((b.y - (paddleY + PH / 2)) / (PH / 2), -1, 1);
  const speed = Math.min(9, Math.hypot(b.vx, b.vy) * 1.06);
  const angle = rel * (Math.PI / 3.2);
  b.vx = Math.cos(angle) * speed * dir;
  b.vy = Math.sin(angle) * speed;
  b.x = dir === 1 ? EDGE + PW + R : W - EDGE - PW - R;
}

function createGame() {
  return {
    py: H / 2 - PH / 2,
    ay: H / 2 - PH / 2,
    ball: serve(Math.random() < 0.5 ? 1 : -1),
    ps: 0,
    as: 0,
    up: false,
    down: false,
  };
}

export default function Pong() {
  const canvasRef = useRef(null);
  const game = useRef(createGame());
  const [status, setStatus] = useState('ready'); // 'ready' | 'playing' | 'paused' | 'over'
  const [scores, setScores] = useState([0, 0]);
  const [result, setResult] = useState({ title: '', sub: '' });
  const [wins, , addWin] = useBest('steamlite_best_pong');

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const g = game.current;

    ctx.fillStyle = '#0d0e18';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let y = 8; y < H; y += 24) ctx.fillRect(W / 2 - 2, y, 4, 12);

    ctx.fillStyle = '#3fd0c9';
    ctx.fillRect(EDGE, g.py, PW, PH);
    ctx.fillStyle = '#ff5d8f';
    ctx.fillRect(W - EDGE - PW, g.ay, PW, PH);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(g.ball.x, g.ball.y, R, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  const toggle = useCallback(() => {
    if (status === 'playing') {
      setStatus('paused');
    } else if (status === 'paused') {
      setStatus('playing');
    } else {
      game.current = createGame();
      setScores([0, 0]);
      draw();
      setStatus('playing');
    }
  }, [status, draw]);

  // ---------- Bucle del juego ----------
  useEffect(() => {
    if (status !== 'playing') return;
    const g = game.current;
    let raf;
    let last = performance.now();
    let finished = false;

    const finish = (won) => {
      finished = true;
      if (won) addWin();
      setResult(
        won
          ? { title: '¡Ganaste!', sub: `Venciste a la IA ${g.ps} a ${g.as}` }
          : { title: 'Perdiste', sub: `La IA ganó ${g.as} a ${g.ps}` }
      );
      setStatus('over');
    };

    const point = (serveDir) => {
      setScores([g.ps, g.as]);
      if (g.ps >= WIN || g.as >= WIN) finish(g.ps >= WIN);
      else g.ball = serve(serveDir);
    };

    const frame = (now) => {
      const dt = Math.min(2, (now - last) / 16.667);
      last = now;

      g.py = clamp(g.py + ((g.down ? 1 : 0) - (g.up ? 1 : 0)) * 5.5 * dt, 0, H - PH);
      const maxMove = 3.2 * dt;
      g.ay = clamp(g.ay + clamp(g.ball.y - PH / 2 - g.ay, -maxMove, maxMove), 0, H - PH);

      const b = g.ball;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.y < R) {
        b.y = R;
        b.vy = Math.abs(b.vy);
      } else if (b.y > H - R) {
        b.y = H - R;
        b.vy = -Math.abs(b.vy);
      }

      if (b.vx < 0 && b.x - R <= EDGE + PW && b.x + R >= EDGE && b.y >= g.py - R && b.y <= g.py + PH + R) {
        bounce(b, g.py, 1);
      } else if (b.vx > 0 && b.x + R >= W - EDGE - PW && b.x - R <= W - EDGE && b.y >= g.ay - R && b.y <= g.ay + PH + R) {
        bounce(b, g.ay, -1);
      }

      if (b.x < -R) {
        g.as += 1;
        point(-1);
      } else if (b.x > W + R) {
        g.ps += 1;
        point(1);
      }

      draw();
      if (!finished) raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [status, draw, addWin]);

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

      const isUp = k === 'arrowup' || k === 'w';
      const isDown = k === 'arrowdown' || k === 's';
      if (!isUp && !isDown) return;
      e.preventDefault();
      if (status === 'ready' || status === 'over') toggle();
      if (status === 'paused') return;
      if (isUp) game.current.up = true;
      if (isDown) game.current.down = true;
    };

    const onUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') game.current.up = false;
      if (k === 'arrowdown' || k === 's') game.current.down = false;
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
    game.current.py = clamp(((e.clientY - rect.top) * H) / rect.height - PH / 2, 0, H - PH);
  };

  // Botones táctiles: mientras se mantienen pulsados, la paleta se mueve
  const hold = (dir, value) => () => {
    game.current[dir] = value;
  };

  return (
    <div className="game">
      <div className="game-hud">
        <span>Marcador: <strong>{scores[0]} - {scores[1]}</strong></span>
        <span>Victorias: <strong>{wins}</strong></span>
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
          aria-label="Cancha de Pong Rivals"
        />

        {status !== 'playing' && (
          <div className="game-overlay">
            {status === 'ready' && (
              <>
                <h2>Pong Rivals</h2>
                <p>Eres la paleta verde. Gana el primero en llegar a {WIN} puntos.</p>
              </>
            )}
            {status === 'paused' && <h2>Pausa</h2>}
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

      <p className="muted">Flechas o W/S, o mueve el mouse o el dedo sobre la cancha. Espacio pausa.</p>

      <div className="dpad" aria-label="Controles táctiles">
        {[['up', '▲', 'Subir'], ['down', '▼', 'Bajar']].map(([dir, icon, label]) => (
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