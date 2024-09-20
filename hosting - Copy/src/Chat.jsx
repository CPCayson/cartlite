// src/components/Chat.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useRide } from '@context/RideContext';

const Chat = () => {
  const { messages, sendMessage, user } = useRide();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim() === '') return;
    sendMessage(messageText.trim());
    setMessageText('');
  };

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mt-4">
      <h3 className="text-lg font-semibold mb-2">Chat</h3>
      <div className="h-64 overflow-y-auto mb-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 flex ${
              msg.senderId === user.uid ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`inline-block p-2 rounded ${
                msg.senderId === user.uid
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white'
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="flex-1 p-2 rounded-l border border-gray-300 dark:bg-gray-700 dark:text-white"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
