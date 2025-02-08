import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import Message from '../models/Message.js'; // Import Message model

const router = express.Router();    

// Get chat messages (Protected)
router.get('/messages', verifyToken, async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: 1 }); // Fetch messages in order
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

// Send a chat message (Protected)
router.post('/messages', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        const username = req.user.username; // Extract username from token

        const message = new Message({ username, text });
        await message.save(); // Save message to DB

        res.status(201).json({ message: 'Message sent', messageData: message });
    } catch (error) {
        res.status(500).json({ message: 'Error sending message' });
    }
});

export default router;
