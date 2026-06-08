const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Middleware to check DB connection before processing auth requests
const checkDbConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ 
            message: 'Database is not connected. Please ensure MongoDB is running.' 
        });
    }
    next();
};

// Register
router.post('/register', checkDbConnection, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine role (emails containing admin@surtaal.com or ending in @surtaal.admin are admins)
        const emailLower = email.toLowerCase();
        const role = (emailLower === 'admin@surtaal.com' || emailLower.endsWith('@surtaal.admin')) ? 'admin' : 'user';

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role
        });

        const savedUser = await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', checkDbConnection, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check if banned
        if (user.isBanned) {
            return res.status(403).json({ message: "Access denied. Your account is banned." });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ 
            token, 
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
