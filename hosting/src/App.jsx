// src/App.jsx
import  { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Header from './components/Header';
import Footer from './components/Footer';
import ViewToggle from './components/app/ViewToggle';
import LeftPanel from './components/LeftPanel';
import Dashboard from './components/Dashboard';
import RightPanel from './components/RightPanel';
import SignupForm from './components/Forms/SignupForm';
import TermsAndConditions from './components/Forms/TermsAndConditions';
import PostSignup from './components/Forms/PostSignup';
import UserProfileForm from './components/Forms/UserProfileForm';
import CartProfileForm from './components/Forms/CartProfileForm';
import AccountSessionComponent from './components/AccountSessionComponent';
import RideStatusTracker from './components/RideStatusTracker';
import CheckoutSuccess from './components/Forms/CheckoutSuccess';
import OnboardingRedirect from './components/Auth/OnboardingRedirect';
import useAppState from './hooks/useAppState';
import { GeolocationProvider } from './context/GeolocationContext';
import AppProviders from './components/app/AppProviders';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Main App component that sets up context providers and renders the layout.
 */
const App = () => {
  const appState = useAppState();

  const {
    darkMode,
    setDarkMode,
    appMode,
    setAppMode,
    viewMode,
    setViewMode,
    isRightPanelOpen,
    setIsRightPanelOpen,
    isLeftPanelOpen,
    setIsLeftPanelOpen,
    businesses,
    selectedItem,
    setSelectedItem,
    fetchBusinesses,
    rideRequest,
    rideRequestId,
    handleSearchDestinationSelect,
    handleSearchPickupSelect,
    handleCancelRide,
    fetchMostRecentRideRequest,
    loadingBusinesses,
    errorBusinesses,
  } = appState;

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  // Fetch the most recent ride request on mount
  useEffect(() => {
    fetchMostRecentRideRequest();
  }, [fetchMostRecentRideRequest]);


    const businessCategories = [
      { name: 'all', color: 'bg-red-500' },
      { name: 'Store', color: 'bg-purple-500' },
      { name: 'Food', color: 'bg-green-500' },
      { name: 'Bar', color: 'bg-yellow-500' },
      { name: 'Entertainment', color: 'bg-blue-500' },
      { name: 'Rental', color: 'bg-indigo-500' },
      { name: 'Theater', color: 'bg-pink-500' },
  ];

  return (
    <AppProviders>
      <Router>
        <GeolocationProvider>
          <Elements stripe={stripePromise}>
            <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''} overflow-auto`}>
              <Header
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                appMode={appMode}
                setAppMode={setAppMode}
                setIsLeftPanelOpen={setIsLeftPanelOpen}
                setIsRightPanelOpen={setIsRightPanelOpen}
              />

              <ViewToggle
                setViewMode={setViewMode}
                setIsLeftPanelOpen={setIsLeftPanelOpen}
                setIsRightPanelOpen={setIsRightPanelOpen}
              />

              {/* Main Content with Routes */}
              <main className="flex-grow">
                <Routes>
                  {/* Dashboard and Panels */}
                  <Route
                    path="/"
                    element={
                      <div className="flex flex-col md:flex-row h-full overflow-hidden">
                        {/* Left Panel */}
                        <LeftPanel
                          appMode={appMode}
                          darkMode={darkMode}
                          isOpen={isLeftPanelOpen}
                          setIsOpen={setIsLeftPanelOpen}
                          isRightPanelOpen={isRightPanelOpen}
                          setIsRightPanelOpen={setIsRightPanelOpen}
                          businesses={businesses}
                          selectedItem={selectedItem}
                          handleSelectItem={handleSelectItem}
                          viewType={viewMode}
                          fetchBusinesses={fetchBusinesses}
                          loadingBusinesses={loadingBusinesses}
                          errorBusinesses={errorBusinesses}
                        />

                        {/* Dashboard */}
                        <div className="flex-grow h-full overflow-y-auto">
                          <Dashboard
                            selectedItem={selectedItem}
                            handleCancelRide={handleCancelRide}
                            handleSearchDestinationSelect={handleSearchDestinationSelect}
                            handleSearchPickupSelect={handleSearchPickupSelect}
                          />
                        </div>

                        {/* Right Panel */}
                        {isRightPanelOpen && (
                          <RightPanel
                            isOpen={isRightPanelOpen}
                            setIsOpen={setIsRightPanelOpen}
                            appMode={appMode}
                            darkMode={darkMode}
                            rideRequestId={rideRequestId}
                            rideRequest={rideRequest}
                            loading={loadingBusinesses} // Ensure this prop makes sense
                            viewType="list"
                            businesses={businesses}
                            isRightPanelOpen={isRightPanelOpen}
                            setIsRightPanelOpen={setIsRightPanelOpen}
                            fetchBusinesses={fetchBusinesses}
                            error={errorBusinesses}
                            fetchMostRecentRideRequest={fetchMostRecentRideRequest}
                          />
                        )}
                      </div>
                    }
                  />

                  {/* Other Routes */}
                  <Route path="/signup" element={<SignupForm />} />
                  <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                  <Route path="/post-signup" element={<PostSignup />} />
                  <Route path="/user-profile" element={<UserProfileForm />} />
                  <Route path="/cart-profile" element={<CartProfileForm />} />
                  <Route path="/account-session" element={<AccountSessionComponent />} />
                  <Route path="/active" element={<RideStatusTracker />} />
                  <Route path="/success" element={<CheckoutSuccess />} />
                  <Route path="/onboarding-redirect" element={<OnboardingRedirect />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </Elements>
        </GeolocationProvider>
      </Router>
    </AppProviders>
  );
};

export default App;