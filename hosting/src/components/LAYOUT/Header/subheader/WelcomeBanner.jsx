// header/WelcomeBanner.js
import PropTypes from 'prop-types';

const WelcomeBanner = ({ user }) => {
  if (!user) return null;

  return (
    <div className=" text-center py-2 bg-yellow-300 text-gray-800 rounded mb-2">
      Welcome, {user.displayName || user.email}!
    </div>
  );
};

WelcomeBanner.propTypes = {
  user: PropTypes.object,
};

export default WelcomeBanner;
