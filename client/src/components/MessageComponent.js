import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MessageComponent = ({ userId }) => {
    console.log(userId);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');

    const fetchMessages = async () => {
        const response = await axios.get(`/api/messages/${userId}`);
        setMessages(response.data.messages);
    };

    const handleSendMessage = async () => {
        await axios.post('/api/messages', { receiver: userId, content });
        setContent('');
        fetchMessages();
    };

    useEffect(() => {
        fetchMessages();
    }, [userId]);

    return (
        <div>
            <div>
                {messages.map(msg => (
                    <div key={msg._id}>
                        <strong>{msg.sender}: </strong>{msg.content}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message"
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
};

export default MessageComponent;