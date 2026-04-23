import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="card">
      <img 
        src={product.image} 
        alt={product.name} 
        style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
      />
      <div style={{ padding: '1.5rem' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{product.name}</h3>
          <span style={{ 
            background: 'rgba(34, 211, 238, 0.1)', 
            color: 'var(--accent)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '1rem',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {product.category}
          </span>
        </div>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1.5rem' }}>
          ₹{product.price.toFixed(2)}
        </p>
        <div className="flex gap-2">
          <Link to={`/product/${product.id}`} className="btn btn-outline" style={{ flex: 1, textAlign: 'center', padding: '0.75rem 0.5rem' }}>
            Details
          </Link>
          <button 
            className="btn" 
            style={{ flex: 1, padding: '0.75rem 0.5rem' }}
            onClick={async () => {
              try {
                await fetch('http://localhost:5000/cart', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ product_id: product.id, quantity: 1 })
                });
                alert('Added to cart!');
              } catch (e) {
                console.error(e);
              }
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
