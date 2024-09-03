import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { ChakraProvider } from '@chakra-ui/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Context Providers
import { FirebaseProvider } from './context/FirebaseContext.jsx';
import { ErrorBoundary } from './context/ErrorBoundary.jsx';
import { MapsProvider } from './context/MapsContext.jsx';
import { StripeProvider } from './context/StripeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Components
import Header from './components/Header.jsx';
import LeftPanel from './components/LeftPanel.jsx';
import RightPanel from './components/RightPanel.jsx';
import Footer from './components/Footer.jsx';
import SearchBar from './components/SearchBar.jsx';
import Dashboard from './components/Dashboard.jsx';
import ActiveContainer from './components/ActiveContainer.jsx';
import MapComponent from './components/MapComponent.jsx';

// Firebase Config and API functions
import { db } from './firebase/firebaseConfig';
import { createRideRequest, updateBooking, getProfileData, saveProfileData, listenToRideRequests } from './api/firebaseApi.jsx';
import { handleCreateStripeOnboarding, handleCreateCheckoutSession, handleCapturePaymentIntent, handleCancelPaymentIntent } from './api/stripeApi';

// Stripe Configuration
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [appMode, setAppMode] = useState('rabbit'); // 'rabbit' or 'host'
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rideInProgress, setRideInProgress] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewType, setViewType] = useState('list');
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [cachedBusinesses, setCachedBusinesses] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [userEmail, setUserEmail] = useState('test@example.com');
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [paymentIntentStatus, setPaymentIntentStatus] = useState('');
  const [message, setMessage] = useState('');

  // Fetch businesses data from Firebase
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'places'));
        const businessesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBusinesses(businessesData);
        setFilteredBusinesses(businessesData);
      } catch (error) {
        console.error('Error fetching businesses from Firebase:', error);
      }
    };

    fetchBusinesses();
  }, []);

  // Update filtered businesses based on the active category
  useEffect(() => {
    if (cachedBusinesses[activeCategory]) {
      setFilteredBusinesses(cachedBusinesses[activeCategory]);
    } else if (activeCategory === 'all') {
      setFilteredBusinesses(businesses);
    } else {
      const filtered = businesses.filter((business) => business.category === activeCategory);
      setFilteredBusinesses(filtered);
      setCachedBusinesses((prevCache) => ({
        ...prevCache,
        [activeCategory]: filtered,
      }));
    }
  }, [activeCategory, businesses, cachedBusinesses]);

  // Handle accepting a ride
  const handleAccept = (ride) => {
    setSelectedItem(ride);
    setIsRightPanelOpen(true);
    setRideInProgress(true);
    setChatMessages([
      { sender: 'guest', text: 'Hello! Looking forward to the ride.' },
      { sender: 'host', text: 'Hi! I will be there in 5 minutes.' },
    ]);
  };

  // Handle selecting an item
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    
    // Only set the right panel to open if it's not already open
    if (!isRightPanelOpen) {
      setIsRightPanelOpen(true);
    }
  };
  // Handle toggling the right panel
  const handleToggleRightPanel = () => {
    setIsRightPanelOpen(!isRightPanelOpen);
  };

  // Handle sending a message in the chat
  const sendMessage = () => {
    if (chatInput.trim()) {
      const newMessage = { sender: 'host', text: chatInput };
      setChatMessages((prevMessages) => [...prevMessages, newMessage]);
      setChatInput('');
    }
  };

  // Cancel an active ride
  const cancelRide = () => {
    setRideInProgress(false);
    setSelectedItem(null);
  };

  // Handle booking a ride
  const handleBookRide = () => {
    console.log('Booking a ride');
  };

  // Update payment intent
  const handlePaymentIntentUpdate = (id, status) => {
    setPaymentIntentId(id);
    setPaymentIntentStatus(status);
  };

  // Stripe functions for handling payments and onboarding
  const startStripeOnboarding = async () => {
    try {
      await handleCreateStripeOnboarding(userEmail);
    } catch (error) {
      console.error('Error starting Stripe onboarding:', error);
      setMessage(error.message);
    }
  };

  const createStripeCheckoutSession = async () => {
    try {
      const response = await handleCreateCheckoutSession(1000); // Example amount in cents
      setMessage('Redirecting to Stripe Checkout...');
      window.location.href = response.url;
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      setMessage(error.message);
    }
  };

  const captureStripePaymentIntent = async () => {
    try {
      if (!paymentIntentId) {
        throw new Error('Payment Intent ID is missing.');
      }
      const response = await handleCapturePaymentIntent(paymentIntentId);
      setMessage(`Payment Intent captured: ${response.id}`);
    } catch (error) {
      console.error('Error capturing payment intent:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const cancelStripePaymentIntent = async () => {
    try {
      const response = await handleCancelPaymentIntent(paymentIntentId);
      setMessage(`Payment Intent canceled: ${response.id}`);
    } catch (error) {
      console.error('Error canceling payment intent:', error);
      setMessage(error.message);
    }
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
      <ErrorBoundary>
        <FirebaseProvider>
          <AuthProvider>
            <ChakraProvider>
              <MapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <Elements stripe={stripePromise}>
                  <StripeProvider>
                    <SearchBar
                      userEmail={userEmail}
                      paymentIntentId={paymentIntentId}
                      paymentIntentStatus={paymentIntentStatus}
                      onPaymentIntentUpdate={handlePaymentIntentUpdate}
                      onBookRide={handleBookRide}
                    />
                    <Header
                      darkMode={darkMode}
                      setDarkMode={setDarkMode}
                      appMode={appMode}
                      setAppMode={setAppMode}
                      setIsLeftPanelOpen={() => {}} // Left panel is always open
                      setIsRightPanelOpen={setIsRightPanelOpen}
                    />
                    <div className="flex flex-1 overflow-hidden">
                      {/* Left Panel - Always Visible */}
                      <LeftPanel
                        isOpen={true}
                        setIsOpen={() => {}}
                        appMode={appMode}
                        handleAccept={handleAccept}
                        handleSelectItem={handleSelectItem}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        viewType={viewType}
                        setViewType={setViewType}
                        rideInProgress={rideInProgress}
                        handleSettingsClick={handleToggleRightPanel}
                        businesses={filteredBusinesses}
                      />

                      {/* Main Content - Toggle Visibility Based on Right Panel State */}
                      {!isRightPanelOpen && (
                        <main className={`flex-1 flex flex-col relative transition-all duration-300`}>
                          {appMode === 'rabbit' && !rideInProgress && (
                            <>
                              <Dashboard appMode={appMode} selectedItem={selectedItem} />
                              <MapComponent businesses={filteredBusinesses} />
                            </>
                          )}
                          {appMode === 'host' && rideInProgress && (
                            <ActiveContainer
                              chatMessages={chatMessages}
                              chatInput={chatInput}
                              setChatInput={setChatInput}
                              sendMessage={sendMessage}
                              cancelAction={cancelRide}
                            />
                          )}
                          {appMode === 'host' && !rideInProgress && (
                            <Dashboard appMode={appMode} selectedItem={selectedItem} />
                          )}
                        </main>
                      )}

                      {/* Right Panel */}
                      {isRightPanelOpen && (
                        <RightPanel
                          isOpen={isRightPanelOpen}
                          setIsOpen={setIsRightPanelOpen}
                          selectedItem={selectedItem}
                          appMode={appMode}
                          startStripeOnboarding={startStripeOnboarding}
                          createStripeCheckoutSession={createStripeCheckoutSession}
                          captureStripePaymentIntent={captureStripePaymentIntent}
                          cancelStripePaymentIntent={cancelStripePaymentIntent}
                          message={message}
                        />
                      )}
                    </div>
                    <Footer />
                  </StripeProvider>
                </Elements>
              </MapsProvider>
            </ChakraProvider>
          </AuthProvider>
        </FirebaseProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
