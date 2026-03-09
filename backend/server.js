const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const Record = require('./models/Record');
const AdminUser = require('./models/AdminUser');
const recordController = require('./controllers/recordController');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hire-drive';
mongoose.connect(uri)
    .then(async () => {
        console.log('MongoDB connection established');
        // Seed Admin User if not exists
        const adminExists = await AdminUser.findOne({ username: 'admin' });
        if (!adminExists) {
            const hash = await bcrypt.hash('admin123', 10);
            await AdminUser.create({ username: 'admin', password_hash: hash });
            console.log('Default admin seeded (admin/admin123)');
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- API Routes ---

// Auth
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await AdminUser.findOne({ username });
        if (user && await bcrypt.compare(password, user.password_hash)) {
            const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, username: user.username });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Routes
app.use('/api/records', require('./routes/records'));
app.get('/api/admin/dashboard', authenticateToken, recordController.getDashboardStats);
app.post('/api/admin/import', authenticateToken, recordController.importRecords);

// --- Serve Frontend in Production ---
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));
    app.get('/:splat*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port: ${PORT}`);
});
