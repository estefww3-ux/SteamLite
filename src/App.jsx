import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import GameDetail from './pages/GameDetail.jsx';
import Cart from './pages/Cart.jsx';
import Library from './pages/Library.jsx';
import Play from './pages/Play.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="container page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/library" element={<Library />} />
          <Route path="/play/:id" element={<Play />} />
          <Route
            path="*"
            element={
              <div className="empty">
                <h2>Esta página no existe</h2>
                <Link className="btn btn-primary" to="/">Volver a la tienda</Link>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}