import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import CoverArt from '../components/CoverArt.jsx';
import { formatPrice } from '../utils/format.js';
import '../carrito.css';

export default function Cart() {
  const { items, count, subtotal, total, removeFromCart, clearCart } = useCart();

  if (count === 0) {
    return (
      <div className="empty">
        <h2>Tu carrito está vacío</h2>
        <p>Explora la tienda y añade tus juegos favoritos.</p>
        <Link className="btn btn-primary" to="/">Ir a la tienda</Link>
      </div>
    );
  }

  return (
    <>
      <h1>Carrito</h1>

      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.id} className="cart-item">
              <Link to={`/game/${item.id}`} className="cart-thumb">
                <CoverArt game={item} />
              </Link>

              <div className="cart-info">
                <span className="tag">{item.genre}</span>
                <h3><Link to={`/game/${item.id}`}>{item.title}</Link></h3>
              </div>

              <div className="cart-side">
                <span className="price">{formatPrice(item.price)}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Quitar ${item.title} del carrito`}
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>

        <aside className="cart-summary">
          <h2>Resumen</h2>
          <div className="summary-row">
            <span>Subtotal ({count} {count === 1 ? 'juego' : 'juegos'})</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          {/* TODO feature/checkout: aquí va el formulario de pago */}
          <button className="btn btn-primary" disabled>Proceder al pago</button>
          <button className="btn btn-ghost" onClick={clearCart}>Vaciar carrito</button>
        </aside>
      </div>
    </>
  );
}