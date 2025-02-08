import express from 'express'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router()

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

        // Generate a short-lived access token
        const accessToken = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1m' });

        // Check if user already has a refresh token stored (you need to store it in DB)
        let refreshToken = user.refreshToken;
        if (!refreshToken) {
            refreshToken = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1d' });
            user.refreshToken = refreshToken;  // Store refresh token in DB
            await user.save();  // Save the updated user
        }

        // Set cookies
        res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'strict' });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' });

        res.json({ message: 'Login successful', accessToken, username, refreshToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error while login' });
    }
});

// Token Refresh
router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) return res.status(401).json({ message: 'Unauthorized' });

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findOne({ username: decoded.username });

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Generate a new access token
        const newAccessToken = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1m' });

        res.cookie('accessToken', newAccessToken, { httpOnly: true, sameSite: 'strict' });
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
});


// Logout
router.post('/logout', async (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
});

export default router;
