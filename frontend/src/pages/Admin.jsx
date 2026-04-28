import React, { useState, useEffect } from 'react';
import { fetchOrders, fetchProducts, createProduct, updateProduct, deleteProduct } from '../api';

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Laptop', image: '' });

  const fetchData = async () => {
    try {
      const [ordersData, productsData] = await Promise.all([fetchOrders(), fetchProducts()]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await updateProduct(editingId, formData); }
      else { await createProduct(formData); }
      setFormData({ name: '', price: '', category: 'Laptop', image: '' });
      setEditingId(null);
      fetchData();
    } catch (error) { console.error('Error saving product:', error); }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      fetchData();
    } catch (error) {
      alert("Cannot delete this product!\n\nDetails: " + error.message);
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setFormData({ name: product.name, price: product.price, category: product.category, image: product.image });
  };

  if (loading) return <div className="text-center mt-8">Loading admin dashboard...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-8">
        <h1>Admin Dashboard</h1>
        <div className="flex gap-4">
          <button className={`btn ${activeTab === 'orders' ? '' : 'btn-outline'}`} onClick={() => setActiveTab('orders')}>Orders</button>
          <button className={`btn ${activeTab === 'products' ? '' : 'btn-outline'}`} onClick={() => setActiveTab('products')}>Products</button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <>
          {orders.length === 0 ? (
            <div className="card text-center" style={{ padding: '4rem 2rem' }}><h2 style={{ color: 'var(--text-muted)' }}>No orders have been placed yet.</h2></div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orders.map(order => (
                <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
                  <div className="flex justify-between items-center mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <h3 style={{ color: 'var(--accent)', marginBottom: '0.25rem' }}>Order #{order.id}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{new Date(order.order_date).toLocaleString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{order.total_price.toFixed(2)}</p>
                      <p style={{ color: 'var(--text-main)' }}>Customer: <span style={{ fontWeight: 'bold' }}>{order.customer_name}</span></p>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2" style={{ color: 'var(--text-muted)' }}>Items:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {order.items && order.items.map((item, index) => (
                        <div key={index} style={{ background: 'rgba(15,23,42,0.5)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{item.quantity}x {item.name}</span>
                          <span style={{ color: 'var(--accent)' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'products' && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:grid-cols-1" style={{ gridColumn: 'span 1' }}>
            <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
              <h2 className="mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleProductSubmit}>
                <div className="mb-4">
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                  <input type="text" className="input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="mb-4">
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Price (₹)</label>
                  <input type="number" step="0.01" className="input" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div className="mb-4">
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                  <select className="input" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                    <option value="Laptop">Laptop</option>
                    <option value="Phone">Phone</option>
                    <option value="Headphones">Headphones</option>
                    <option value="Smartwatch">Smartwatch</option>
                    <option value="Keyboard">Keyboard</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Image URL</label>
                  <input type="text" className="input" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} required />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="btn" style={{ flex: 1 }}>{editingId ? 'Update' : 'Add'}</button>
                  {editingId && (<button type="button" className="btn btn-outline" onClick={() => { setEditingId(null); setFormData({ name: '', price: '', category: 'Laptop', image: '' }); }}>Cancel</button>)}
                </div>
              </form>
            </div>
          </div>
          <div className="md:grid-cols-2" style={{ gridColumn: 'span 2' }}>
            <div className="grid grid-cols-1 gap-4">
              {products.map(product => (
                <div key={product.id} className="card flex items-center justify-between" style={{ padding: '1rem', gap: '1rem' }}>
                  <img src={product.image} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>{product.name}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{product.category} - ₹{product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }} onClick={() => handleEditClick(product)}>Edit</button>
                    <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }} onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
