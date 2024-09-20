// src/components/shared/RightPanel.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const RightPanel = ({ buttons, toggleRightPanel }) => {
  return (
    <aside
      className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-transform duration-300 ease-in-out shadow-lg p-4 relative w-full sm:w-64"
      aria-label="Right Sidebar"
    >
      {/* Close Button */}
      <button
        onClick={toggleRightPanel}
        className="absolute top-2 right-2 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-1"
        aria-label="Close Right Panel"
      >
        <X size={24} />
      </button>

      {/* Panel Content */}
      <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
      <div className="space-y-4">
        {buttons.map((button) => (
          <button
            key={button.name}
            onClick={() => {
              if (button.badge === 'attention') {
                // Handle attention badge action
                console.log(`${button.name} requires attention`);
              } else if (button.badge === 'complete') {
                // Handle complete badge action
                console.log(`${button.name} is complete`);
              } else {
                // Handle default action
                console.log(`${button.name} clicked`);
              }
            }}
            className="w-full bg-white bg-opacity-20 text-white py-2 px-4 rounded-lg flex justify-between items-center hover:bg-white hover:bg-opacity-30 transition focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={button.name}
          >
            <span>{button.name}</span>
            {button.badge && (
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  button.badge === 'attention' ? 'bg-yellow-500 text-black' :
                  button.badge === 'complete' ? 'bg-green-500 text-white' : ''
                }`}
                aria-label={`${button.badge} badge`}
              >
                {button.badge.charAt(0).toUpperCase() + button.badge.slice(1)}
              </span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
};

RightPanel.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      badge: PropTypes.oneOf(['attention', 'complete', null]),
    })
  ).isRequired,
  toggleRightPanel: PropTypes.func.isRequired,
};

export default RightPanel;
