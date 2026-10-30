import '../juegos.css';
import Snake from './Snake.jsx';
import Pong from './Pong.jsx';
import Breakout from './Breakout.jsx';
import Memory from './Memory.jsx';
import TicTacToe from './TicTacToe.jsx';
import Flappy from './Flappy.jsx';

// Registro de mini-juegos.
// La clave es el "gameKey" del games.json y el valor es el componente del juego.
export const GAME_COMPONENTS = {
  snake: Snake,
  pong: Pong,
  breakout: Breakout,
  memory: Memory,
  tictactoe: TicTacToe,
  flappy: Flappy,
};