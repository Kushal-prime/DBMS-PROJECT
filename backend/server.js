const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- Products API ---

// GET /products
app.get('/products', (req, res) => {
    const { category } = req.query;
    let query = "SELECT * FROM products";
    let params = [];
    if (category) {
        query += " WHERE category = ?";
        params.push(category);
    }
    
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET /products/:id
app.get('/products/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "Product not found" });
            return;
        }
        res.json(row);
    });
});

// --- Cart API ---

// GET /cart
app.get('/cart', (req, res) => {
    const query = `
        SELECT c.id as cart_id, c.quantity, p.* 
        FROM cart c 
        JOIN products p ON c.product_id = p.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST /cart
app.post('/cart', (req, res) => {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
        return res.status(400).json({ error: "product_id is required" });
    }

    // Check if item already in cart
    db.get("SELECT * FROM cart WHERE product_id = ?", [product_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row) {
            // Update quantity
            const newQuantity = row.quantity + quantity;
            db.run("UPDATE cart SET quantity = ? WHERE id = ?", [newQuantity, row.id], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Cart updated", cart_id: row.id, quantity: newQuantity });
            });
        } else {
            // Insert new item
            db.run("INSERT INTO cart (product_id, quantity) VALUES (?, ?)", [product_id, quantity], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: "Item added to cart", cart_id: this.lastID });
            });
        }
    });
});

// DELETE /cart/:id
app.delete('/cart/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM cart WHERE id = ?", [id], function(err) {
         if (err) return res.status(500).json({ error: err.message });
         res.json({ message: "Item removed from cart", changes: this.changes });
    });
});

// --- Orders API ---

// POST /checkout
app.post('/checkout', (req, res) => {
    const { customer_name } = req.body;
    
    if (!customer_name) {
        return res.status(400).json({ error: "customer_name is required" });
    }

    // Get all cart items and total price
    const cartQuery = `
        SELECT c.product_id, c.quantity, p.price 
        FROM cart c 
        JOIN products p ON c.product_id = p.id
    `;
    
    db.all(cartQuery, [], (err, cartItems) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            // Insert into orders table
            db.run("INSERT INTO orders (customer_name, total_price) VALUES (?, ?)", [customer_name, totalPrice], function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: err.message });
                }

                const orderId = this.lastID;
                const stmt = db.prepare("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)");

                cartItems.forEach(item => {
                    stmt.run([orderId, item.product_id, item.quantity]);
                });
                
                stmt.finalize();

                // Clear the cart
                db.run("DELETE FROM cart", [], (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: err.message });
                    }
                    db.run("COMMIT");
                    res.status(201).json({ message: "Order placed successfully", order_id: orderId });
                });
            });
        });
    });
});

// GET /orders
app.get('/orders', (req, res) => {
    // Get all orders
    db.all("SELECT * FROM orders ORDER BY order_date DESC", [], (err, orders) => {
        if (err) return res.status(500).json({ error: err.message });

        // For each order, fetch its items
        if (orders.length === 0) {
            return res.json([]);
        }

        let ordersProcessed = 0;
        
        orders.forEach((order, index) => {
            const itemsQuery = `
                SELECT oi.quantity, p.name, p.price 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `;
            db.all(itemsQuery, [order.id], (err, items) => {
                if (err) {
                     res.status(500).json({ error: err.message });
                     return;
                }
                orders[index].items = items;
                ordersProcessed++;
                
                if (ordersProcessed === orders.length) {
                    res.json(orders);
                }
            });
        });
    });
});

// POST /products
app.post('/products', (req, res) => {
    const { name, price, category, image } = req.body;
    if (!name || !price || !category || !image) {
        return res.status(400).json({ error: "All fields are required" });
    }
    
    db.run("INSERT INTO products (name, price, category, image) VALUES (?, ?, ?, ?)", 
    [name, price, category, image], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Product created", id: this.lastID });
    });
});

// PUT /products/:id
app.put('/products/:id', (req, res) => {
    const { name, price, category, image } = req.body;
    const id = req.params.id;
    
    db.run("UPDATE products SET name = ?, price = ?, category = ?, image = ? WHERE id = ?", 
    [name, price, category, image, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product updated", changes: this.changes });
    });
});

// DELETE /products/:id
app.delete('/products/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM products WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product deleted", changes: this.changes });
    });
});

// --- Database Proof API for DBMS Project ---

app.get('/debug/db', (req, res) => {
    const rawData = {};
    
    db.serialize(() => {
        db.all("SELECT * FROM products", [], (err, rows) => {
            if (!err) rawData.products = rows;
            
            db.all("SELECT * FROM cart", [], (err, rows) => {
                if (!err) rawData.cart = rows;
                
                db.all("SELECT * FROM orders", [], (err, rows) => {
                    if (!err) rawData.orders = rows;
                    
                    db.all("SELECT * FROM order_items", [], (err, rows) => {
                        if (!err) rawData.order_items = rows;
                        
                        res.json(rawData);
                    });
                });
            });
        });
    });
});

app.get('/debug/download-db', (req, res) => {
    const file = require('path').resolve(__dirname, 'shopping.db');
    res.download(file);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
