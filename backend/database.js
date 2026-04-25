const mongoose = require('mongoose');

// Connect to MongoDB
// You can change this URI to a MongoDB Atlas cluster URI if needed
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mongodm';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to the MongoDB database.');
    // initializeDatabase(); // Commented out so it stops auto-recreating data if you delete it!
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB database', err.message);
  });

// Schema transformation to ensure React frontend gets "id" instead of "_id"
const transformId = (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
};

// --- SCHEMAS ---

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true }
}, { toJSON: { transform: transformId } });

const cartSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 }
}, { toJSON: { transform: transformId } });

const orderItemSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    customer_name: { type: String, required: true },
    total_price: { type: Number, required: true },
    order_date: { type: Date, default: Date.now },
    items: [orderItemSchema]
}, { toJSON: { transform: transformId } });

// --- MODELS ---
const Product = mongoose.model('Product', productSchema);
const Cart = mongoose.model('Cart', cartSchema);
const Order = mongoose.model('Order', orderSchema);

// --- SEEDING LOGIC ---
async function initializeDatabase() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            const defaultProducts = [
                // Laptops
                { name: "NovaBook Pro 15", price: 125000, category: "Laptop", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80" },
                { name: "Zenith UltraSlim", price: 89999, category: "Laptop", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80" },
                { name: "Gaming Titan X", price: 165000, category: "Laptop", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80" },

                // Phones
                { name: "AuraPhone 12", price: 65000, category: "Phone", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80" },
                { name: "PixelView Pro", price: 75000, category: "Phone", image: "https://images.unsplash.com/photo-1598327105666-5b89351cb315?w=800&q=80" },
                { name: "Echo Mobile Lite", price: 25000, category: "Phone", image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&q=80" },

                // Headphones
                { name: "SonicBass Max", price: 12500, category: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" },
                { name: "QuietTunes NC", price: 22000, category: "Headphones", image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80" },
                
                // Smartwatches
                { name: "Chrono Watch Series X", price: 18500, category: "Smartwatch", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" },
                { name: "Fitness Pulse Band", price: 4500, category: "Smartwatch", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80" },

                // Keyboards
                { name: "MechKeys Wireless", price: 9500, category: "Keyboard", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80" },
                { name: "Typist Pro Mechanical", price: 14000, category: "Keyboard", image: "https://images.unsplash.com/photo-1511467687858-23d3ce510526?w=800&q=80" },

                // More Accessories & Gadgets
                { name: "UltraWide Monitor 34", price: 45000, category: "Monitor", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80" },
                { name: "ErgoMouse Pro", price: 4500, category: "Mouse", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80" },
                { name: "Studio Mic Podcaster", price: 18500, category: "Audio", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80" },
                { name: "4K Action Camera", price: 32000, category: "Camera", image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80" },
                { name: "Smart Home Hub", price: 12000, category: "Smart Home", image: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&q=80" }
            ];

            const createdProducts = await Product.insertMany(defaultProducts);
            console.log("Default products inserted into MongoDB.");

            // Insert sample orders
            const ordersCount = await Order.countDocuments();
            if (ordersCount === 0) {
                const sampleOrders = [
                    {
                        customer_name: "Rahul Sharma",
                        total_price: 134500,
                        order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                        items: [
                            { product_id: createdProducts[0]._id, quantity: 1 },
                            { product_id: createdProducts[10]._id, quantity: 1 }
                        ]
                    },
                    {
                        customer_name: "Priya Patel",
                        total_price: 87000,
                        order_date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
                        items: [
                            { product_id: createdProducts[3]._id, quantity: 1 },
                            { product_id: createdProducts[7]._id, quantity: 1 }
                        ]
                    },
                    {
                        customer_name: "Amit Kumar",
                        total_price: 18500,
                        order_date: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
                        items: [
                            { product_id: createdProducts[8]._id, quantity: 1 }
                        ]
                    },
                    {
                        customer_name: "Neha Gupta",
                        total_price: 45000,
                        order_date: new Date(Date.now() - 60 * 1000), // 1 minute ago
                        items: [
                            { product_id: createdProducts[12]._id, quantity: 1 }
                        ]
                    },
                    {
                        customer_name: "Vikram Singh",
                        total_price: 32000,
                        order_date: new Date(), // Just now
                        items: [
                            { product_id: createdProducts[15]._id, quantity: 1 }
                        ]
                    }
                ];

                await Order.insertMany(sampleOrders);
                console.log("Realistic sample orders inserted into MongoDB.");
            }
        }
    } catch (err) {
        console.error("Error seeding database:", err);
    }
}

module.exports = { Product, Cart, Order, mongoose };
