// src/components/shared/ItemCard.jsx

import React, { useContext, memo } from 'react';
import PropTypes from 'prop-types';
import { ChevronRight, X, Star } from 'lucide-react';
import { BusinessContext } from '../../context/BusinessContext'; // Adjust path as needed

/**
 * ItemCard represents a single business in the list or grid.
 */
const ItemCard = ({ item, viewType, isExpanded, onToggleExpand }) => {
  const { handleSelectItem } = useContext(BusinessContext); // Access the handler from context

  const handleClick = () => {
    handleSelectItem(item);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden transition-transform duration-300 
        ${viewType === 'grid' ? 'hover:scale-105 cursor-pointer' : 'cursor-pointer'}
        ${viewType === 'grid' ? 'transform' : ''}
      `}
      onClick={handleClick} // Set onClick to handle selection
      aria-expanded={isExpanded}
      role="button"
      tabIndex={0} // Make div focusable
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(); // Allow selection via keyboard
        }
      }}
    >
      {/* Business Content */}
      <div className="flex">
        {/* Image Section */}
        <img
          src={item.imageUrl || 'https://via.placeholder.com/128'}
          onError={(e) => (e.target.src = 'https://via.placeholder.com/128')} // Fallback if image fails
          alt={`${item.name} image`}
          loading="lazy" // Lazy load for performance
          className={`w-16 h-16 sm:w-24 sm:h-24 bg-gray-300 rounded-l-lg flex-shrink-0 object-cover
            ${viewType === 'grid' ? 'sm:w-20 sm:h-20' : ''}
          `}
        />

        {/* Content Section */}
        <div className="flex flex-col justify-between flex-grow p-2">
          <div>
            <h3 className={`font-semibold text-gray-800 dark:text-white ${viewType === 'grid' ? 'text-sm' : 'text-base'}`}>
              {item.name}
            </h3>
            <p className={`text-gray-500 dark:text-gray-400 text-xs ${viewType === 'grid' ? 'hidden' : 'block'}`}>
              {item.category}
            </p>
          </div>

          {/* Actions and Ratings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="ml-1 text-sm">{item.rating || 'N/A'}</span>
              <span className="ml-1 text-gray-400 text-xs">({item.reviews || 0})</span>
            </div>

            {/* Dynamic Price Tag */}
            {item.price !== undefined && (
              <div className="ml-4 bg-green-500 text-white px-2 py-1 rounded">
                <span className="text-xs">
                  ${item.price.toFixed(2)} {/* Adjust the price format if necessary */}
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

          {/* Expanded Content */}
          {isExpanded && viewType === 'list' && (
            <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-md transition-all ease-in-out duration-300 max-h-full overflow-hidden">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {item.description || 'This is a description of the item.'}
              </p>
              <button
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                onClick={(e) => { e.stopPropagation(); console.log('Book Now clicked for', item.name); }}
                aria-label={`Book ${item.name} now`}
              >
                Book Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Define prop types for ItemCard.
 */
ItemCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    reviews: PropTypes.number,
    description: PropTypes.string,
    price: PropTypes.number, // Added price prop for dynamic pricing
    rating: PropTypes.number,
  }).isRequired,
  viewType: PropTypes.oneOf(['list', 'grid']).isRequired,
  isExpanded: PropTypes.bool,
  onToggleExpand: PropTypes.func,
};

ItemCard.defaultProps = {
  isExpanded: false,
  onToggleExpand: () => {},
};

/**
 * Memoize ItemCard to prevent unnecessary re-renders.
 */
export default memo(ItemCard);
