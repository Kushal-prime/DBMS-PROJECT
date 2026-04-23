import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = category 
        ? `http://localhost:5000/products?category=${encodeURIComponent(category)}`
        : 'http://localhost:5000/products';
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const categories = ['Laptop', 'Phone', 'Headphones', 'Smartwatch', 'Keyboard'];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1>Discover Tech</h1>
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
