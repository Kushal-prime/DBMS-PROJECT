import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import './index.css';

function App() {
  return (
    <HashRouter>
      <div className="app-container">
        <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
        <nav className="navbar">
          <Link to="/" className="logo">
            <span>Nexus</span>Cart
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/cart" className="nav-link">Cart</Link>
            <Link to="/admin" className="nav-link">Admin</Link>
            <Link to="/login" className="nav-link" style={{ marginLeft: '1rem', background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold' }}>Login</Link>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
