import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:5000/cart');
      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeItem = async (id) => {
    try {
      await fetch(`http://localhost:5000/cart/${id}`, { method: 'DELETE' });
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || cartItems.length === 0) return;

    setCheckingOut(true);
    try {
      const response = await fetch('http://localhost:5000/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_name: customerName })
      });
      
      if (response.ok) {
        setCheckoutMessage('Order placed successfully!');
        setCartItems([]);
        setCustomerName('');
      } else {
        const err = await response.json();
        setCheckoutMessage(err.error || 'Checkout failed');
      }
    } catch (error) {
      setCheckoutMessage('Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) return <div className="text-center mt-8">Loading cart...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 className="mb-8">Your Cart</h1>
      
      {checkoutMessage && (
        <div style={{ 
          padding: '1rem', 
          background: checkoutMessage.includes('success') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: checkoutMessage.includes('success') ? '#22c55e' : '#ef4444',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          border: `1px solid ${checkoutMessage.includes('success') ? '#22c55e' : '#ef4444'}`
        }}>
          {checkoutMessage}
        </div>
      )}

      {cartItems.length === 0 && !checkoutMessage.includes('success') ? (
        <div className="card text-center" style={{ padding: '4rem 2rem' }}>
          <h2 style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Your cart is empty</h2>
          <Link to="/" className="btn">Browse Products</Link>
        </div>
      ) : cartItems.length > 0 ? (
        <div className="grid md:grid-cols-3">
          <div className="md:grid-cols-2" style={{ gridColumn: 'span 2' }}>
            {cartItems.map(item => (
              <div key={item.cart_id} className="card mb-4 flex items-center" style={{ padding: '1rem', gap: '1.5rem' }}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.5rem' }} 
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>{item.name}</h3>
                  <p style={{ color: 'var(--accent)', fontWeight: 'bold' }}>₹{item.price.toFixed(2)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ marginBottom: '0.5rem' }}>Qty: {item.quantity}</p>
                  <button 
                    onClick={() => removeItem(item.cart_id)}
                    className="btn btn-danger"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
            <h2 className="mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between mb-8">
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Total</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
            </div>
            
            <form onSubmit={handleCheckout}>
              <div className="mb-4">
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                  Customer Name
                </label>
                <input 
                  type="text" 
                  className="input" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn" 
                style={{ width: '100%', padding: '1rem' }}
                disabled={checkingOut || !customerName.trim()}
              >
                {checkingOut ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Cart;
