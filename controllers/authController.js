const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

class AuthController {
    // Register new user
    static async register(req, res) {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Username and password are required' 
                });
            }

            if (password.length < 6) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Password must be at least 6 characters' 
                });
            }

            // Check if user already exists
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Username already exists' 
                });
            }

            // Create new user
            const user = new User({ username, password });
            await user.save();

            // Generate JWT token
            const token = jwt.sign(
                { id: user._id, username: user.username },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                token,
                user: { id: user._id, username: user.username }
            });
        } catch (error) {
            console.error('Registration error:', error);
            
            // Handle Mongoose validation errors
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ 
                    success: false,
                    error: errors.join(', ') 
                });
            }

            // Handle duplicate key error
            if (error.code === 11000) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Username already exists' 
                });
            }

            res.status(500).json({ 
                success: false,
                error: 'Internal server error' 
            });
        }
    }

    // Login user
    static async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Username and password are required' 
                });
            }

            // Find user
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({ 
                    success: false,
                    error: 'Invalid username or password' 
                });
            }

            // Verify password
            const isValidPassword = await user.comparePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({ 
                    success: false,
                    error: 'Invalid username or password' 
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user._id, username: user.username },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: { id: user._id, username: user.username }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Internal server error' 
            });
        }
    }

    // Verify token
    static async verifyToken(req, res) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({ 
                    success: false,
                    error: 'No token provided' 
                });
            }

            jwt.verify(token, JWT_SECRET, async (err, decoded) => {
                if (err) {
                    return res.status(403).json({ 
                        success: false,
                        error: 'Invalid or expired token' 
                    });
                }

                const user = await User.findById(decoded.id);
                if (!user) {
                    return res.status(404).json({ 
                        success: false,
                        error: 'User not found' 
                    });
                }

                res.json({ 
                    success: true,
                    user: { id: user._id, username: user.username } 
                });
            });
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Internal server error' 
            });
        }
    }
}

module.exports = AuthController;