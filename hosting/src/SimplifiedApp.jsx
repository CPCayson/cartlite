import React, { useContext, useCallback, useState } from 'react';
import Header from '@components/shared/Header';
import LeftPanel from '@components/shared/LeftPanel';
import RightPanel from '@components/shared/RightPanel';
import Modal from '@components/shared/Modal';
import SignupForm from '@components/shared/SignupForm';
import useBusinessesHook from '@hooks/useBusinessesHook'; // Correct import
import { useAuth } from '@context/AuthContext';
import { useAppState } from '@context/AppStateContext'; // Updated import path
import ThemeContext from '@context/ThemeContext';
import ContentView from '@components/shared/ContentView';
import ModalContext from '@context/ModalContext'; // Import the context object
import OnBoard from '@components/shared/OnBoard'; // Import the OnBoard component

const SimplifiedApp = () => {
  // Contexts
  const { darkMode } = useContext(ThemeContext);
  const { filteredBusinesses, loading, error, filterBusinesses } = useBusinessesHook(); // Use the custom hook
  const { user } = useAuth();
  const { activeModal, toggleModal } = useContext(ModalContext);
  const { isRightPanelOpen, appMode, isLeftPanelOpen } = useAppState(); // Use the state from AppStateContext

  // State variables specific to this component
  const [showAbout, setShowAbout] = useState(false);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [isSignup, setIsSignup] = useState(true);
  const [viewType, setViewType] = useState('list'); // Add viewType state
  const [activeSort, setActiveSort] = useState('all'); // Add activeSort state

  // Handler functions
  const toggleAbout = useCallback(() => setShowAbout((prev) => !prev), []);
  const handleToggleSignup = useCallback(() => setIsSignup((prev) => !prev), []);

  const handleSearchDestinationSelect = useCallback((address, coords) => {
    setDestinationLocation({ address, coords });
  }, []);

  const handleSearchPickupSelect = useCallback((address, coords) => {
    setPickupLocation({ address, coords });
  }, []);

  const handleBookRide = useCallback((rideDetails) => {
    // Implement your booking logic here
    console.log('Ride Details:', rideDetails);
  }, []);

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
    <div className={`h-screen w-full overflow-hidden ${darkMode ? 'dark' : ''}`}>
      <Header />
      <div className="flex h-full pt-16"> {/* Add padding-top to account for fixed header */}
        {/* Left Panel */}
        <LeftPanel />

        {/* Main Dashboard and Right Panel */}
        <div className="flex flex-col flex-grow overflow-hidden">
          {/* Dashboard Content */}
          <main className={`p-4 flex-grow overflow-auto bg-gray-100 dark:bg-gray-900`}>
            {/* About Section */}
            {showAbout && <AboutContainer />}

            {/* Main Content and Map */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Main Content */}
              <div className="flex-grow">
                {!isLeftPanelOpen ? (
                  <div className="flex flex-col h-1/2 overflow-y-auto">
                    <ContentView
                      viewType={viewType}
                      activeSort={activeSort}
                      setActiveSort={setActiveSort}
                    />
                  </div>
                ) : (
                  <OnBoard />
                )}
              </div>

              {/* Map Component */}
              {appMode === 'rabbit' && (
                <div className="h-96 lg:h-auto lg:w-1/2">
                  {/* Map component goes here */}
                </div>
              )}
            </div>

            {/* Right Panel */}
            {isRightPanelOpen && <RightPanel />}
          </main>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'signup' && (
        <Modal onClose={() => toggleModal(null)}>
          <SignupForm
            onClose={() => toggleModal(null)}
            isSignup={isSignup}
            handleToggle={handleToggleSignup}
          />
        </Modal>
      )}
      {activeModal && activeModal !== 'signup' && (
        <Modal title={activeModal} onClose={() => toggleModal(null)}>
          <p className="text-gray-600 dark:text-gray-300">
            {activeModal} content goes here.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default SimplifiedApp;