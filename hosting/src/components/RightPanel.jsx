import React from 'react';
import { ArrowLeftIcon, StarIcon, PlusCircleIcon, MinusCircleIcon, UploadIcon, ExternalLinkIcon } from '@heroicons/react/solid';
import PropTypes from 'prop-types';
import TabbedSettingsForm from './TabbedSettingsForm'; // Import the new component

const RightPanel = ({ isOpen, setIsOpen, selectedItem, appMode, showProfile }) => {
  return (
    <div
      className={`fixed bottom-0 left-0 w-full md:w-96 ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      } bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 overflow-hidden`}
    >
      <div className="p-4 h-full">
        <button
          onClick={() => setIsOpen(false)}
          className="mb-4 flex items-center text-blue-500"
        >
          <ArrowLeftIcon className="mr-2 h-5 w-5" /> Back to List
        </button>
        {showProfile ? (
          <TabbedSettingsForm />
        ) : selectedItem ? (
          <>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
              {selectedItem.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {selectedItem.type}
            </p>
            {appMode === 'rider' && selectedItem.eta && (
              <p className="text-blue-500 mb-2">ETA: {selectedItem.eta}</p>
            )}
            {selectedItem.rating && (
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-4 h-4 ${
                      i < selectedItem.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                    fill="currentColor"
                  />
                ))}
              </div>
            )}
            {appMode === 'rider' ? (
              <button className="bg-blue-500 text-white px-4 py-2 rounded">
                Book Ride
              </button>
            ) : (
              <button className="bg-green-500 text-white px-4 py-2 rounded">
                View Details
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">No item selected</p>
        )}
      </div>
    </div>
  );
};

RightPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  selectedItem: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    eta: PropTypes.string,
    rating: PropTypes.number,
  }),
  appMode: PropTypes.oneOf(['rider', 'driver']).isRequired,
  showProfile: PropTypes.bool.isRequired,
};

RightPanel.defaultProps = {
  selectedItem: {
    name: '',
    type: '',
    eta: '',
    rating: 0,
  },
  showProfile: false,
};

export default RightPanel;
