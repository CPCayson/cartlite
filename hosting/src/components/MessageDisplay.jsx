// MessageDisplay.jsx
import PropTypes from 'prop-types';

const MessageDisplay = ({ message }) => {
  if (!message) return null;

  return (
    <div className="mt-4 p-4 bg-blue-100 text-blue-700 rounded">
      {message}
    </div>
  );
};

MessageDisplay.propTypes = {
  message: PropTypes.string,
};

export default MessageDisplay;