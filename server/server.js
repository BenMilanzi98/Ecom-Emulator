const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = "your_jwt_secret_key_for_escom_project"; // Replace with a strong secret in a real app
const SALT_ROUNDS = 10;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public"))); // Serve static files from public directory

// Database setup
const dbPath = path.join(__dirname, "database.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database", err.message);
    } else {
        console.log("Connected to the SQLite database.");
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            address TEXT,
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )`, (err) => {
            if (err) console.error("Error creating users table", err.message);
        });

        db.run(`CREATE TABLE IF NOT EXISTS user_devices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            device_id TEXT NOT NULL,
            quantity INTEGER DEFAULT 1,
            is_active BOOLEAN DEFAULT FALSE,
            custom_name TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) console.error("Error creating user_devices table", err.message);
        });

        db.run(`CREATE TABLE IF NOT EXISTS power_units (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            units_amount FLOAT NOT NULL,
            purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) console.error("Error creating power_units table", err.message);
        });

        db.run(`CREATE TABLE IF NOT EXISTS usage_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            device_id TEXT NOT NULL,
            duration_minutes INTEGER NOT NULL,
            units_consumed FLOAT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) console.error("Error creating usage_history table", err.message);
        });

        db.run(`CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            alert_type TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) console.error("Error creating alerts table", err.message);
        });
        console.log("Database tables checked/created.");
    });
}

// --- AUTHENTICATION API ROUTES --- 

// User Signup
app.post("/api/users/signup", async (req, res) => {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password || !phone) {
        return res.status(400).json({ message: "All fields (full_name, email, password, phone) are required." });
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email format." });
    }

    // Basic password length (more complex rules should be on client-side or enhanced here)
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const sql = `INSERT INTO users (full_name, email, password_hash, phone) VALUES (?, ?, ?, ?)`;
        db.run(sql, [full_name, email, hashedPassword, phone], function(err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed: users.email")) {
                    return res.status(409).json({ message: "Email already exists." });
                }
                console.error("Signup error:", err.message);
                return res.status(500).json({ message: "Error creating user.", error: err.message });
            }
            // Simulate email verification message as per requirements
            res.status(201).json({ message: "User created successfully. Please check your email to verify your account.", userId: this.lastID });
        });
    } catch (error) {
        console.error("Server error during signup:", error);
        res.status(500).json({ message: "Server error during signup.", error: error.message });
    }
});

// User Signin
app.post("/api/users/signin", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err) {
            console.error("Signin DB error:", err.message);
            return res.status(500).json({ message: "Error during signin.", error: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
        
        // Update last_login
        const updateSql = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
        db.run(updateSql, [user.id], (updateErr) => {
            if (updateErr) {
                console.error("Error updating last_login:", updateErr.message);
                // Non-critical error, proceed with login
            }
        });

        res.json({ 
            message: "Signed in successfully.", 
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                address: user.address
            }
        });
    });
});

// JWT Verification Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401); // if there isn't any token

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("JWT verification error:", err);
            return res.sendStatus(403); // invalid token
        }
        req.user = user; // Add user payload to request object
        next();
    });
};

// User Profile Update (Protected Route)
app.put("/api/users/profile", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { full_name, phone, address, current_password, new_password } = req.body;

    let fieldsToUpdate = {};
    if (full_name) fieldsToUpdate.full_name = full_name;
    if (phone) fieldsToUpdate.phone = phone;
    if (address) fieldsToUpdate.address = address;

    try {
        if (new_password) {
            if (!current_password) {
                return res.status(400).json({ message: "Current password is required to set a new password." });
            }
            if (new_password.length < 8) {
                 return res.status(400).json({ message: "New password must be at least 8 characters long." });
            }

            const userSql = `SELECT password_hash FROM users WHERE id = ?`;
            db.get(userSql, [userId], async (err, user) => {
                if (err || !user) {
                    return res.status(500).json({ message: "Error fetching user for password update." });
                }
                const passwordMatch = await bcrypt.compare(current_password, user.password_hash);
                if (!passwordMatch) {
                    return res.status(401).json({ message: "Incorrect current password." });
                }
                fieldsToUpdate.password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
                updateUserProfile(userId, fieldsToUpdate, res);
            });
        } else {
            if (Object.keys(fieldsToUpdate).length === 0) {
                return res.status(400).json({ message: "No fields to update." });
            }
            updateUserProfile(userId, fieldsToUpdate, res);
        }
    } catch (error) {
        console.error("Server error during profile update:", error);
        res.status(500).json({ message: "Server error during profile update.", error: error.message });
    }
});

function updateUserProfile(userId, fields, res) {
    const setClauses = Object.keys(fields).map(key => `${key} = ?`).join(", ");
    const values = Object.values(fields);
    values.push(userId);

    const sql = `UPDATE users SET ${setClauses} WHERE id = ?`;
    db.run(sql, values, function(err) {
        if (err) {
            console.error("Profile update error:", err.message);
            return res.status(500).json({ message: "Error updating profile.", error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "User not found or no changes made." });
        }
        res.json({ message: "Profile updated successfully." });
    });
}

// --- END AUTHENTICATION API ROUTES ---

// --- DEVICE MANAGEMENT API ROUTES ---
app.get("/api/devices/household-items", (req, res) => {
    const itemsPath = path.join(__dirname, "household_items.json");
    res.sendFile(itemsPath, (err) => {
        if (err) {
            console.error("Error sending household_items.json:", err);
            res.status(500).send("Error fetching household items.");
        }
    });
});

// Get user's selected devices
app.get("/api/users/devices", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT ud.id, ud.device_id, ud.quantity, ud.is_active, ud.custom_name, hi.name, hi.category, hi.power_consumption, hi.icon 
                 FROM user_devices ud 
                 JOIN json_each(readfile('household_items.json')) AS j ON j.value ->> 'id' = ud.device_id 
                 CROSS JOIN json_extract(j.value, '$') AS hi 
                 WHERE ud.user_id = ?`;
    // Note: The JOIN with JSON file directly in SQL is complex and might not be efficient or directly supported in all sqlite3 versions/setups without extensions.
    // A more robust way is to fetch user_devices and then enrich with data from household_items.json in the application code.
    // For simplicity here, we'll try a simpler query first and then adjust if needed.
    
    const simplerSql = `SELECT * FROM user_devices WHERE user_id = ?`;
    db.all(simplerSql, [userId], (err, devices) => {
        if (err) {
            console.error("Error fetching user devices:", err.message);
            return res.status(500).json({ message: "Error fetching user devices.", error: err.message });
        }
        // Here you would typically merge with household_items.json data
        // For now, just returning what's in the DB
        res.json(devices);
    });
});

// Add/Update user's device selection
app.post("/api/users/devices", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { device_id, quantity, custom_name } = req.body; // is_active will be handled by control panel

    if (!device_id || quantity === undefined) {
        return res.status(400).json({ message: "Device ID and quantity are required." });
    }
    if (quantity <= 0) {
        return res.status(400).json({ message: "Quantity must be positive." });
    }

    // Check if device already exists for user, then update, else insert
    const checkSql = `SELECT id FROM user_devices WHERE user_id = ? AND device_id = ?`;
    db.get(checkSql, [userId, device_id], (err, row) => {
        if (err) {
            console.error("Error checking device:", err.message);
            return res.status(500).json({ message: "Error managing device.", error: err.message });
        }

        if (row) { // Update existing device
            const updateSql = `UPDATE user_devices SET quantity = ?, custom_name = ? WHERE id = ?`;
            db.run(updateSql, [quantity, custom_name || null, row.id], function(err) {
                if (err) {
                    console.error("Error updating device:", err.message);
                    return res.status(500).json({ message: "Error updating device.", error: err.message });
                }
                res.json({ message: "Device updated successfully.", id: row.id });
            });
        } else { // Insert new device
            const insertSql = `INSERT INTO user_devices (user_id, device_id, quantity, custom_name, is_active) VALUES (?, ?, ?, ?, ?)`;
            db.run(insertSql, [userId, device_id, quantity, custom_name || null, false], function(err) {
                if (err) {
                    console.error("Error adding device:", err.message);
                    return res.status(500).json({ message: "Error adding device.", error: err.message });
                }
                res.status(201).json({ message: "Device added successfully.", id: this.lastID });
            });
        }
    });
});

// Remove a user's device
app.delete("/api/users/devices/:userDeviceId", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { userDeviceId } = req.params;

    const sql = `DELETE FROM user_devices WHERE id = ? AND user_id = ?`;
    db.run(sql, [userDeviceId, userId], function(err) {
        if (err) {
            console.error("Error deleting device:", err.message);
            return res.status(500).json({ message: "Error deleting device.", error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "Device not found or not authorized to delete." });
        }
        res.json({ message: "Device removed successfully." });
    });
});

// Toggle device state (on/off)
app.put("/api/users/devices/:userDeviceId/toggle", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { userDeviceId } = req.params;
    const { is_active } = req.body; // Expecting { is_active: true/false }

    if (typeof is_active !== 'boolean') {
        return res.status(400).json({ message: "is_active (boolean) is required in the body." });
    }

    const sql = `UPDATE user_devices SET is_active = ? WHERE id = ? AND user_id = ?`;
    db.run(sql, [is_active, userDeviceId, userId], function(err) {
        if (err) {
            console.error("Error toggling device state:", err.message);
            return res.status(500).json({ message: "Error toggling device state.", error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "Device not found or not authorized." });
        }
        res.json({ message: `Device ${is_active ? 'activated' : 'deactivated'} successfully.` });
    });
});

// --- END DEVICE MANAGEMENT API ROUTES ---

// --- POWER UNIT MANAGEMENT API ROUTES ---
app.post("/api/users/units", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { units_amount } = req.body;

    if (typeof units_amount !== 'number' || units_amount <= 0) {
        return res.status(400).json({ message: "Valid units_amount (positive number) is required." });
    }

    const sql = `INSERT INTO power_units (user_id, units_amount) VALUES (?, ?)`;
    db.run(sql, [userId, units_amount], function(err) {
        if (err) {
            console.error("Error adding power units:", err.message);
            return res.status(500).json({ message: "Error adding power units.", error: err.message });
        }
        res.status(201).json({ message: "Power units added successfully.", id: this.lastID, units_added: units_amount });
    });
});

app.get("/api/users/units/balance", authenticateToken, (req, res) => {
    const userId = req.user.id;
    // This is a simplified balance. Real calculation would involve summing purchases and subtracting consumption.
    // For now, let's sum all purchased units. Consumption deduction will be handled client-side or via a more complex backend process.
    const sql = `SELECT SUM(units_amount) AS total_units FROM power_units WHERE user_id = ?`;
    db.get(sql, [userId], (err, row) => {
        if (err) {
            console.error("Error fetching unit balance:", err.message);
            return res.status(500).json({ message: "Error fetching unit balance.", error: err.message });
        }
        res.json({ balance: row ? row.total_units || 0 : 0 });
    });
});

// --- END POWER UNIT MANAGEMENT API ROUTES ---

// --- USAGE HISTORY & ALERTS (Simplified for now) ---
// Endpoint to log usage (could be called periodically by client or a simulated process)
app.post("/api/usage/log", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { device_id, duration_minutes, units_consumed } = req.body;

    if (!device_id || typeof duration_minutes !== 'number' || typeof units_consumed !== 'number') {
        return res.status(400).json({ message: "device_id, duration_minutes, and units_consumed are required."} );
    }

    const sql = `INSERT INTO usage_history (user_id, device_id, duration_minutes, units_consumed) VALUES (?, ?, ?, ?)`;
    db.run(sql, [userId, device_id, duration_minutes, units_consumed], function(err) {
        if (err) {
            console.error("Error logging usage:", err.message);
            return res.status(500).json({ message: "Error logging usage.", error: err.message });
        }
        res.status(201).json({ message: "Usage logged successfully.", id: this.lastID });
    });
});

app.get("/api/usage/history", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT uh.timestamp, uh.device_id, hi.name as device_name, uh.duration_minutes, uh.units_consumed 
                 FROM usage_history uh
                 LEFT JOIN json_each(readfile('household_items.json')) AS j ON j.value ->> 'id' = uh.device_id
                 LEFT JOIN json_extract(j.value, '$') AS hi
                 WHERE uh.user_id = ? ORDER BY uh.timestamp DESC`;
    // Again, joining with JSON in SQL is complex. Simpler query:
    const simplerSql = `SELECT timestamp, device_id, duration_minutes, units_consumed FROM usage_history WHERE user_id = ? ORDER BY timestamp DESC`;
    db.all(simplerSql, [userId], (err, rows) => {
        if (err) {
            console.error("Error fetching usage history:", err.message);
            return res.status(500).json({ message: "Error fetching usage history.", error: err.message });
        }
        res.json(rows);
    });
});

app.get("/api/alerts", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT * FROM alerts WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC`; // Show unread alerts
    db.all(sql, [userId], (err, alerts) => {
        if (err) {
            console.error("Error fetching alerts:", err.message);
            return res.status(500).json({ message: "Error fetching alerts.", error: err.message });
        }
        res.json(alerts);
    });
});

app.put("/api/alerts/:alertId/read", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { alertId } = req.params;
    const sql = `UPDATE alerts SET is_read = 1 WHERE id = ? AND user_id = ?`;
    db.run(sql, [alertId, userId], function(err) {
        if (err) {
            console.error("Error marking alert as read:", err.message);
            return res.status(500).json({ message: "Error marking alert as read.", error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "Alert not found or not authorized." });
        }
        res.json({ message: "Alert marked as read." });
    });
});

// --- END USAGE HISTORY & ALERTS ---


// Serve React App (for production) - This should be AFTER all API routes
app.get("/*", (req, res) => { // Changed to /* to catch all non-API routes
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log("Closed the database connection.");
        process.exit(0);
    });
});

