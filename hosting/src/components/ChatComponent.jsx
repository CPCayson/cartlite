import  { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const ChatComponent = ({ chatMessages, chatInput, setChatInput, sendMessage }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  return (
    <div className="mt-4 p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Chat with Guest</h3>
      
      {/* Chat Messages Display */}
      <div className="bg-gray-100 dark:bg-gray-700 p-3 h-48 overflow-y-scroll mb-3 rounded-lg">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg ${msg.sender === 'host' ? 'bg-blue-500 text-white text-right' : 'bg-green-500 text-white text-left'}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Anchor to auto-scroll */}
      </div>

      {/* Chat Input Field */}
      <div className="flex items-center">
        <input 
          type="text" 
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="flex-grow rounded-md border border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-2" 
          placeholder="Type a message..." 
        />
        
        {/* Send Button */}
        <button 
          className="bg-green-600 text-white py-2 px-4 rounded ml-2 hover:bg-green-700 transition duration-200"
          onClick={sendMessage}
          disabled={!chatInput.trim()} // Disable button when input is empty
        >
          Send
        </button>
      </div>
    </div>
  );
};

ChatComponent.propTypes = {
  chatMessages: PropTypes.arrayOf(
    PropTypes.shape({
      sender: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ).isRequired,
  chatInput: PropTypes.string.isRequired,
  setChatInput: PropTypes.func.isRequired,
  sendMessage: PropTypes.func.isRequired,
};

export default ChatComponent;
