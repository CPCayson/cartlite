// src/components/leftpanel/subguest/BusinessItem.jsx

import PropTypes from 'prop-types';
import { useMemo } from 'react';

const BusinessItem = ({ item, handleSelectItem, selectedItem, viewType }) => {
  // Ensure item.category is a string before calling toLowerCase
  const category = typeof item.category === 'string' ? item.category.toLowerCase() : 'unknown';

  // Map category to color
  const categoryColor = useMemo(() => {
    switch (category) {
      case 'food':
        return 'bg-green-100';
      case 'store':
        return 'bg-purple-100';
      case 'bar':
        return 'bg-yellow-100';
      case 'entertainment':
        return 'bg-blue-100';
      case 'rental':
        return 'bg-indigo-100';
      case 'theater':
        return 'bg-pink-100';
      // Add more categories as needed
      default:
        return 'bg-gray-100';
    }
  }, [category]);

  return (
    <div
      className={`${
        categoryColor
      } p-4 rounded-lg shadow cursor-pointer transition-transform transform hover:scale-105 ${
        selectedItem && selectedItem.id === item.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => handleSelectItem(item)}
      data-category={item.category}
      data-price={item.price}
    >
      {viewType === 'grid' ? (
        <div>
          <h3 className="business-name font-bold text-gray-800">{item.name}</h3>
          <p className="text-sm text-gray-600">{item.type_of_place}</p>
          <p className="text-xs text-gray-600">{item.product_services}</p>
          <p className="text-xs text-gray-600">Rating: {item.rating || 'No rating'}</p>
          {item.price !== undefined && (
            <div className="mt-2">
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                Price: ${item.price.toFixed(2)}
              </span>
            </div>
          )}
          {selectedItem && selectedItem.id === item.id && (
            <div className="mt-2">
              <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs">Checkout</button>
            </div>
          )}
        </div>
      ) : (
        // List View
        <div className="flex flex-col">
          <h3 className="business-name font-bold text-gray-800">{item.name}</h3>
          <p className="text-sm text-gray-600">{item.type_of_place}</p>
          <div className="flex flex-wrap items-center mt-1">
            <p className="text-xs text-gray-600 mr-2">{item.product_services}</p>
            <p className="text-xs text-gray-600">Rating: {item.rating || 'No rating'}</p>
          </div>
          {item.price !== undefined && (
            <div className="mt-2">
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                Price: ${item.price.toFixed(2)}
              </span>
            </div>
          )}
          {selectedItem && selectedItem.id === item.id && (
            <div className="mt-2">
              <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs">Checkout</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

BusinessItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    category: PropTypes.string,
    name: PropTypes.string.isRequired,
    type_of_place: PropTypes.string,
    product_services: PropTypes.string,
    rating: PropTypes.number,
    price: PropTypes.number,
    // Add other properties as needed
  }).isRequired,
  handleSelectItem: PropTypes.func.isRequired,
  selectedItem: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    // Add other properties as needed
  }),
  viewType: PropTypes.string.isRequired,
};

export default BusinessItem;


