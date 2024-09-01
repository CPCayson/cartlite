import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LeftPanel = ({ 
  isOpen, 
  setIsOpen, 
  appMode, 
  handleAccept, 
  handleSelectItem, 
  activeCategory, 
  setActiveCategory, 
  viewType, 
  setViewType, 
  rideInProgress, 
  handleSettingsClick 
}) => {
  const [rideRequests, setRideRequests] = useState([
    { id: 1, requester: 'John Doe', time: '5 mins ago' },
    { id: 2, requester: 'Jane Smith', time: '10 mins ago' },
  ]);

  const businessCategories = [
    { name: 'all food', color: 'bg-red-500' },
    { name: 'bars', color: 'bg-purple-500' },
    { name: 'events', color: 'bg-green-500' },
    { name: 'deliveries', color: 'bg-yellow-500' },
  ];

  const sampleBusinesses = {
    'all food': [
      { id: 1, name: "Joe's Coffee", rating: 4.5, type: "Café" },
      { id: 2, name: "Pizza Palace", rating: 4.2, type: "Restaurant" },
      { id: 3, name: "Sushi Delight", rating: 4.8, type: "Japanese" },
    ],
    'bars': [
      { id: 4, name: "The Tipsy Crow", rating: 4.3, type: "Pub" },
      { id: 5, name: "Moonlight Lounge", rating: 4.6, type: "Cocktail Bar" },
    ],
    'events': [
      { id: 6, name: "City Music Festival", rating: 4.7, type: "Concert" },
      { id: 7, name: "Art in the Park", rating: 4.4, type: "Exhibition" },
    ],
    'deliveries': [
      { id: 8, name: "Quick Bites", rating: 4.1, type: "Fast Food Delivery" },
      { id: 9, name: "Green Grocers", rating: 4.5, type: "Grocery Delivery" },
    ],
  };

  const handleAcceptClick = (ride) => {
    handleAccept(ride);
    setIsOpen(false);
  };

  const renderItems = () => {
    const items = sampleBusinesses[activeCategory] || [];
    return items.map(item => (
      <div 
        key={item.id} 
        className={`bg-white dark:bg-gray-700 p-4 rounded-lg shadow ${viewType === 'grid' ? 'w-full sm:w-1/2 md:w-1/3' : 'w-full'} cursor-pointer mb-4`} 
        onClick={() => handleSelectItem(item)}
      >
        <h3 className="font-bold text-gray-800 dark:text-white">{item.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{item.type}</p>
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
    <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${isOpen || rideInProgress ? 'w-1/2' : 'w-[30%]'} overflow-hidden`}>
      <div className="p-4">
        {appMode === 'host' ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Incoming Accepts</h2>
            {rideRequests.map((ride) => (
              <div key={ride.id} className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-800 dark:text-white">{ride.requester}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{ride.time}</p>
                </div>
                <button onClick={() => handleAcceptClick(ride)} className="bg-blue-500 text-white px-4 py-2 rounded">Accept</button>
              </div>
            ))}
            <button 
              onClick={handleSettingsClick} 
              className="bg-gray-700 text-white px-4 py-2 rounded mt-4"
            >
              Settings
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Businesses</h2>
            <div className="flex flex-wrap justify-start mb-4">
              {businessCategories.map((category) => (
                <button
                  key={category.name}
                  className={`px-3 py-1 rounded mr-2 mb-2 ${category.color} text-white`}
                  onClick={() => setActiveCategory(category.name)}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className={`${viewType === 'grid' ? 'flex flex-wrap -mx-2' : ''}`}>
              {renderItems()}
            </div>
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
  handleAccept: PropTypes.func.isRequired,
  handleSelectItem: PropTypes.func.isRequired,
  activeCategory: PropTypes.string.isRequired,
  setActiveCategory: PropTypes.func.isRequired,
  viewType: PropTypes.string.isRequired,
  setViewType: PropTypes.func.isRequired,
  rideInProgress: PropTypes.bool.isRequired,
  handleSettingsClick: PropTypes.func.isRequired,
};

export default LeftPanel;
