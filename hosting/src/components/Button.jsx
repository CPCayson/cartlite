import PropTypes from 'prop-types';

const Button = ({ onClick, className, children }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full ${className}`}
    >
      {children}
    </button>
  );
};


Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Button;