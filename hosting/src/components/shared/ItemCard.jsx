// src/components/ItemCard.jsx

import React, { useContext, memo } from 'react';
import PropTypes from 'prop-types';
import { ChevronRight, X, Star } from 'lucide-react';
import { BusinessContext } from '../../context/BusinessContext';
import { useBookingCalculation } from '../../hooks/useBookingCalculation'; // Adjust path as needed

const ItemCard = ({ item, viewType, isExpanded, onToggleExpand }) => {
  const { handleSelectItem } = useContext(BusinessContext);
  const { bookingAmount, updateBookingAmount } = useBookingCalculation();

  const handleClick = () => {
    handleSelectItem(item);
  };

  // Example: Update booking amount based on item details if needed
  // This can be customized as per your booking calculation logic
  React.useEffect(() => {
    if (item.pickupCoords && item.destinationCoords) {
      updateBookingAmount(item.pickupCoords, item.destinationCoords);
    }
  }, [item, updateBookingAmount]);

  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-transform duration-300 
        ${viewType === 'grid' ? 'hover:scale-105 cursor-pointer' : 'cursor-pointer'}
        flex flex-col
      `}
      onClick={handleClick}
      aria-expanded={isExpanded}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center p-4">
        {/* Dynamic Price Area */}
        <div className="flex-shrink-0 w-full sm:w-24 h-24 bg-green-500 text-white flex items-center justify-center rounded-lg mb-4 sm:mb-0 sm:mr-4">
          <span className="text-xl font-bold">
            ${item.price ? item.price.toFixed(2) : '0.00'}
          </span>
        </div>

        <div className="flex flex-col justify-between flex-grow">
          <div>
            <h3 className={`font-semibold text-gray-800 dark:text-white text-lg`}>
              {item.name}
            </h3>
            <p className={`text-gray-500 dark:text-gray-400 text-sm`}>
              {item.category}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="ml-1 text-sm">{item.rating || 'N/A'}</span>
              <span className="ml-1 text-gray-400 text-xs">({item.reviews || 0})</span>
            </div>
            {item.price !== undefined && viewType === 'grid' && (
              <div className="ml-4 bg-green-500 text-white px-2 py-1 rounded">
                <span className="text-xs">
                  ${item.price.toFixed(2)}
                </span>
              </div>
            )}
            {viewType === 'list' && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={isExpanded ? 'Collapse Details' : 'Expand Details'}
                aria-expanded={isExpanded}
              >
                {isExpanded ? <X size={20} /> : <ChevronRight size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {isExpanded && viewType === 'list' && (
        <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-md transition-all ease-in-out duration-300">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {item.description || 'This is a description of the item.'}
          </p>
          <button
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            onClick={(e) => { e.stopPropagation(); console.log('Book Now clicked for', item.name); }}
            aria-label={`Book ${item.name} now`}
          >
            Book Now
          </button>
        </div>
      )}
    </div>
  );
};

ItemCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    imageUrl: PropTypes.string, // Now optional since image is moved out
    reviews: PropTypes.number,
    description: PropTypes.string,
    price: PropTypes.number,
    rating: PropTypes.number,
    pickupCoords: PropTypes.shape({ // Example additional props
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }),
    destinationCoords: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }),
  }).isRequired,
  viewType: PropTypes.oneOf(['list', 'grid']).isRequired,
  isExpanded: PropTypes.bool,
  onToggleExpand: PropTypes.func,
};

ItemCard.defaultProps = {
  isExpanded: false,
  onToggleExpand: () => {},
};

export default memo(ItemCard);
