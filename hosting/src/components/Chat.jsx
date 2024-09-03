import  { useState, useEffect, useRef } from 'react';
import { auth } from '../main/utils/firebaseConfig';
import { getFirestore, collection, addDoc, orderBy, query, onSnapshot } from 'firebase/firestore';
import ChatComponent from './ChatComponent';
import PropTypes from 'prop-types';

const Chat = ({ match }) => {
  const { userId, hostId } = match.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const firestoreDb = getFirestore();

  useEffect(() => {
    const chatId = [userId, hostId].sort().join('_');
    const messagesRef = collection(firestoreDb, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, snapshot => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(fetchedMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, hostId, firestoreDb]);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!input.trim() || !chatOpen) return;

    const chatId = [userId, hostId].sort().join('_');

    try {
      await addDoc(collection(firestoreDb, 'chats', chatId, 'messages'), {
        text: input.trim(),
        sender: auth.currentUser && auth.currentUser.uid,  // Ensure currentUser exists
        timestamp: new Date(),
        read: false
      });
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading chat...</div>;
  }

  if (!chatOpen) {
    return <div className="text-center p-4">Chat has been closed. Thank you for using CartRabbit.</div>;
  }

  return (
    <div className="max-w-lg mx-auto p-4 bg-gray-50 dark:bg-gray-900 rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-white">Mad Tea Party Chat</h2>
      <ChatComponent
        chatMessages={messages}
        chatInput={input}
        setChatInput={setInput}
        sendMessage={sendMessage}
      />
      <div ref={messagesEndRef} />
    </div>
  );
};

Chat.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      userId: PropTypes.string.isRequired,
      hostId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Chat;
