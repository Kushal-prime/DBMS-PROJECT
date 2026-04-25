import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    setAdding(true);
    try {
      const response = await fetch('http://localhost:5000/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity: 1 })
      });
      if (response.ok) {
        toast.success(`${product.name} added to cart!`);
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (!product) return <div className="text-center mt-8 text-danger">Product not found.</div>;

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <img 
            src={product.image} 
            alt={product.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '300px' }} 
          />
        </div>
        <div style={{ flex: '1 1 300px', padding: '2rem' }}>
          <span style={{ 
            background: 'rgba(34, 211, 238, 0.1)', 
            color: 'var(--accent)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '1rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            {product.category}
          </span>
          <h1 style={{ marginBottom: '1rem' }}>{product.name}</h1>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '2rem' }}>
            ₹{product.price.toFixed(2)}
          </p>
          
          <div style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Experience the next generation of {product.category.toLowerCase()} technology with the {product.name}. 
            Built with premium materials and cutting-edge features to elevate your digital lifestyle.
          </div>

          <button 
            className="btn" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            onClick={addToCart}
            disabled={adding}
          >
            {adding ? 'Adding to Cart...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
