import { useCallback, useEffect, useRef, useState } from 'react';
import useBest from './useBest.js';

const W = 320;
const H = 480;
const GROUND = 40; // alto del suelo
const BX = 90; // posición horizontal del ave (fija)
const R = 13; // radio del ave
const GAP = 150; // espacio entre la tubería de arriba y la de abajo
const PIPE_W = 56;
const SPACING = 190; // distancia entre un par de tuberías y el siguiente
const SPEED = 2.6; // velocidad con la que avanzan las tuberías
const GRAVITY = 0.45; // cuánto cae el ave en cada cuadro
const FLAP = -7.4; // impulso hacia arriba al aletear

function createGame() {
  return { y: H / 2 - 40, vy: 0, pipes: [], since: SPACING, score: 0 };
}

export default function Flappy() {
  const canvasRef = useRef(null);
  const game = useRef(createGame());
  const [status, setStatus] = useState('ready'); // 'ready' | 'playing' | 'paused' | 'over'
  const [score, setScore] = useState(0);
  const [best, submit] = useBest('steamlite_best_flappy');

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const g = game.current;

    // Cielo
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#1b2a6b');
    sky.addColorStop(1, '#0d0e18');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Tuberías (arriba y abajo, con una "boca" más ancha)
    g.pipes.forEach((p) => {
      ctx.fillStyle = '#2a9d98';
      ctx.fillRect(p.x, 0, PIPE_W, p.top);
      ctx.fillRect(p.x, p.top + GAP, PIPE_W, H - GROUND - p.top - GAP);
      ctx.fillStyle = '#3fd0c9';
      ctx.fillRect(p.x - 4, p.top - 18, PIPE_W + 8, 18);
      ctx.fillRect(p.x - 4, p.top + GAP, PIPE_W + 8, 18);
    });

    // Suelo
    ctx.fillStyle = '#25283d';
    ctx.fillRect(0, H - GROUND, W, GROUND);
    ctx.fillStyle = '#31344f';
    ctx.fillRect(0, H - GROUND, W, 4);

    // Ave: se inclina hacia arriba al subir y hacia abajo al caer
    ctx.save();
    ctx.translate(BX, g.y);
    ctx.rotate(Math.max(-0.5, Math.min(0.9, g.vy * 0.07)));
    ctx.fillStyle = '#f9c74f'; // cuerpo
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f3a712'; // ala
    ctx.beginPath();
    ctx.ellipse(-4, 4, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff'; // ojo
    ctx.beginPath();
    ctx.arc(5, -4, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0d0e18'; // pupila
    ctx.beginPath();
    ctx.arc(6.5, -4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff5d8f'; // pico
    ctx.beginPath();
    ctx.moveTo(R - 2, -1);
    ctx.lineTo(R + 9, 3);
    ctx.lineTo(R - 2, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  // Una sola acción para espacio, flecha arriba y toque: empieza, continúa o aletea
  const action = useCallback(() => {
    if (status === 'playing') {
      game.current.vy = FLAP; // aletea
      return;
    }
    if (status === 'paused') {
      setStatus('playing');
      return;
    }
    // 'ready' u 'over': partida nueva
    game.current = createGame();
    setScore(0);
    draw();
    game.current.vy = FLAP;
    setStatus('playing');
  }, [status, draw]);

  const togglePause = useCallback(() => {
    if (status === 'playing') setStatus('paused');
    else if (status === 'paused') setStatus('playing');
  }, [status]);

  // ---------- Bucle del juego: solo corre cuando status es 'playing' ----------
  useEffect(() => {
    if (status !== 'playing') return;
    const g = game.current;
    let raf;
    let last = performance.now();
    let stop = false;

    const die = () => {
      stop = true;
      submit(g.score);
      draw();
      setStatus('over');
    };

    const frame = (now) => {
      const dt = Math.min(2, (now - last) / 16.667);
      last = now;

      // 1. Gravedad: el ave siempre cae, el aleteo la impulsa hacia arriba
      g.vy += GRAVITY * dt;
      g.y += g.vy * dt;

      // 2. Nuevas tuberías cada cierta distancia
      g.since += SPEED * dt;
      if (g.since >= SPACING) {
        g.since = 0;
        g.pipes.push({ x: W + 10, top: 50 + Math.random() * (H - GROUND - GAP - 100), passed: false });
      }

      // 3. Mover las tuberías y borrar las que ya salieron
      g.pipes.forEach((p) => {
        p.x -= SPEED * dt;
      });
      g.pipes = g.pipes.filter((p) => p.x > -PIPE_W - 10);

      // 4. El techo solo detiene al ave, no la mata
      if (g.y < R) {
        g.y = R;
        g.vy = 0;
      }

      // 5. Choques y puntos
      for (const p of g.pipes) {
        const insideX = BX + R > p.x && BX - R < p.x + PIPE_W;
        if (insideX && (g.y - R < p.top || g.y + R > p.top + GAP)) {
          die();
          return;
        }
        if (!p.passed && p.x + PIPE_W < BX - R) {
          p.passed = true; // pasaste este par de tuberías
          g.score += 1;
          setScore(g.score);
        }
      }

      // 6. El suelo sí mata
      if (g.y + R >= H - GROUND) {
        g.y = H - GROUND - R;
        die();
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
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (e.code === 'Space' || k === 'arrowup' || k === 'w') {
        e.preventDefault();
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        if (!e.repeat) action(); // e.repeat evita aletear sin parar al dejar la tecla pulsada
      } else if (k === 'p' || k === 'escape') {
        togglePause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [action, togglePause]);

  return (
    <div className="game">
      <div className="game-hud" style={{ width: `min(100%, ${W}px)` }}>
        <span>Puntos: <strong>{score}</strong></span>
        <span>Récord: <strong>{best}</strong></span>
        <button className="btn btn-ghost btn-sm" onClick={status === 'playing' ? togglePause : action}>
          {status === 'playing' ? 'Pausa' : status === 'paused' ? 'Continuar' : 'Jugar'}
        </button>
      </div>

      <div className="game-frame" style={{ width: `min(100%, ${W}px)` }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="game-canvas"
          style={{ aspectRatio: `${W} / ${H}` }}
          onPointerDown={action}
          aria-label="Tablero de Sky Flap"
        />

        {status !== 'playing' && (
          <div className="game-overlay">
            {status === 'ready' && (
              <>
                <h2>Sky Flap</h2>
                <p>Pulsa Espacio o toca el tablero para aletear y pasar entre las tuberías.</p>
              </>
            )}
            {status === 'paused' && <h2>Pausa</h2>}
            {status === 'over' && (
              <>
                <h2>Te estrellaste</h2>
                <p>Pasaste {score} {score === 1 ? 'par de tuberías' : 'pares de tuberías'}</p>
              </>
            )}
            <button className="btn btn-primary" onMouseDown={(e) => e.preventDefault()} onClick={action}>
              {status === 'paused' ? 'Continuar' : status === 'over' ? 'Jugar de nuevo' : 'Jugar'}
            </button>
          </div>
        )}
      </div>

      <p className="muted">Espacio, flecha arriba o toque para aletear. P pausa.</p>
    </div>
  );
}