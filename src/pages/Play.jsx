import { useParams } from 'react-router-dom';

export default function Play() {
  const { id } = useParams();
  return <h1>Jugando: {id}</h1>;
}