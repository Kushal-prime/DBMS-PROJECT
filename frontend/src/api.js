// Centralized API helper with automatic fallback to mock data
// When the backend is reachable (local dev), it uses real API calls.
// When it's not (GitHub Pages), it falls back to localStorage + mock data.

import { defaultProducts, defaultOrders } from './mockData.js';

const API_BASE = 'http://localhost:5000';

// --- Backend availability detection ---
let _backendAvailable = null; // null = not checked yet

async function isBackendAvailable() {
  if (_backendAvailable !== null) return _backendAvailable;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE}/products`, { signal: controller.signal });
    clearTimeout(timeout);
    _backendAvailable = res.ok;
  } catch {
    _backendAvailable = false;
  }
  return _backendAvailable;
}

// --- localStorage helpers ---
function getLocalCart() {
  try {
    return JSON.parse(localStorage.getItem('nexuscart_cart') || '[]');
  } catch { return []; }
}

function saveLocalCart(cart) {
  localStorage.setItem('nexuscart_cart', JSON.stringify(cart));
}

function getLocalOrders() {
  try {
    const stored = localStorage.getItem('nexuscart_orders');
    if (stored) return JSON.parse(stored);
    // Initialize with default sample orders on first visit
    localStorage.setItem('nexuscart_orders', JSON.stringify(defaultOrders));
    return defaultOrders;
  } catch { return defaultOrders; }
}

function saveLocalOrders(orders) {
  localStorage.setItem('nexuscart_orders', JSON.stringify(orders));
}

function getLocalProducts() {
  try {
    const stored = localStorage.getItem('nexuscart_products');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('nexuscart_products', JSON.stringify(defaultProducts));
    return defaultProducts;
  } catch { return defaultProducts; }
}

function saveLocalProducts(products) {
  localStorage.setItem('nexuscart_products', JSON.stringify(products));
}

// --- API Functions ---

export async function fetchProducts(category = '') {
  if (await isBackendAvailable()) {
    const url = category
      ? `${API_BASE}/products?category=${encodeURIComponent(category)}`
      : `${API_BASE}/products`;
    const res = await fetch(url);
    return res.json();
  }
  // Fallback: mock data
  let products = getLocalProducts();
  if (category) {
    products = products.filter(p => p.category === category);
  }
  return products;
}

export async function fetchProductById(id) {
  if (await isBackendAvailable()) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  }
  const products = getLocalProducts();
  const product = products.find(p => p.id === id);
  if (!product) throw new Error('Product not found');
  return product;
}

export async function fetchCart() {
  if (await isBackendAvailable()) {
    const res = await fetch(`${API_BASE}/cart`);
    return res.json();
  }
  // Fallback: localStorage cart
  const cart = getLocalCart();
  const products = getLocalProducts();
  return cart.map(item => {
    const product = products.find(p => p.id === item.product_id);
    if (!product) return null;
    return {
      cart_id: item.cart_id,
      quantity: item.quantity,
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image
    };
  }).filter(Boolean);
}

export async function addToCart(productId, quantity = 1) {
  if (await isBackendAvailable()) {
    const res = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity })
    });
    return res.json();
  }
  // Fallback: localStorage
  const cart = getLocalCart();
  const existing = cart.find(item => item.product_id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ cart_id: 'cart_' + Date.now(), product_id: productId, quantity });
  }
  saveLocalCart(cart);
  return { message: 'Item added to cart' };
}

export async function removeFromCart(cartId) {
  if (await isBackendAvailable()) {
    await fetch(`${API_BASE}/cart/${cartId}`, { method: 'DELETE' });
    return;
  }
  const cart = getLocalCart().filter(item => item.cart_id !== cartId);
  saveLocalCart(cart);
}

export async function checkout(customerName) {
  if (await isBackendAvailable()) {
    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_name: customerName })
    });
    return { ok: res.ok, data: await res.json() };
  }
  // Fallback: localStorage
  const cart = getLocalCart();
  const products = getLocalProducts();
  if (cart.length === 0) {
    return { ok: false, data: { error: 'Cart is empty' } };
  }

  let totalPrice = 0;
  const orderItems = [];
  for (const item of cart) {
    const product = products.find(p => p.id === item.product_id);
    if (product) {
      totalPrice += product.price * item.quantity;
      orderItems.push({ quantity: item.quantity, name: product.name, price: product.price });
    }
  }

  const orders = getLocalOrders();
  orders.unshift({
    id: 'order_' + Date.now(),
    customer_name: customerName,
    total_price: totalPrice,
    order_date: new Date().toISOString(),
    items: orderItems
  });
  saveLocalOrders(orders);
  saveLocalCart([]);
  return { ok: true, data: { message: 'Order placed successfully' } };
}

export async function fetchOrders() {
  if (await isBackendAvailable()) {
    const res = await fetch(`${API_BASE}/orders`);
    return res.json();
  }
  return getLocalOrders();
}

export async function createProduct(productData) {
  if (await isBackendAvailable()) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return res.json();
  }
  const products = getLocalProducts();
  const newProduct = { id: 'prod_' + Date.now(), ...productData, price: Number(productData.price) };
  products.push(newProduct);
  saveLocalProducts(products);
  return { message: 'Product created', id: newProduct.id };
}

export async function updateProduct(id, productData) {
  if (await isBackendAvailable()) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    return res.json();
  }
  const products = getLocalProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...productData, price: Number(productData.price) };
    saveLocalProducts(products);
  }
  return { message: 'Product updated' };
}

export async function deleteProduct(id) {
  if (await isBackendAvailable()) {
    const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error);
    }
    return;
  }
  const products = getLocalProducts().filter(p => p.id !== id);
  saveLocalProducts(products);
}
