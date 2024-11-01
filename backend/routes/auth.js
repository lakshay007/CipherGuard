const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail'); 

const router = express.Router();


const resetPasswordRequests = new Map();


router.get('/test', (req, res) => {
    res.json({ message: 'Auth route is working' });
});

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { name, username, email, password, publicKey, privateKey } = req.body;
        
        // Check if user exists
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user with both keys
        user = new User({
            name,
            username,
            email,
            password,
            publicKey,
            privateKey
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            token,
            email: user.email,
            privateKey: user.privateKey // Send private key during signup
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new route to fetch public key by email
router.get('/public-key/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user || !user.publicKey) {
            return res.status(404).json({ message: 'Public key not found' });
        }
        res.json({ publicKey: user.publicKey });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        res.json({ 
            token, 
            username: user.username, 
            email: user.email,
            privateKey: user.privateKey
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

       
        const lastRequestTime = resetPasswordRequests.get(email);
        if (lastRequestTime && Date.now() - lastRequestTime < 60000) {
            return res.status(429).json({ message: 'Please wait before requesting another password reset.' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

       
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour

        await user.save();

      
        const resetUrl = `http://pasteit.live/reset-password/${resetToken}`;

        // Send email
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   ${resetUrl}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`
        });

        // Update the last request time
        resetPasswordRequests.set(email, Date.now());

        res.status(200).json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ message: 'Error processing request' });
    }
});

// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
        }

        // Set new password
        user.password = password; 
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Error in reset password:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

router.get('/verify', (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true });
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
});

module.exports = router;