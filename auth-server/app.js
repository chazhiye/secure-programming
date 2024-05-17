const express = require("express");
const bcrypt = require("bcrypt");
const cors = require('cors');
const jwt = require("jsonwebtoken");
const mysql = require('mysql2/promise');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
// Initialize Express app
const app = express();

// Define a JWT secret key. This should be isolated by using env variables for security
const jwtSecretKey = "dsfdsfsdfdsvcsvdfgefg";

// Set up middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet()); // Secure Express apps by setting various HTTP headers

app.use(session({
    name: 'sessionId',
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // Ensure this is true in production (HTTPS)
        sameSite: 'Lax',
        maxAge: 1000 * 60 * 15 // 15 minutes session expiration
    }
}));


// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '6-12-2001zhiye',
    database: 'voter_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Basic home route for the API
app.get("/", (_req, res) => {
    res.send("Auth API.\nPlease use POST /auth & POST /verify for authentication");
});

// Rate limiter to prevent brute force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: "Too many login attempts from this IP, please try again after 15 minutes"
});
app.post("/auth", loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
        connection.release();

        if (rows.length === 1) {
            const isPasswordValid = await bcrypt.compare(password, rows[0].password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid password" });
            }

            const token = jwt.sign({ username }, jwtSecretKey, { expiresIn: '15m' });

            req.session.regenerate((err) => {
                if (err) {
                    return res.status(500).json({ message: "Internal server error" });
                }
                req.session.username = username; // Save username in session
                res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Lax' }); // secure: true in production (HTTPS)
                res.status(200).json({ message: "success" });
            });
        } else {
            const hash = await bcrypt.hash(password, 10);
            await connection.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);

            const token = jwt.sign({ username }, jwtSecretKey, { expiresIn: '15m' });

            req.session.regenerate((err) => {
                if (err) {
                    return res.status(500).json({ message: "Internal server error" });
                }
                req.session.username = username; // Save username in session
                res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Lax' });
                res.status(200).json({ message: "success" });
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});



app.post('/verify', (req, res) => {
    const tokenHeaderKey = "authorization"; // Use 'authorization' header
    const authToken = req.headers[tokenHeaderKey]?.split(' ')[1]; // Extract token from 'Bearer <token>'

    if (!authToken) {
        return res.status(401).json({ status: "invalid auth", message: "No token provided" });
    }

    try {
        const verified = jwt.verify(authToken, jwtSecretKey);
        if (verified) {
            return res.status(200).json({ status: "logged in", message: "success" });
        } else {
            return res.status(401).json({ status: "invalid auth", message: "error" });
        }
    } catch (error) {
        return res.status(401).json({ status: "invalid auth", message: "error" });
    }
});


// An endpoint to see if there's an existing account for a given username address
app.post('/check-account', async (req, res) => {
    const { username } = req.body;

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
        connection.release();

        res.status(200).json({
            status: rows.length === 1 ? "User exists" : "User does not exist",
            userExists: rows.length === 1
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/update-password', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Hash the new password
        const hash = await bcrypt.hash(password, 10);

        // Update the password in the database
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('UPDATE users SET password = ? WHERE username = ?', [hash, username]);
        connection.release();

        // Check if any rows were affected
        if (rows.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.get("/api/pizzas", async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute("SELECT * FROM pizza");
        connection.release();

        res.status(200).json(rows);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/purchase", async (req, res) => {
    const { pizza_id, quantity, address, username } = req.body;

    // Log the request data for debugging
    console.log("Request body:", req.body);
    console.log("Session data:", req.session);

    // Check for undefined values
    if (!username || !pizza_id || !quantity || !address) {
        console.error("Missing required fields:", { username, pizza_id, quantity, address });
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            "INSERT INTO purchase (username, pizza_id, quantity, address) VALUES (?, ?, ?, ?)",
            [username, pizza_id, quantity, address]
        );
        connection.release();

        res.status(200).json({ success: true, message: "Purchase recorded successfully" });
    } catch (error) {
        console.error("Error recording purchase:", error); // Log the detailed error
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});


app.listen(3080, () => {
    console.log('Server is running on port 3080');
});
