const Message = require('../models/message');
const asyncHandler = require("express-async-handler");

// Send a message
const sendMessage = asyncHandler(async (req, res) => {
    const { receiver, content } = req.body;
    const message = await Message.create({
        sender: req.user._id,
        receiver,
        content
    });
    res.status(201).json({ success: true, message });
});

// Get messages between two users
const getMessages = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const messages = await Message.find({
        $or: [
            { sender: req.user._id, receiver: userId },
            { sender: userId, receiver: req.user._id }
        ]
    }).sort({ timestamp: 1 });
    res.status(200).json({ success: true, messages });
});

module.exports = {
    sendMessage,
    getMessages
};