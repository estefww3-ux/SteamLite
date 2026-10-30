import '../juegos.css';
import Snake from './Snake.jsx';

// Registro de mini-juegos.
// La clave es el "gameKey" del games.json y el valor es el componente del juego.
export const GAME_COMPONENTS = {
  snake: Snake,
};