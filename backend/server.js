require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Product, Cart, Order, mongoose } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Products API ---

// GET /products
app.get('/products', async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category) {
            query.category = category;
        }
        
        const products = await Product.find(query);
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /products/:id
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Cart API ---

// GET /cart
app.get('/cart', async (req, res) => {
    try {
        const cartItems = await Cart.find().populate('product_id');
        
        // Format to match old SQLite output format
        const formattedCart = cartItems.map(item => {
            if (!item.product_id) return null;
            return {
                cart_id: item.id,
                quantity: item.quantity,
                id: item.product_id.id,
                name: item.product_id.name,
                price: item.product_id.price,
                category: item.product_id.category,
                image: item.product_id.image
            };
        }).filter(item => item !== null);

        res.json(formattedCart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /cart
app.post('/cart', async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        if (!product_id) {
            return res.status(400).json({ error: "product_id is required" });
        }

        let cartItem = await Cart.findOne({ product_id });

        if (cartItem) {
            // Update quantity
            cartItem.quantity += quantity;
            await cartItem.save();
            res.json({ message: "Cart updated", cart_id: cartItem.id, quantity: cartItem.quantity });
        } else {
            // Insert new item
            cartItem = new Cart({ product_id, quantity });
            await cartItem.save();
            res.status(201).json({ message: "Item added to cart", cart_id: cartItem.id });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /cart/:id
app.delete('/cart/:id', async (req, res) => {
    try {
        const result = await Cart.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: "Item not found in cart" });
        }
        res.json({ message: "Item removed from cart", changes: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Orders API ---

// POST /checkout
app.post('/checkout', async (req, res) => {
    try {
        const { customer_name } = req.body;
        
        if (!customer_name) {
            return res.status(400).json({ error: "customer_name is required" });
        }

        // Get all cart items
        const cartItems = await Cart.find().populate('product_id');
        
        if (cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        let totalPrice = 0;
        const orderItems = [];

        for (const item of cartItems) {
            if (item.product_id) {
                totalPrice += item.product_id.price * item.quantity;
                orderItems.push({
                    product_id: item.product_id._id,
                    quantity: item.quantity
                });
            }
        }

        const newOrder = new Order({
            customer_name,
            total_price: totalPrice,
            items: orderItems
        });

        await newOrder.save();

        // Clear the cart
        await Cart.deleteMany({});

        res.status(201).json({ message: "Order placed successfully", order_id: newOrder.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /orders
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ order_date: -1 }).populate('items.product_id');

        // Format to match old SQLite output
        const formattedOrders = orders.map(order => {
            return {
                id: order.id,
                customer_name: order.customer_name,
                total_price: order.total_price,
                order_date: order.order_date,
                items: order.items.map(item => {
                    if (!item.product_id) return null;
                    return {
                        quantity: item.quantity,
                        name: item.product_id.name,
                        price: item.product_id.price
                    };
                }).filter(item => item !== null)
            };
        });

        res.json(formattedOrders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /products
app.post('/products', async (req, res) => {
    try {
        const { name, price, category, image } = req.body;
        if (!name || !price || !category || !image) {
            return res.status(400).json({ error: "All fields are required" });
        }
        
        const product = new Product({ name, price, category, image });
        await product.save();
        
        res.status(201).json({ message: "Product created", id: product.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /products/:id
app.put('/products/:id', async (req, res) => {
    try {
        const { name, price, category, image } = req.body;
        
        const result = await Product.findByIdAndUpdate(req.params.id, {
            name, price, category, image
        }, { new: true });

        if (!result) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.json({ message: "Product updated", changes: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /products/:id
app.delete('/products/:id', async (req, res) => {
    try {
        const result = await Product.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: "Product not found" });
        }
        
        res.json({ message: "Product deleted", changes: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Database Proof API for DBMS Project ---

app.get('/debug/db', async (req, res) => {
    try {
        const rawData = {};
        rawData.products = await Product.find();
        rawData.cart = await Cart.find();
        rawData.orders = await Order.find();
        
        res.json(rawData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/debug/download-db', (req, res) => {
    res.status(400).json({ error: "Download DB is not available for MongoDB. Use MongoDB Compass to view database." });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
