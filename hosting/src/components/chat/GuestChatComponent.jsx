import React from 'react';
import PropTypes from 'prop-types';

const GuestChatComponent = ({
  rideId,
  hostId,
  hostLocation,
  chatMessages,
  sendMessage,
  chatInput,
  setChatInput
}) => {
  return (
    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Chat with Host</h3>
      
      {hostLocation && (
        <div className="mb-4">
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">Host Location</h4>
          <p className="text-gray-600 dark:text-gray-400">
            Latitude: {hostLocation.latitude}, Longitude: {hostLocation.longitude}
          </p>
        </div>
      )}

      <div className="bg-gray-100 dark:bg-gray-600 p-2 h-64 overflow-y-scroll mb-2 rounded">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 ${msg.isFromHost ? 'text-left' : 'text-right'}`}
          >
            <span className="font-bold text-sm">
              {msg.isFromHost ? 'Host' : 'You'}:
            </span>
            <p className={`inline-block p-2 rounded-lg ${
              msg.isFromHost
                ? 'bg-gray-300 text-black'
                : 'bg-blue-500 text-white'
            }`}>
              {msg.text}
            </p>
          </div>
        ))}
      </div>
      
      <input
        type="text"
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
        placeholder="Type a message..."
      />
      <button
        className="bg-green-500 text-white py-2 px-4 rounded mt-2"
        onClick={sendMessage}
      >
        Send
      </button>
    </div>
  );
};

GuestChatComponent.propTypes = {
  rideId: PropTypes.string.isRequired,
  hostId: PropTypes.string.isRequired,
  hostLocation: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }),
  chatMessages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    isFromHost: PropTypes.bool.isRequired,
  })).isRequired,
  sendMessage: PropTypes.func.isRequired,
  chatInput: PropTypes.string.isRequired,
  setChatInput: PropTypes.func.isRequired,
};

export default GuestChatComponent;

