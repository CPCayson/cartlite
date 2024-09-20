import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, ChevronLeft, ChevronRight, Grid, List, Star, ArrowLeft, Moon, Sun } from 'lucide-react';

const OnboardingStep = ({ target, content, onNext, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-sm">
      <p className="text-gray-800 dark:text-gray-200 mb-4">{content}</p>
      <div className="flex justify-between">
        <button onClick={onNext} className="bg-blue-500 text-white px-4 py-2 rounded">
          Next
        </button>
        <button onClick={onClose} className="text-gray-600 dark:text-gray-400">
          Skip
        </button>
      </div>
    </div>
  </div>
);

const RiderLayout = () => {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [activeView, setActiveView] = useState('rabbit');
  const [activeCategory, setActiveCategory] = useState('all food');
  const [viewType, setViewType] = useState('list');
  const [selectedItem, setSelectedItem] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [leftPanelWidth, setLeftPanelWidth] = useState(30);
  const leftPanelRef = useRef(null);
  const isDraggingRef = useRef(false);

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

  const sampleCars = [
    { id: 1, name: "Toyota Prius", rating: 4.7, type: "Hybrid" },
    { id: 2, name: "Tesla Model 3", rating: 4.9, type: "Electric" },
    { id: 3, name: "Honda Civic", rating: 4.5, type: "Gasoline" },
  ];

  const onboardingSteps = [
    { target: 'left-panel', content: 'Browse rabbit and cars in the left panel' },
    { target: 'search-bar', content: 'Use the search bar to find specific places or rides' },
    { target: 'map-placeholder', content: 'View locations on the interactive map' },
    { target: 'right-panel', content: 'See detailed information when you select an item' },
  ];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingRef.current && leftPanelRef.current) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        setLeftPanelWidth(Math.min(Math.max(newWidth, 20), 80));
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" />
    ));
  };

  const renderItems = () => {
    const items = activeView === 'rabbit' ? sampleBusinesses[activeCategory] : sampleCars;
    return items.map(item => (
      <div key={item.id} 
           className={`bg-white dark:bg-gray-700 p-4 rounded-lg shadow ${viewType === 'grid' ? 'w-full sm:w-1/2 md:w-1/3' : 'w-full'} cursor-pointer mb-4`} 
           onClick={() => {
             setSelectedItem(item);
             setIsRightPanelOpen(true);
             setLeftPanelWidth(30);
           }}>
        <h3 className="font-bold text-gray-800 dark:text-white">{item.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{item.type}</p>
        <div className="flex mt-2">{renderStars(item.rating)}</div>
      </div>
    ));
  };

  const handleNextOnboardingStep = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setOnboardingStep(-1);
    }
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''} bg-white dark:bg-gray-900`}>
    

      <div className="flex-1 flex overflow-hidden">
        <div 
          ref={leftPanelRef}
          className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 left-panel overflow-y-auto`}
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className="p-4">
            <div className="flex justify-between mb-4">
              <button 
                className={`px-3 py-1 rounded ${activeView === 'rabbit' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white'}`}
                onClick={() => setActiveView('rabbit')}
              >
                Businesses
              </button>
              <button 
                className={`px-3 py-1 rounded ${activeView === 'cars' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white'}`}
                onClick={() => setActiveView('cars')}
              >
                Cars
              </button>
            </div>
            {activeView === 'rabbit' && (
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
        </div>

        <div
          className="w-1 cursor-col-resize bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
          onMouseDown={handleMouseDown}
        />

        <div className={`flex-1 relative transition-all duration-300 ${isLeftPanelOpen && isRightPanelOpen ? 'hidden' : ''}`}>
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for rides or rabbit..."
                className="w-full p-2 pr-10 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
            </div>
          </div>

          <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
            <p className="text-gray-600 dark:text-gray-300">Map Component</p>
          </div>

          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-r-full p-2 shadow-md"
          >
            {isLeftPanelOpen ? <ChevronLeft className="text-gray-600 dark:text-gray-300" /> : <ChevronRight className="text-gray-600 dark:text-gray-300" />}
          </button>
        </div>

        <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${isRightPanelOpen ? 'w-1/2' : 'w-0'}`}>
          {selectedItem && (
            <div className="p-4">
              <button onClick={() => {
                setIsRightPanelOpen(false);
                setSelectedItem(null);
              }} className="mb-4 flex items-center text-blue-500">
                <ArrowLeft className="mr-2" /> Back to List
              </button>
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{selectedItem.name}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2">{selectedItem.type}</p>
              <div className="flex mb-4">{renderStars(selectedItem.rating)}</div>
            </div>
          )}
        </div>
      </div>

   

      {onboardingStep >= 0 && onboardingStep < onboardingSteps.length && (
        <OnboardingStep
          {...onboardingSteps[onboardingStep]}
          onNext={handleNextOnboardingStep}
          onClose={() => setOnboardingStep(-1)}
        />
      )}
    </div>
  );
};

export default RiderLayout;