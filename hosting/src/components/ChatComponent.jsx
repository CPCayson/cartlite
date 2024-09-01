import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { addDoc, collection, getFirestore, orderBy, query, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase/firebaseConfig';

const ChatComponent = ({ chatId, currentUser, otherUser, isHost }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const firestoreDb = getFirestore();

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(firestoreDb, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [chatId, firestoreDb]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    try {
      await addDoc(collection(firestoreDb, 'chats', chatId, 'messages'), {
        text: input.trim(),
        sender: currentUser.uid,
        timestamp: serverTimestamp(),
        read: false,
      });
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-gray-50 dark:bg-gray-900 rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">
        {isHost ? 'Chat with Guest' : 'Chat with Host'}
      </h2>
      <div className="bg-gray-100 dark:bg-gray-600 p-2 h-32 overflow-y-scroll mb-2 rounded">
        {messages.map((msg) => (
          <p
            key={msg.id}
            className={`${
              msg.sender === currentUser.uid ? 'text-right' : 'text-left'
            } mb-1`}
          >
            {msg.text}
          </p>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-green-500 text-white py-2 px-4 rounded mt-2"
        >
          Send
        </button>
      </form>
    </div>
  );
};

ChatComponent.propTypes = {
  chatId: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired,
  otherUser: PropTypes.string.isRequired,
  isHost: PropTypes.bool.isRequired,
};

export default ChatComponent;
