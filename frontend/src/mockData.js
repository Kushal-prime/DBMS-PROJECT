// Mock data embedded from backend/database.js seed data
// Used as fallback when the backend server is not available (e.g., on GitHub Pages)

let _idCounter = 1;
const makeId = () => String(_idCounter++);

const defaultProducts = [
  // Laptops
  { id: makeId(), name: "NovaBook Pro 15", price: 125000, category: "Laptop", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80" },
  { id: makeId(), name: "Zenith UltraSlim", price: 89999, category: "Laptop", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80" },
  { id: makeId(), name: "Gaming Titan X", price: 165000, category: "Laptop", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80" },

  // Phones
  { id: makeId(), name: "AuraPhone 12", price: 65000, category: "Phone", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80" },
  { id: makeId(), name: "PixelView Pro", price: 75000, category: "Phone", image: "https://images.unsplash.com/photo-1598327105666-5b89351cb315?w=800&q=80" },
  { id: makeId(), name: "Echo Mobile Lite", price: 25000, category: "Phone", image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&q=80" },

  // Headphones
  { id: makeId(), name: "SonicBass Max", price: 12500, category: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" },
  { id: makeId(), name: "QuietTunes NC", price: 22000, category: "Headphones", image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80" },

  // Smartwatches
  { id: makeId(), name: "Chrono Watch Series X", price: 18500, category: "Smartwatch", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" },
  { id: makeId(), name: "Fitness Pulse Band", price: 4500, category: "Smartwatch", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80" },

  // Keyboards
  { id: makeId(), name: "MechKeys Wireless", price: 9500, category: "Keyboard", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80" },
  { id: makeId(), name: "Typist Pro Mechanical", price: 14000, category: "Keyboard", image: "https://images.unsplash.com/photo-1511467687858-23d3ce510526?w=800&q=80" },

  // More Accessories & Gadgets
  { id: makeId(), name: "UltraWide Monitor 34", price: 45000, category: "Monitor", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80" },
  { id: makeId(), name: "ErgoMouse Pro", price: 4500, category: "Mouse", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80" },
  { id: makeId(), name: "Studio Mic Podcaster", price: 18500, category: "Audio", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80" },
  { id: makeId(), name: "4K Action Camera", price: 32000, category: "Camera", image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80" },
  { id: makeId(), name: "Smart Home Hub", price: 12000, category: "Smart Home", image: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&q=80" }
];

// Sample orders for demo
const defaultOrders = [
  {
    id: "order_1",
    customer_name: "Rahul Sharma",
    total_price: 134500,
    order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { quantity: 1, name: "NovaBook Pro 15", price: 125000 },
      { quantity: 1, name: "MechKeys Wireless", price: 9500 }
    ]
  },
  {
    id: "order_2",
    customer_name: "Priya Patel",
    total_price: 87000,
    order_date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    items: [
      { quantity: 1, name: "AuraPhone 12", price: 65000 },
      { quantity: 1, name: "QuietTunes NC", price: 22000 }
    ]
  },
  {
    id: "order_3",
    customer_name: "Amit Kumar",
    total_price: 18500,
    order_date: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    items: [
      { quantity: 1, name: "Chrono Watch Series X", price: 18500 }
    ]
  },
  {
    id: "order_4",
    customer_name: "Neha Gupta",
    total_price: 45000,
    order_date: new Date(Date.now() - 60 * 1000).toISOString(),
    items: [
      { quantity: 1, name: "UltraWide Monitor 34", price: 45000 }
    ]
  },
  {
    id: "order_5",
    customer_name: "Vikram Singh",
    total_price: 32000,
    order_date: new Date().toISOString(),
    items: [
      { quantity: 1, name: "4K Action Camera", price: 32000 }
    ]
  }
];

export { defaultProducts, defaultOrders };
