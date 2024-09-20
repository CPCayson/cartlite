
// header/Logo.js
import PropTypes from 'prop-types';
import { Menu } from 'lucide-react';

const Logo = ({ setIsMobileMenuOpen, isMobileMenuOpen }) => (
  <div className="flex items-center">
    <button 
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      className="mr-4 lg:hidden"
    >
      <Menu size={24} />
    </button>
    <h1 className="text-2xl font-bold">cartRABBIT</h1>
  </div>
);

Logo.propTypes = {
  setIsMobileMenuOpen: PropTypes.func.isRequired,
  isMobileMenuOpen: PropTypes.bool.isRequired,
};

export default Logo;



