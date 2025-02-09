import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// SignUp
router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User registered' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const accessToken = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1m' });

        // Always use the existing refresh token if it exists
        let refreshToken = user.refreshToken;
        if (!refreshToken) {
            refreshToken = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1d' });
            user.refreshToken = refreshToken;
            await user.save(); // Save refresh token only once
        }

        // Set cookies
        res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'strict' });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' });

        // 🔹 **Include refreshToken in response**
        res.json({ message: 'Login successful', accessToken, refreshToken, username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error while login' });
    }
});


// Refresh Token
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;  // Extract from request body
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh Token required' });
        }

        // Verify Refresh Token
        jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            // Check if token exists in DB
            const user = await User.findOne({ username: decoded.username, refreshToken });
            if (!user) {
                return res.status(403).json({ message: 'Refresh token not found' });
            }

            // Generate new access token
            const newAccessToken = jwt.sign(
                { username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '1m' } // 1 minute expiry for testing
            );

            res.json({ accessToken: newAccessToken });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during token refresh' });
    }
});


// Logout
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(400).json({ message: 'No refresh token found' });

        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        await User.findOneAndUpdate({ username: decoded.username }, { refreshToken: null });

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error logging out' });
    }
});

export default router;
