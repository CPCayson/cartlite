import PropTypes from 'prop-types';

const ActiveContainer = ({ activeView, chatMessages, chatInput, setChatInput, sendMessage, cancelAction }) => (
  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md mb-6">
    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Guest Pickup & Dropoff</h3>
    <p className="text-gray-600 dark:text-gray-300">
      Pickup Location: 
      <input type="text" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white" />
    </p>
    <p className="mt-2 text-gray-600 dark:text-gray-300">
      Dropoff Location: 
      <input type="text" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white" />
    </p>
    <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-white">Chat with Guest</h3>
    <div className="bg-gray-100 dark:bg-gray-600 p-2 h-32 overflow-y-scroll mb-2 rounded">
      {chatMessages.map((msg, index) => (
        <p key={index} className={`${msg.sender === 'host' ? 'text-right' : 'text-left'} mb-1`}>{msg.text}</p>
      ))}
    </div>
    <input 
      type="text" 
      value={chatInput}
      onChange={(e) => setChatInput(e.target.value)}
      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white" 
      placeholder="Type a message..." 
    />
    <button className="bg-green-500 text-white py-2 px-4 rounded mt-2 mr-2" onClick={sendMessage}>Send</button>
    <button className="bg-red-500 text-white py-2 px-4 rounded mt-2" onClick={cancelAction}>Cancel</button>
  </div>
);

ActiveContainer.propTypes = {
  activeView: PropTypes.string,
  chatMessages: PropTypes.arrayOf(PropTypes.shape({
    sender: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  })).isRequired,
  chatInput: PropTypes.string.isRequired,
  setChatInput: PropTypes.func.isRequired,
  sendMessage: PropTypes.func.isRequired,
  cancelAction: PropTypes.func.isRequired,
};


export default ActiveContainer;
