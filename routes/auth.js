const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Create new user
        const user = await User.create(username, password);

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: user.id, username: user.username }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Verify password
        const isValidPassword = await User.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify token (optional endpoint for frontend to check auth status)
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired token' });
            }

            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ user: { id: user.id, username: user.username } });
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

