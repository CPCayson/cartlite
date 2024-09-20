// src/SimplifiedApp.jsx

import React, { useState, useContext, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Moon,
  Sun,
  Grid,
  List,
  LogIn,
  MessageCircle,
  Info,
} from 'lucide-react';
import ContentView from '@components/shared/ContentView';
import Modal from '@components/shared/Modal';
import SignupForm from '@components/shared/SignupForm';
import RightPanel from '@components/shared/RightPanel';
import MapComponent from '@components/shared/MapComponent';
import SearchBar from '@components/shared/SearchBar';
import { BusinessContext } from '@context/BusinessContext';
import { GeolocationProvider } from '@context/GeolocationContext';

const SimplifiedApp = () => {
  // Existing state variables
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [viewType, setViewType] = useState('grid');
  const [activeSort, setActiveSort] = useState('all');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // New state variables for pickup and destination locations
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);

  // New state variable for toggling between signup and login
  const [isSignup, setIsSignup] = useState(true);

  // Access businesses from context
  const { businesses } = useContext(BusinessContext);

  // Handler functions with useCallback
  const togglePanelExpansion = useCallback(() => setIsPanelExpanded((prev) => !prev), []);
  const toggleRightPanel = useCallback(() => setIsRightPanelOpen((prev) => !prev), []);
  const toggleDarkMode = useCallback(() => setDarkMode((prev) => !prev), []);
  const toggleViewType = useCallback(() => setViewType((prev) => (prev === 'list' ? 'grid' : 'list')), []);
  const toggleLoginModal = useCallback(() => setIsLoginModalOpen((prev) => !prev), []);
  const toggleAbout = useCallback(() => setShowAbout((prev) => !prev), []);

  const handleToggleSignup = useCallback(() => setIsSignup((prev) => !prev), []);

  // Handler functions for search selections
  const handleSearchDestinationSelect = useCallback((address, coords) => {
    setDestinationLocation({ address, coords });
  }, []);

  const handleSearchPickupSelect = useCallback((address, coords) => {
    setPickupLocation({ address, coords });
  }, []);

  const handleBookRide = useCallback((rideDetails) => {
    // Implement your booking logic here
    console.log('Ride Details:', rideDetails);
    // For example, navigate to a checkout page or update state
  }, []);

  const sortButtons = ['All', 'Food', 'Entertainment', 'Store'];

  const AboutContainer = useCallback(() => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">About Our Platform</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        Welcome to our diverse marketplace! We offer a curated selection of gourmet food, exciting entertainment options, and unique stores.
        Explore our offerings and discover something new today.
      </p>
      <button
        onClick={toggleAbout}
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        Close
      </button>
    </div>
  ), [toggleAbout]);

  return (
    <GeolocationProvider>
      <div className={`h-screen w-full overflow-hidden ${darkMode ? 'dark' : ''}`}>
        <div className="flex h-full">
          {/* Left Panel */}
          <div
            className={`bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 transition-all duration-300 ease-in-out shadow-xl flex flex-col
              ${isPanelExpanded ? 'w-64 sm:w-72' : 'w-16 sm:w-24'}`}
          >
            {/* Panel Header */}
            <div className="p-4 flex justify-between items-center">
              {isPanelExpanded && <h2 className="text-2xl font-bold text-white">Explorer</h2>}
              <div className="flex space-x-2">
                <button
                  onClick={togglePanelExpansion}
                  className="p-2 rounded-full bg-white bg-opacity-20 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label={isPanelExpanded ? 'Collapse Panel' : 'Expand Panel'}
                >
                  {isPanelExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                </button>
                <button
                  onClick={toggleRightPanel}
                  className="p-2 rounded-full bg-white bg-opacity-20 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Toggle Right Panel"
                >
                  <Settings size={24} />
                </button>
              </div>
            </div>

            {/* Sorting Buttons */}
            <div className={`p-4 ${isPanelExpanded ? 'flex flex-wrap gap-2' : 'flex flex-col space-y-2'}`}>
              {sortButtons.map((button) => (
                <button
                  key={button}
                  onClick={() => setActiveSort(button.toLowerCase())}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    activeSort === button.toLowerCase()
                      ? 'bg-white text-purple-700'
                      : 'bg-white bg-opacity-20 text-white'
                  } ${!isPanelExpanded ? 'w-full' : ''}`}
                  aria-pressed={activeSort === button.toLowerCase()}
                >
                  {isPanelExpanded ? button : button.charAt(0)}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            {isPanelExpanded && (
              <div className="p-4">
                <button
                  onClick={toggleViewType}
                  className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label={`Switch to ${viewType === 'list' ? 'Grid' : 'List'} View`}
                >
                  {viewType === 'list' ? <Grid size={20} /> : <List size={20} />}
                  <span>{viewType === 'list' ? 'Grid View' : 'List View'}</span>
                </button>
              </div>
            )}

            {/* Host Toggle */}
            {isPanelExpanded && (
              <div className="p-4">
                <button
                  onClick={() => console.log('Toggle Host Mode')}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition focus:outline-none focus:ring-2 focus:ring-green-400"
                  aria-label={isPanelExpanded ? 'Switch to User Mode' : 'Switch to Host Mode'}
                >
                  {isPanelExpanded ? 'Switch to User' : 'Switch to Host'}
                </button>
              </div>
            )}

            {/* ContentView in Left Panel */}
            {isPanelExpanded && (
              <div className="p-4 flex-grow overflow-auto">
                <ContentView
                  viewType={viewType}
                  activeSort={activeSort}
                  setActiveSort={setActiveSort}
                />
              </div>
            )}
          </div>

          {/* Main Dashboard and Right Panel */}
          <div className="flex flex-col flex-grow">
            {/* Header */}
            <header className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 p-4 flex justify-between items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Marketplace Explorer</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleAbout}
                  className="text-white flex items-center focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="About"
                >
                  <Info size={20} className="mr-2" />
                  <span className="hidden sm:inline">About</span>
                </button>
                <button
                  onClick={() => {
                    setIsSignup(false); // Default to login when opening the modal
                    toggleLoginModal();
                  }}
                  className="text-white flex items-center focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Login"
                >
                  <LogIn size={20} className="mr-2" />
                  <span className="hidden sm:inline">Login</span>
                </button>
                <div className="relative">
                  <MessageCircle size={20} className="text-white cursor-pointer" aria-label="Messages" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    4
                  </span>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className="text-white focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <Settings size={20} className="text-white cursor-pointer" aria-label="Settings" />
              </div>
            </header>

            {/* Dashboard Content */}
            <main className={`p-4 flex-grow overflow-auto bg-gray-100 dark:bg-gray-900 ${isRightPanelOpen ? 'flex flex-col lg:flex-row' : 'flex flex-col'}`}>
              {/* About Section */}
              {showAbout && <AboutContainer />}

              {/* Search Bar */}
              <div className="mb-4">
                <SearchBar
                  onDestinationSelect={handleSearchDestinationSelect}
                  onPickupSelect={handleSearchPickupSelect}
                  onBookRide={handleBookRide}
                  initialLatLng={pickupLocation ? pickupLocation.coords : null}
                  selectedItem={selectedItem} // Pass the selected item if needed
                  selectedRide={null} // Pass if needed
                  autoPopulateDestination={destinationLocation ? destinationLocation.coords : null} // Pass if needed
                />
              </div>

              {/* Main Content and Map */}
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Main Content */}
                <div className="flex-grow">
                  {/* Assuming you're directly using ContentView instead of BusinessList */}
                  <ContentView
                    viewType={viewType}
                    activeSort={activeSort}
                    setActiveSort={setActiveSort}
                  />
                </div>

                {/* Map Component */}
                <div className="h-96 lg:h-auto lg:w-1/2">
                  <MapComponent
                    businesses={businesses}
                    pickupLocation={pickupLocation ? pickupLocation.coords : null}
                    destinationLocation={destinationLocation ? destinationLocation.coords : null}
                    onSearchDestinationSelect={handleSearchDestinationSelect}
                    onSearchPickupSelect={handleSearchPickupSelect}
                  />
                </div>
              </div>

              {/* Right Panel */}
              {isRightPanelOpen && (
                <RightPanel
                  buttons={[
                    { name: 'Reservations', badge: 'attention' },
                    { name: 'Reviews', badge: 'complete' },
                    { name: 'Promotions', badge: null },
                  ]}
                  toggleRightPanel={toggleRightPanel}
                />
              )}
            </main>
          </div>
        </div>

        {/* Modals */}
        {isLoginModalOpen && (
          <Modal onClose={toggleLoginModal}>
            <SignupForm
              onClose={toggleLoginModal}
              isSignup={isSignup}
              handleToggle={handleToggleSignup}
            />
          </Modal>
        )}
      </div>
    </GeolocationProvider>
  );
};

export default SimplifiedApp;
