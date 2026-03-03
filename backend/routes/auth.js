const express = require('express');
const AuthController = require('../controllers/authController');

const router = express.Router();

// Register new user
router.post('/register', AuthController.register);

// Login user
router.post('/login', AuthController.login);

// Verify token
router.get('/verify', AuthController.verifyToken);

module.exports = router;