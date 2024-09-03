import React, { useState, useEffect } from 'react';
import { Menu, Search, ChevronLeft, ChevronRight, Grid, List, Star, ArrowLeft, Moon, Sun, Users } from 'lucide-react';

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

const AppLayout = () => {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [activeView, setActiveView] = useState('businesses');
  const [activeCategory, setActiveCategory] = useState('all food');
  const [viewType, setViewType] = useState('list');
  const [selectedItem, setSelectedItem] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [appMode, setAppMode] = useState('business'); // 'business' or 'rider'

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

  const onboardingSteps = [
    { target: 'left-panel', content: 'Browse businesses and ride options in the left panel' },
    { target: 'search-bar', content: 'Use the search bar to find specific places or rides' },
    { target: 'map-placeholder', content: 'View locations and available rides on the interactive map' },
    { target: 'right-panel', content: 'See detailed information when you select an item' },
  ];

 

      <div className="flex-1 flex overflow-hidden">
        <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${isLeftPanelOpen ? 'w-1/2' : 'w-[30%]'}`}>
          <div className="p-4">
            
                    Cars
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
            {appMode === 'rider' && (
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
        </div>

        <div className={`flex-1 relative transition-all duration-300 ${isLeftPanelOpen && isRightPanelOpen ? 'hidden' : ''}`}>
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="relative">
              <input
                type="text"
                placeholder={appMode === 'business' ? "Search for businesses..." : "Enter your destination..."}
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
              {appMode === 'rider' && <p className="text-blue-500 mb-2">ETA: {selectedItem.eta}</p>}
              <div className="flex mb-4">{renderStars(selectedItem.rating)}</div>
              {appMode === 'rider' && (
                <button className="bg-blue-500 text-white px-4 py-2 rounded">
                  Book Ride
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="bg-gray-100 dark:bg-gray-900 text-center p-2 text-sm text-gray-600 dark:text-gray-400">
        © 2024 RideShare & Discover App
      </footer>

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

export default AppLayout;


Layout Overview

The screen is divided into three  main components:

    Left Panel (Business List Panel)
        Purpose: Displays a list of businesses available for users to explore and select from. It allows users to filter and view different categories of businesses such as food, bars, events, and deliveries.
        Key Elements:
            Header: Displays "Businesses" as the main title with a toggle option to switch to "Carts".
            Category Filters: Includes buttons for filtering businesses by categories like "all food", "bars", "events", and "deliveries". Each category is color-coded for easy identification.
            View Toggle: Provides an option to switch between different views (list or grid) to display businesses.
            Business Listings: Shows individual businesses with a brief description (e.g., "Quick Bites - Fast Food Delivery" and "Green Grocers - Grocery Delivery"). Each listing includes a star rating to indicate business quality.
        Actions:
            Filter Buttons: Allow users to filter the displayed businesses based on selected categories.
            View Toggle: Enables switching between list and grid views for better browsing experience.
            Business Selection: Users can click on a business listing to view more details or start an interaction (e.g., booking a delivery or making a reservation).

    Right Panel (Map Component)


    Main component -> 
    map with searchbar
        Purpose: Displays a map view that visually represents the locations of businesses and other points of interest. Provides an interactive interface for users to explore the geographical layout of businesses and navigate to their chosen destinations.
        Key Elements:
            Search Bar: Located at the top, allows users to search for specific businesses or locations on the map.
            Map Display: The main area displays a map component where businesses are likely marked with pins or icons representing their locations.
        Actions:
            Search Functionality: Users can input a search term to find specific businesses or points of interest on the map.
            Map Interaction: Users can interact with the map, such as zooming in/out, panning, or clicking on map pins to view business details.

