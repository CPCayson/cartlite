// Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Footer = () => (
  <footer className="bg-gray-100 dark:bg-gray-900 text-center p-2 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
    {/* Left: Copyright */}
    <span>© 2024 RideShare & Discover App</span>

    {/* Center: Logo */}
    <div className="flex-1 flex justify-center">
      <img src="/logo.png" alt="cartRABBIT Logo" className="h-10" />
    </div>

    {/* Right: Terms and Conditions Link */}
    <div className="flex-1 flex justify-end">
      <Link to="/terms-and-conditions" className="text-blue-500 hover:underline">
        Terms and Conditions
      </Link>
    </div>
  </footer>
);

export default Footer;
