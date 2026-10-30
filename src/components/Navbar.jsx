import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={close}>
          <span className="logo-mark">▶</span>SteamLite
        </Link>
        <button className="menu-btn" aria-label="Abrir menú" onClick={() => setOpen((o) => !o)}>
          ☰
        </button>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Tienda</NavLink>
          <NavLink to="/library" onClick={close}>Biblioteca</NavLink>
          <NavLink to="/cart" onClick={close}>Carrito</NavLink>
        </nav>
      </div>
    </header>
  );
}