import { List, Grid, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';
const LeftPanel = ({ isOpen, setIsOpen, activeView, setActiveView, activeCategory, setActiveCategory, viewType, setViewType, handleSelectItem, appMode, onSettingsClick }) => {
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

  const sampleRides = [
    { id: 1, name: "Economy", rating: 4.7, type: "Affordable", eta: "3 min" },
    { id: 2, name: "Comfort", rating: 4.9, type: "Spacious", eta: "5 min" },
    { id: 3, name: "Luxury", rating: 4.8, type: "Premium", eta: "7 min" },
  ];

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" />
    ));
  };

  const renderItems = () => {
    const items = appMode === 'rabbit' ? sampleBusinesses[activeCategory] : sampleRides;
    return items.map(item => (
      <div key={item.id} 
           className={`bg-white dark:bg-gray-700 p-4 rounded-lg shadow ${viewType === 'grid' ? 'w-full sm:w-1/2 md:w-1/3' : 'w-full'} cursor-pointer mb-4`} 
           onClick={() => handleSelectItem(item)}>
        <h3 className="font-bold text-gray-800 dark:text-white">{item.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{item.type}</p>
        {appMode === 'host' && <p className="text-sm text-blue-500">ETA: {item.eta}</p>}
        <div className="flex mt-2">{renderStars(item.rating)}</div>
      </div>
    ));
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${isOpen ? 'w-1/2' : 'w-[30%]'} overflow-hidden`}>
      <div className="p-4">
        {appMode === 'rabbit' && (
          <>
            <div className="flex justify-between mb-4">
              <button 
                className={`px-3 py-1 rounded ${activeView === 'rabbit' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white'}`}
                onClick={() => setActiveView('rabbit')}
              >
                Nearby things to do
              </button>
              <button 
                className={`px-3 py-1 rounded ${activeView === 'carts' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white'}`}
                onClick={() => setActiveView('carts')}
              >
                Carts
              </button>
            </div>
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
          </>
        )}
        {appMode === 'host' && (
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Available Rides</h2>
        )}
        <div className="flex justify-end mb-4">
          <button onClick={() => setViewType('list')} className={`mr-2 ${viewType === 'list' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
            <List />
          </button>
          <button onClick={() => setViewType('grid')} className={viewType === 'grid' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}>
            <Grid />
          </button>
        </div>
        <div className={`${viewType === 'grid' ? 'flex flex-wrap -mx-2' : ''}`}>
          {renderItems()}
        </div>
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-r-full p-2 shadow-md"
      >
        {isOpen ? <ChevronLeft className="text-gray-600 dark:text-gray-300" /> : <ChevronRight className="text-gray-600 dark:text-gray-300" />}
      </button>
    </div>
  );
};

LeftPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  activeView: PropTypes.string.isRequired,
  setActiveView: PropTypes.func.isRequired,
  activeCategory: PropTypes.string.isRequired,
  setActiveCategory: PropTypes.func.isRequired,
  viewType: PropTypes.string.isRequired,
  setViewType: PropTypes.func.isRequired,
  handleSelectItem: PropTypes.func.isRequired,
  appMode: PropTypes.string.isRequired,
  onSettingsClick: PropTypes.func.isRequired,
};

export default LeftPanel;
