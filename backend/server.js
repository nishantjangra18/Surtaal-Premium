const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const songsRoutes = require('./routes/songs');
const musicRoutes = require('./routes/music');
const adminRoutes = require('./routes/admin');

dotenv.config();

// Ensure upload folders exist
const uploadDirs = [
    path.join(__dirname, 'uploads', 'audio'),
    path.join(__dirname, 'uploads', 'images')
];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created uploads directory: ${dir}`);
    }
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songsRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/admin', adminRoutes);

// Simple route to check if server is running
app.get('/', (req, res) => {
    res.send("SurTaal API is running...");
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({ 
        server: 'running', 
        database: states[dbState] || 'unknown',
        dbConnected: dbState === 1
    });
});

// MongoDB Connection with timeout
const MONGO_URI = process.env.MONGO_URI;
console.log(`\n🔌 Attempting to connect to MongoDB at: ${MONGO_URI}`);

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Fail fast (5s instead of default 30s)
})
.then(() => {
    console.log("✅ MongoDB Connected Successfully\n");
})
.catch(err => {
    console.error("❌ MongoDB Connection FAILED!\n");
    console.error("   Error:", err.message);
    console.error("\n   ╔══════════════════════════════════════════════════════════╗");
    console.error("   ║  MongoDB is NOT running on your machine.                ║");
    console.error("   ║                                                          ║");
    console.error("   ║  Options to fix:                                         ║");
    console.error("   ║  1. Install & start MongoDB locally                      ║");
    console.error("   ║     → https://www.mongodb.com/try/download/community     ║");
    console.error("   ║                                                          ║");
    console.error("   ║  2. Use MongoDB Atlas (free cloud DB)                    ║");
    console.error("   ║     → https://cloud.mongodb.com                          ║");
    console.error("   ║     → Update MONGO_URI in .env with your Atlas URI       ║");
    console.error("   ╚══════════════════════════════════════════════════════════╝\n");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
