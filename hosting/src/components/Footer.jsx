import React from 'react';

const Footer = () => (
  <footer className="bg-gray-100 dark:bg-gray-900 text-center p-2 text-sm text-gray-600 dark:text-gray-400">
    © 2024 RideShare & Discover App
     {/* Center: Logo */}
     <div className="flex-1 flex justify-center">
      <img src="/logo.png" alt="cartRABBIT Logo" className="h-10" />
    </div>
  </footer>
);

export default Footer;