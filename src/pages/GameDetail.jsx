import { Link, useParams } from 'react-router-dom';

export default function GameDetail() {
  const { id } = useParams();
  return (
    <>
      <Link to="/" className="back">← Volver a la tienda</Link>
      <h1>Detalle del juego: {id}</h1>
    </>
  );
}