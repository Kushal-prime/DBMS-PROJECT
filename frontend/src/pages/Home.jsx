import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../api';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts(category);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [category]);

  const categories = ['Laptop', 'Phone', 'Headphones', 'Smartwatch', 'Keyboard'];

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(34,211,238,0.1) 0%, rgba(15,23,42,1) 100%)',
        padding: '4rem 2rem',
        borderRadius: '1rem',
        marginBottom: '3rem',
        border: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #22d3ee, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome to NexusCart
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          Discover the ultimate collection of premium tech gadgets. From ultra-slim laptops to next-gen wearables, elevate your digital lifestyle today.
        </p>
        <button className="btn" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          Shop Now
        </button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2>Discover Tech</h2>
        <select 
          className="input" 
          style={{ width: '200px' }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center mt-8">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 md:grid-cols-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      
      {!loading && products.length === 0 && (
        <div className="text-center text-muted mt-8">
          No products found in this category.
        </div>
      )}
    </div>
  );
};

export default Home;
