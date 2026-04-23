const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'shopping.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeTables();
    }
});

function initializeTables() {
    db.serialize(() => {
        // Create Products Table
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                category TEXT NOT NULL,
                image TEXT NOT NULL
            )
        `);

        // Create Cart Table
        db.run(`
            CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                FOREIGN KEY(product_id) REFERENCES products(id)
            )
        `);

        // Create Orders Table
        db.run(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_name TEXT NOT NULL,
                total_price REAL NOT NULL,
                order_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create Order Items Table
        db.run(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                FOREIGN KEY(order_id) REFERENCES orders(id),
                FOREIGN KEY(product_id) REFERENCES products(id)
            )
        `);

        // Insert Default Products if empty
        db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
            if (row && row.count === 0) {
                const insertProduct = db.prepare(`INSERT INTO products (name, price, category, image) VALUES (?, ?, ?, ?)`);
                
                // Laptops
                insertProduct.run("NovaBook Pro 15", 125000, "Laptop", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80");
                insertProduct.run("Zenith UltraSlim", 89999, "Laptop", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80");
                insertProduct.run("Gaming Titan X", 165000, "Laptop", "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80");

                // Phones
                insertProduct.run("AuraPhone 12", 65000, "Phone", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80");
                insertProduct.run("PixelView Pro", 75000, "Phone", "https://images.unsplash.com/photo-1598327105666-5b89351cb315?w=800&q=80");
                insertProduct.run("Echo Mobile Lite", 25000, "Phone", "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=800&q=80");

                // Headphones
                insertProduct.run("SonicBass Max", 12500, "Headphones", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80");
                insertProduct.run("QuietTunes NC", 22000, "Headphones", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80");
                
                // Smartwatches
                insertProduct.run("Chrono Watch Series X", 18500, "Smartwatch", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80");
                insertProduct.run("Fitness Pulse Band", 4500, "Smartwatch", "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80");

                // Keyboards
                insertProduct.run("MechKeys Wireless", 9500, "Keyboard", "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80");
                insertProduct.run("Typist Pro Mechanical", 14000, "Keyboard", "https://images.unsplash.com/photo-1511467687858-23d3ce510526?w=800&q=80");

                // More Accessories & Gadgets
                insertProduct.run("UltraWide Monitor 34", 45000, "Monitor", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80");
                insertProduct.run("ErgoMouse Pro", 4500, "Mouse", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80");
                insertProduct.run("Studio Mic Podcaster", 18500, "Audio", "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80");
                insertProduct.run("4K Action Camera", 32000, "Camera", "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80");
                insertProduct.run("Smart Home Hub", 12000, "Smart Home", "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&q=80");

                insertProduct.finalize();
                console.log("Default products inserted with INR prices.");
                
                // Also insert some realistic mock orders
                db.get("SELECT COUNT(*) AS count FROM orders", (err, row) => {
                    if (row && row.count === 0) {
                        // Order 1
                        db.run("INSERT INTO orders (customer_name, total_price, order_date) VALUES (?, ?, datetime('now', '-2 days'))", ["Rahul Sharma", 134500], function() {
                            const orderId1 = this.lastID;
                            db.run("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)", [orderId1, 1, 1]); // Laptop
                            db.run("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)", [orderId1, 11, 1]); // Keyboard
                        });

                        // Order 2
                        db.run("INSERT INTO orders (customer_name, total_price, order_date) VALUES (?, ?, datetime('now', '-5 hours'))", ["Priya Patel", 87000], function() {
                            const orderId2 = this.lastID;
                            db.run("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)", [orderId2, 4, 1]); // Phone
                            db.run("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)", [orderId2, 8, 1]); // Headphones
                        });

                        // Order 3
                        db.run("INSERT INTO orders (customer_name, total_price, order_date) VALUES (?, ?, datetime('now', '-10 minutes'))", ["Amit Kumar", 18500], function() {
                            const orderId3 = this.lastID;
                            db.run("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)", [orderId3, 9, 1]); // Smartwatch
                        });
                        
                        // Order 4
                        db.run("INSERT INTO orders (customer_name, total_price, order_date) VALUES (?, ?, datetime('now', '-1 minutes'))", ["Neha Gupta", 45000], function() {
                            const orderId4 = this.lastID;
                            db.run("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)", [orderId4, 13, 1]); // Monitor
                        });

                        // Order 5
                        db.run("INSERT INTO orders (customer_name, total_price, order_date) VALUES (?, ?, datetime('now', 'localtime'))", ["Vikram Singh", 32000], function() {
                            const orderId5 = this.lastID;
                            db.run("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)", [orderId5, 16, 1]); // Action Camera
                        });

                        console.log("Realistic sample orders inserted.");
                    }
                });
            }
        });
    });
}

module.exports = db;
