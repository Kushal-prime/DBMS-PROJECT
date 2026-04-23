import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="navbar">
          <Link to="/" className="logo">
            <span>Tech</span>Vault
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/cart" className="nav-link">Cart</Link>
            <Link to="/admin" className="nav-link">Admin</Link>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
