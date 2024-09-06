// LeftPanel.jsx
//things to do: Have a settings tab that activates right panel 
//utilize metafizzy isoptope to dyymacally sort buisnesses by name, rating 
//send geopoints for item selected to app.js -> from app.js to dashboard
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LeftPanel = ({
  isOpen,
  setIsOpen,
  appMode,
  handleSelectItem,
  activeCategory,
  setActiveCategory,
  viewType,
  setViewType,
  rideInProgress,
  handleSettingsClick,
  businesses,
  loadMoreBusinesses,
  loading,
  hasMore
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Define business categories
  const businessCategories = [
    { name: 'all', color: 'bg-red-500' },
    { name: 'Store', color: 'bg-purple-500' },
    { name: 'Food', color: 'bg-green-500' },
    { name: 'Bar', color: 'bg-yellow-500' },
  ];

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  const renderItems = () => {
    return businesses.map((item) => (
      <div 
        key={item.id} 
        className={`bg-white dark:bg-gray-700 p-4 rounded-lg shadow ${viewType === 'grid' ? 'w-full sm:w-1/2 md:w-1/3' : 'w-full'} cursor-pointer mb-4`} 
        onClick={() => handleSelectItem(item)}
      >
        <h3 className="font-bold text-gray-800 dark:text-white">{item.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{item.type_of_place}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{item.rating ? `Rating: ${item.rating}` : 'No rating'}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{item.product_services}</p>
        <div className="flex mt-2">{renderStars(item.rating)}</div>
      </div>
    ));
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${isOpen || rideInProgress ? 'w-full lg:w-1/2' : 'w-[30%]'} overflow-hidden`}>
      <button onClick={toggleFullScreen} className="absolute top-0 right-0 m-4 bg-blue-500 text-white px-4 py-2 rounded">
        {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
      </button>
      <div className="p-4 h-full overflow-y-auto">
        {appMode === 'host' ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Incoming Accepts</h2>
            {/* Content for hosts */}
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Businesses</h2>
            <div className="flex items-center mb-4">
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}
              >
                {viewType === 'grid' ? 'List View' : 'Grid View'}
              </button>
            </div>
            <div className="flex flex-wrap justify-start mb-4">
              {businessCategories.map((category) => (
                <button
                  key={category.name}
                  className={`px-3 py-1 rounded mr-2 mb-2 ${category.color} ${activeCategory === category.name ? 'border-2 border-black' : ''} text-white`}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className={`${viewType === 'grid' ? 'flex flex-wrap -mx-2' : ''}`}>
              {renderItems()}
            </div>
            {hasMore && !loading && (
              <button 
                onClick={loadMoreBusinesses} 
                className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full"
              >
                Load More
              </button>
            )}
            {loading && <p className="text-center mt-4">Loading...</p>}
          </>
        )}
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-r-full p-2 shadow-md ${rideInProgress ? 'hidden' : ''}`}
      >
        {isOpen ? <ChevronLeft className="text-gray-600 dark:text-gray-300" /> : <ChevronRight className="text-gray-600 dark:text-gray-300" />}
      </button>
    </div>
  );
};

LeftPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  appMode: PropTypes.string.isRequired,
  handleSelectItem: PropTypes.func.isRequired,
  activeCategory: PropTypes.string.isRequired,
  setActiveCategory: PropTypes.func.isRequired,
  viewType: PropTypes.string.isRequired,
  setViewType: PropTypes.func.isRequired,
  rideInProgress: PropTypes.bool.isRequired,
  handleSettingsClick: PropTypes.func.isRequired,
  businesses: PropTypes.array.isRequired,
  loadMoreBusinesses: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  hasMore: PropTypes.bool.isRequired
};

export default LeftPanel;

