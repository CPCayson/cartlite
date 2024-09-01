import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import Header from './components/Header.jsx';
import LeftPanel from './components/LeftPanel.jsx';
import RightPanel from './components/RightPanel.jsx';
import Footer from './components/Footer.jsx';
import SearchBar from './components/SearchBar.jsx';
import Dashboard from './components/Dashboard';
import ActiveContainer from './components/ActiveContainer';
import { FirebaseProvider } from './context/FirebaseContext.jsx';
import { ChakraProvider } from '@chakra-ui/react';
import './App.css';
import { ErrorBoundary } from './context/ErrorBoundary.jsx';
import { MapsProvider } from './context/MapsContext.jsx';
import MapView from './components/MapView';
import { StripeProvider } from './context/StripeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { db } from './firebase/firebaseConfig';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [appMode, setAppMode] = useState('rabbit'); // 'rabbit' or 'host'
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rideInProgress, setRideInProgress] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewType, setViewType] = useState('list');
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [chatMessages, setChatMessages] = useState([]); // State for chat messages
  const [chatInput, setChatInput] = useState(''); // State for chat input

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

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredBusinesses(businesses);
    } else {
      setFilteredBusinesses(businesses.filter((business) => business.category === activeCategory));
    }
  }, [activeCategory, businesses]);

  const handleAccept = (ride) => {
    setSelectedItem(ride);
    setIsLeftPanelOpen(false);
    setIsRightPanelOpen(false);
    setRideInProgress(true);
    // Load chat messages or set initial state for chat
    setChatMessages([
      { sender: 'guest', text: 'Hello! Looking forward to the ride.' },
      { sender: 'host', text: 'Hi! I will be there in 5 minutes.' }
    ]); // Example chat messages
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setIsRightPanelOpen(true);
    setIsLeftPanelOpen(true);
  };

  const handleSettingsClick = () => {
    setIsRightPanelOpen(!isRightPanelOpen);
    setIsLeftPanelOpen(!isRightPanelOpen);
  };

  const handleModeSwitch = () => {
    if (appMode === 'rabbit') {
      setAppMode('host');
      setIsRightPanelOpen(true);
    } else {
      setAppMode('rabbit');
      setIsRightPanelOpen(false);
    }
  };

  const sendMessage = () => {
    if (chatInput.trim()) {
      const newMessage = { sender: 'host', text: chatInput };
      setChatMessages((prevMessages) => [...prevMessages, newMessage]);
      setChatInput(''); // Clear input field
    }
  };

  const cancelRide = () => {
    setRideInProgress(false);
    setSelectedItem(null);
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
      <ErrorBoundary>
        <FirebaseProvider>
          <ChakraProvider>
            <MapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <AuthProvider>
                <Elements stripe={stripePromise}>
                  <StripeProvider>
                    <SearchBar />
                    <Header 
                      darkMode={darkMode}
                      setDarkMode={setDarkMode}
                      appMode={appMode}
                      setAppMode={setAppMode}
                      setIsLeftPanelOpen={setIsLeftPanelOpen}
                      setIsRightPanelOpen={setIsRightPanelOpen}
                    />
                    <div className="flex flex-1 overflow-hidden">
                      <LeftPanel 
                        isOpen={isLeftPanelOpen}
                        setIsOpen={setIsLeftPanelOpen}
                        appMode={appMode}
                        handleAccept={handleAccept}
                        handleSelectItem={handleSelectItem}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        viewType={viewType}
                        setViewType={setViewType}
                        rideInProgress={rideInProgress}
                        handleSettingsClick={handleSettingsClick}
                        businesses={filteredBusinesses}
                      />
                      <main className={`flex-1 flex flex-col relative transition-all duration-300 ${isLeftPanelOpen && isRightPanelOpen ? 'hidden' : ''}`}>
                        {appMode === 'rabbit' && (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <MapView 
                              isLeftPanelOpen={isLeftPanelOpen} 
                              isRightPanelOpen={isRightPanelOpen} 
                              setIsLeftPanelOpen={setIsLeftPanelOpen}
                              businesses={filteredBusinesses}
                            />
                          </div>
                        )}
                        {appMode === 'host' && (
                          <>
                            {rideInProgress ? (
                              <ActiveContainer 
                                chatMessages={chatMessages}
                                chatInput={chatInput}
                                setChatInput={setChatInput}
                                sendMessage={sendMessage}
                                cancelAction={cancelRide}
                              />
                            ) : (
                              <Dashboard />
                            )}
                          </>
                        )}
                      </main>
                      <RightPanel 
                        isOpen={isRightPanelOpen}
                        setIsOpen={setIsRightPanelOpen}
                        selectedItem={selectedItem}
                        appMode={appMode}
                        setAppMode={setAppMode}
                      />
                    </div>
                    <Footer />
                  </StripeProvider>
                </Elements>
              </AuthProvider>
            </MapsProvider>
          </ChakraProvider>
        </FirebaseProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
