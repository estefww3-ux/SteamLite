import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useLibrary } from '../context/LibraryContext.jsx';
import CoverArt from '../components/CoverArt.jsx';
import CheckoutForm from '../components/CheckoutForm.jsx';
import { formatPrice } from '../utils/format.js';
import '../carrito.css';
import '../checkout.css';

export default function Cart() {
  const { items, count, subtotal, total, removeFromCart, clearCart } = useCart();
  const { addToLibrary } = useLibrary();
  const [step, setStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [order, setOrder] = useState(null);

  // Se ejecuta cuando el formulario es válido y el "pago" termina
  const handlePay = (values) => {
    addToLibrary(items); // los juegos pasan a la biblioteca (localStorage)
    setOrder({
      number: `SL-${Date.now().toString(36).toUpperCase()}`,
      name: values.fullName,
      email: values.email,
      total,
      items,
    });
    clearCart();
    setStep('success');
  };

  if (step === 'success' && order) {
    return (
      <div className="success">
        <div className="success-icon" aria-hidden="true">✓</div>
        <h1>¡Compra realizada!</h1>
        <p className="muted">
          Gracias, {order.name}. Te enviamos el recibo (simulado) a {order.email}.
        </p>
        <p>
          Pedido <strong>{order.number}</strong> · Total <strong>{formatPrice(order.total)}</strong>
        </p>
        <ul className="success-list">
          {order.items.map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
        <div className="success-actions">
          <Link className="btn btn-primary" to="/library">Ir a mi biblioteca</Link>
          <Link className="btn btn-ghost" to="/">Seguir comprando</Link>
        </div>
      </div>
    );
  }

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
      <h1>{step === 'checkout' ? 'Finalizar compra' : 'Carrito'}</h1>

      <div className="cart-layout">
        {step === 'cart' ? (
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
        ) : (
          <CheckoutForm total={total} onBack={() => setStep('cart')} onPay={handlePay} />
        )}

        <aside className="cart-summary">
          <h2>Resumen</h2>

          {step === 'checkout' && (
            <ul className="summary-items">
              {items.map((item) => (
                <li key={item.id}>
                  <span>{item.title}</span>
                  <span>{formatPrice(item.price)}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="summary-row">
            <span>Subtotal ({count} {count === 1 ? 'juego' : 'juegos'})</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          {step === 'cart' && (
            <>
              <button className="btn btn-primary" onClick={() => setStep('checkout')}>
                Proceder al pago
              </button>
              <button className="btn btn-ghost" onClick={clearCart}>Vaciar carrito</button>
            </>
          )}
        </aside>
      </div>
    </>
  );
}