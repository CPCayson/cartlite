import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";
import { ChakraProvider } from "@chakra-ui/react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Context Providers
import { FirebaseProvider } from "./context/FirebaseContext.jsx";
import { ErrorBoundary } from "./context/ErrorBoundary.jsx";
import { MapsProvider } from "./context/MapsContext.jsx";
import { StripeProvider } from "./context/StripeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// Components
import Header from "./components/Header.jsx";
import LeftPanel from "./components/LeftPanel.jsx";
import RightPanel from "./components/RightPanel.jsx";
import Footer from "./components/Footer.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ActiveContainer from "./components/ActiveContainer.jsx";
import MapComponent from "./components/MapComponent.jsx";
import SignupForm from './components/Forms/SignupForm';
import StripeOnboarding from './components/Forms/StripeOnboarding';
import TermsAndConditions from './components/Forms/TermsAndConditions';
import PostSignup from './components/Forms/PostSignup';

// Firebase Config and API functions
import {
  handleCreateStripeOnboarding,
  handleCreateCheckoutSession,
  handleCapturePaymentIntent,
  handleCancelPaymentIntent,
} from "./api/stripeApi";

// Stripe Configuration
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [appMode, setAppMode] = useState("rabbit");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [fullscreenPanel, setFullscreenPanel] = useState(null); // Keeps track of which panel is fullscreen
  const [selectedItem, setSelectedItem] = useState(null);
  const [rideInProgress, setRideInProgress] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all food");
  const [viewType, setViewType] = useState("list");
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [cachedBusinesses, setCachedBusinesses] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [userEmail] = useState("test@example.com");
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [searchDestination, setSearchDestination] = useState(null);
  const [searchPickupLocation, setSearchPickupLocation] = useState(null);

  const toggleFullscreen = (panel) => {
    setFullscreenPanel(prev => (prev === panel ? null : panel));
  };

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'places'));
        const businessesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBusinesses(businessesData);
        setFilteredBusinesses(businessesData);
        setError('');
      } catch (error) {
        console.error('Error fetching businesses from Firebase:', error);
        setError('Failed to load businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (cachedBusinesses[activeCategory]) {
      setFilteredBusinesses(cachedBusinesses[activeCategory]);
    } else if (activeCategory === 'all food') {
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

  return (
    <Router>
      <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''} overflow-auto`}>
        <ErrorBoundary>
          <FirebaseProvider>
            <AuthProvider>
              <ChakraProvider>
                <MapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                  <Elements stripe={stripePromise}>
                    <StripeProvider>
                      <Header
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        appMode={appMode}
                        setAppMode={setAppMode}
                        setIsLeftPanelOpen={() => {}}
                        setIsRightPanelOpen={setIsRightPanelOpen}
                      />

                      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                        {fullscreenPanel === "leftPanel" ? (
                          <LeftPanel
                            isOpen={true}
                            setIsOpen={() => {}}
                            appMode={appMode}
                            handleAccept={() => {}}
                            activeCategory={activeCategory}
                            setActiveCategory={setActiveCategory}
                            rideInProgress={rideInProgress}
                            businesses={filteredBusinesses}
                            toggleFullscreen={() => toggleFullscreen("leftPanel")}
                            fullscreen
                          />
                        ) : fullscreenPanel === "dashboard" ? (
                          <main className="flex-1 flex flex-col p-2 sm:p-4">
                            <Dashboard
                              appMode={appMode}
                              selectedItem={selectedItem}
                              onSearchDestinationSelect={setSearchDestination}
                              onSearchPickupSelect={setSearchPickupLocation}
                              createStripeCheckoutSession={() => {}}
                              toggleFullscreen={() => toggleFullscreen("dashboard")}
                              fullscreen
                            />
                          </main>
                        ) : (
                          <>
                            <LeftPanel
                              isOpen={true}
                              setIsOpen={() => {}}
                              appMode={appMode}
                              handleAccept={() => {}}
                              activeCategory={activeCategory}
                              setActiveCategory={setActiveCategory}
                              rideInProgress={rideInProgress}
                              businesses={filteredBusinesses}
                              toggleFullscreen={() => toggleFullscreen("leftPanel")}
                            />
                            <main className="flex-1 flex flex-col p-2 sm:p-4">
                              <Dashboard
                                appMode={appMode}
                                selectedItem={selectedItem}
                                onSearchDestinationSelect={setSearchDestination}
                                onSearchPickupSelect={setSearchPickupLocation}
                                createStripeCheckoutSession={() => {}}
                                toggleFullscreen={() => toggleFullscreen("dashboard")}
                              />
                              <MapComponent
                                businesses={filteredBusinesses}
                                selectedPlace={selectedItem}
                                searchDestination={searchDestination}
                                searchPickupLocation={searchPickupLocation}
                              />
                            </main>
                          </>
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
    </Router>
  );
};

export default App;