// src/components/SearchBar.jsx
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { RefreshCw, Search } from 'lucide-react';
import {
  Input,
  Button,
  Box,
  Flex,
  Select,
  NumberInput,
  NumberInputField,
  Text,
} from '@chakra-ui/react';
import { loadGoogleMapsScript } from '@api/googleMapsApi';
import { useBookingCalculation } from '@hooks/useBookingCalculation';
import { GeolocationContext } from '@context/GeolocationContext';
import { useAuth } from '@context/AuthContext';
import './styles.css'; // Import the CSS file

const SearchBar = ({
  onDestinationSelect,
  onPickupSelect,
  onBookRide,
  initialLatLng,
  selectedItem,
  selectedRide,
  autoPopulateDestination, // New prop for auto-populating destination
}) => {
  const { user } = useAuth();
  const { geolocation, updateGeolocation } = useContext(GeolocationContext);
  const [destination, setDestination] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(initialLatLng || geolocation);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDestinationSelected, setIsDestinationSelected] = useState(false);
  const destinationInputRef = useRef(null);
  const pickupInputRef = useRef(null);
  const [isEditingPickup, setIsEditingPickup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferredPickupTime, setPreferredPickupTime] = useState('ASAP');
  const [numberOfPassengers, setNumberOfPassengers] = useState(1);
  const isFormValid = pickupLocation && destination;
  const { bookingAmount, updateBookingAmount } = useBookingCalculation();

  // Handle auto-populating destination from external triggers
  useEffect(() => {
    if (autoPopulateDestination) {
      setDestination(autoPopulateDestination.address);
      setDestinationCoords(autoPopulateDestination.coords);
      onDestinationSelect(autoPopulateDestination.address, autoPopulateDestination.coords);
      setIsDestinationSelected(true);
    }
  }, [autoPopulateDestination, onDestinationSelect]);

  // Geocoding logic for reverse geocoding
  const reverseGeocode = useCallback(
    (latLng) => {
      if (!window.google || !window.google.maps) {
        console.error('Google Maps API not loaded');
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            setPickupLocation(results[0].formatted_address);
            onPickupSelect(results[0].formatted_address, {
              latitude: latLng.lat,
              longitude: latLng.lng,
            });
          } else {
            console.error('No results found');
          }
        } else {
          console.error('Geocoder failed due to: ' + status);
        }
      });
    },
    [onPickupSelect]
  );

  // Initialize the Google Maps autocomplete functionality
  const initAutocomplete = useCallback(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps API not loaded');
      return;
    }

    const options = {
      bounds: new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(30.2817, -89.4178),
        new window.google.maps.LatLng(30.3617, -89.2978)
      ),
      strictBounds: true,
      types: ['geocode'],
    };

    ['destination', 'pickup'].forEach((fieldType) => {
      const autocomplete = new window.google.maps.places.Autocomplete(
        fieldType === 'destination' ? destinationInputRef.current : pickupInputRef.current,
        options
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const coords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          if (fieldType === 'destination') {
            setDestination(place.formatted_address);
            setDestinationCoords(coords);
            onDestinationSelect(place.formatted_address, coords);
            setIsDestinationSelected(true);
          } else {
            setPickupLocation(place.formatted_address);
            setPickupCoords(coords);
            onPickupSelect(place.formatted_address, coords);

            if (isEditingPickup && isLoaded) {
              updateGeolocation(coords);
              setIsEditingPickup(false);
            }
          }
        }
      });
    });
  }, [isEditingPickup, isLoaded, onDestinationSelect, onPickupSelect, updateGeolocation]);

  // Load Google Maps script
  useEffect(() => {
    loadGoogleMapsScript(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
      .then(() => {
        setIsLoaded(true);
      })
      .catch((error) => {
        console.error('Error loading Google Maps script:', error);
      });
  }, []);

  // Initialize autocomplete and reverse geocode if needed
  useEffect(() => {
    if (isLoaded) {
      initAutocomplete();
      if (pickupCoords) {
        reverseGeocode(pickupCoords);
      }
    }
  }, [isLoaded, pickupCoords, initAutocomplete, reverseGeocode]);

  // Update pickup coordinates based on geolocation
  useEffect(() => {
    if (geolocation && isLoaded) {
      setPickupCoords(geolocation);
      reverseGeocode(geolocation);
    }
  }, [geolocation, isLoaded, reverseGeocode]);

  // Update booking amount based on pickup and destination coordinates
  useEffect(() => {
    if (pickupCoords && destinationCoords) {
      updateBookingAmount(pickupCoords, destinationCoords);
    }
  }, [pickupCoords, destinationCoords, updateBookingAmount]);

  /**
   * Handles the booking of a ride.
   */
  const handleBookNow = () => {
    if (!destination || !pickupLocation) {
      alert('Please select both a destination and a pickup location before proceeding.');
      return;
    }

    onBookRide({
      destination,
      pickupLocation,
      bookingAmount,
      preferredPickupTime,
      numberOfPassengers,
    });
  };

  /**
   * Generates time options incrementing by 5 minutes up to 45 minutes.
   */
  const generateTimeOptions = () => {
    const options = [{ label: 'ASAP', value: 'ASAP' }];
    for (let i = 5; i <= 45; i += 5) {
      options.push({ label: `${i} minutes`, value: `${i} minutes` });
    }
    return options;
  };

  return (
    <Box
      p={4}
      bgGradient="linear(to-r, purple.500, pink.500)"
      rounded="lg"
      w="full"
      h="auto"
      position="sticky"
      top={0}
    >
      <Flex direction="column" gap={4} w="full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleBookNow();
          }}
        >
          {/* Destination Input */}
          <Flex align="center" w="full">
            <Input
              type="text"
              ref={destinationInputRef}
              placeholder="Enter destination..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full white-placeholder" // Apply the CSS class here
              bgGradient="linear(to-r, purple.500, pink.500)"
              color="white"
              fontWeight="bold"
              fontFamily="Poppins, sans-serif"
            />
            <Button
              variant="ghost"
              onClick={() => destinationInputRef.current.focus()}
              aria-label="Search Destination"
            >
              <Search size={20} color="white" />
            </Button>
          </Flex>

          {/* Pickup Input (Visible after destination is selected) */}
          {isDestinationSelected && (
            <Flex align="center" w="full" mt={2}>
              <Input
                type="text"
                ref={pickupInputRef}
                placeholder="Pickup location..."
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full white-placeholder" // Apply the CSS class here
                isReadOnly={!isEditingPickup}
                bgGradient="linear(to-r, purple.500, pink.500)"
                color="white"
                fontWeight="bold"
                fontFamily="Poppins, sans-serif"
              />
              <Button onClick={() => setIsEditingPickup(!isEditingPickup)} ml={2}>
                {isEditingPickup ? 'Save' : 'Edit'}
              </Button>
            </Flex>
          )}

          {/* Preferred Pickup Time and Number of Passengers */}
          {isDestinationSelected && (
            <Flex direction={{ base: 'column', md: 'row' }} gap={4} mt={2}>
              {/* Preferred Pickup Time */}
              <Select
                placeholder="Preferred Pickup Time"
                value={preferredPickupTime}
                onChange={(e) => setPreferredPickupTime(e.target.value)}
                bgGradient="linear(to-r, purple.500, pink.500)"
                color="white"
                fontWeight="bold"
                fontFamily="Poppins, sans-serif"
              >
                {generateTimeOptions().map((option) => (
                  <option key={option.value} value={option.value} style={{ color: 'black' }}>
                    {option.label}
                  </option>
                ))}
              </Select>

              {/* Number of Passengers */}
              <NumberInput
                min={1}
                max={10}
                value={numberOfPassengers}
                onChange={(valueString) => setNumberOfPassengers(parseInt(valueString))}
              >
                <NumberInputField
                  placeholder="Passengers"
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  color="white"
                  fontWeight="bold"
                  fontFamily="Poppins, sans-serif"
                />
              </NumberInput>
            </Flex>
          )}

          {/* Book and Checkout Button */}
          {isDestinationSelected && (
            <Button
              type="submit"
              colorScheme="blue"
              mt={4}
              w="full"
              isLoading={isLoading}
              isDisabled={!isFormValid || isLoading}
              leftIcon={<RefreshCw size={20} />}
            >
              {isLoading
                ? 'Processing...'
                : `Book and                import React, { useState, useEffect } from 'react';
                import { useNavigate } from 'react-router-dom';
                import { useDisclosure } from '@chakra-ui/react';
                import { useAppState } from '@context/AppStateContext'; // Import the AppStateContext
                
                // Countdown Timer Component
                const CountdownTimer = () => {
                  const [timeLeft, setTimeLeft] = useState({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                  });
                
                  useEffect(() => {
                    // Countdown logic here
                  }, []);
                
                  return (
                    <div className="flex justify-center space-x-4">
                      {Object.entries(timeLeft).map(([unit, value]) => (
                        <div key={unit} className="text-center">
                          <div className="bg-white text-teal-600 rounded-lg p-4 shadow-lg">
                            <span className="text-4xl font-bold">{value.toString().padStart(2, '0')}</span>
                          </div>
                          <span className="text-sm uppercase mt-2">{unit}</span>
                        </div>
                      ))}
                    </div>
                  );
                };
                
                // Walkthrough Screen Component
                const WalkthroughScreen = ({ title, subtitle, description, imageSrc, imageAlt, iconSrc, gradient, isPanelExpanded }) => (
                  <motion.div
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-full h-48 mb-6 overflow-hidden rounded-lg shadow-lg">
                      <img src={imageSrc} alt={imageAlt} className="w-full h-full object-contain" />
                    </div>
                    <img src={iconSrc} alt={`${title} Icon`} className="w-20 h-20 mb-4" />
                    <h2 className="text-3xl font-bold mb-2 text-white font-poppins">{title}</h2>
                    {!isPanelExpanded && (
                      <>
                        <h3 className="text-xl mb-4 text-white font-poppins">{subtitle}</h3>
                        <p className="text-white font-poppins text-lg leading-relaxed">{description}</p>
                      </>
                    )}
                  </motion.div>
                );
                
                // Walkthrough Component
                const Walkthrough = ({ onComplete, initialScreen = 0, isPanelExpanded }) => {
                  const [currentScreen, setCurrentScreen] = useState(initialScreen);
                  const [isVisible, setIsVisible] = useState(true);
                
                  const screens = [
                    {
                      title: "For Riders",
                      subtitle: "Cruise Bay Saint Louis",
                      description: "Hop on a golf cart for a breezy ride to local hotspots, beaches, and events. Experience our town like a local!",
                      imageSrc: "/assets/cart1.png",
                      imageAlt: "Golf cart ride",
                      gradient: "from-teal-400 via-teal-500 to-teal-600",
                      iconSrc: "/assets/cake.png"
                    },
                    {
                      title: "For Businesses",
                      subtitle: "Deliver Bay Saint Louis Flavors",
                      description: "Connect with customers through our golf cart delivery service. Bring your local specialties right to their door!",
                      imageSrc: "/assets/shop.png",
                      imageAlt: "Local restaurant",
                      gradient: "from-orange-400 via-orange-500 to-orange-600",
                      iconSrc: "/assets/shop.png"
                    },
                    {
                      title: "For Drivers",
                      subtitle: "Share Your Bay Saint Louis",
                      description: "Turn your golf cart into an earning opportunity. Show off your town, meet new people, and work on your own schedule.",
                      imageSrc: "/assets/marker.png",
                      imageAlt: "Golf cart driver",
                      gradient: "from-purple-500 via-purple-600 to-purple-700",
                      iconSrc: "/assets/moon.png"
                    }
                  ];
                
                  const nextScreen = () => {
                    setCurrentScreen((prev) => (prev + 1) % screens.length);
                  };
                
                  const prevScreen = () => {
                    setCurrentScreen((prev) => (prev - 1 + screens.length) % screens.length);
                  };
                
                  if (!isVisible) return null;
                
                  return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className={`rounded-lg p-6 md:p-8 max-w-md w-full bg-gradient-to-r ${screens[currentScreen].gradient} shadow-2xl`}>
                        <div className="flex justify-center mb-4">
                          {screens.map((_, index) => (
                            <motion.div
                              key={index}
                              className={`w-2 h-2 rounded-full mx-1 ${index === currentScreen ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                              animate={{ scale: index === currentScreen ? 1.25 : 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          ))}
                        </div>
                
                        <AnimatePresence mode="wait">
                          <WalkthroughScreen key={currentScreen} {...screens[currentScreen]} isPanelExpanded={isPanelExpanded} />
                        </AnimatePresence>
                
                        <button
                          onClick={prevScreen}
                          className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${currentScreen === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                          disabled={currentScreen === 0}
                        >
                          <img src="/assets/chevron-left.png" alt="Previous" className="w-8 h-8 text-white" />
                        </button>
                
                        <button
                          onClick={nextScreen}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2"
                        >
                          <img src="/assets/chevron-right.png" alt="Next" className="w-8 h-8 text-white" />
                        </button>
                
                        <div className="mt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                          <button
                            onClick={() => setIsVisible(false)}
                            className="text-white opacity-90 hover:opacity-100 font-poppins text-lg"
                          >
                            Skip
                          </button>
                          <button
                            onClick={nextScreen}
                            className="bg-white text-teal-600 px-6 py-2 rounded-full hover:bg-yellow-300 hover:text-teal-700 font-poppins text-lg font-semibold"
                          >
                            {currentScreen === screens.length - 1 ? 'Get Started' : 'Next'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                };
                
                // Main OnBoard Component
                const OnBoard = () => {
                  const { isPanelExpanded } = useAppState(); // Get the isPanelExpanded state
                  const [showWalkthrough, setShowWalkthrough] = useState(true);
                  const [walkthroughScreen, setWalkthroughScreen] = useState(0);
                  const [showConfetti, setShowConfetti] = useState(false);
                  const [confettiConfig, setConfettiConfig] = useState({ x: 0, y: 0 });
                  const navigate = useNavigate(); // Initialize useNavigate
                
                  // Initialize useDisclosure for both modals
                  const {
                    isOpen: isSignupOpen,
                    onOpen: onSignupOpen,
                    onClose: onSignupClose
                  } = useDisclosure();
                
                  const {
                    isOpen: isBusinessOpen,
                    onOpen: onBusinessOpen,
                    onClose: onBusinessClose
                  } = useDisclosure();
                
                  useEffect(() => {
                    // Any necessary effect logic here
                  }, []);
                
                  // Sections Array
                  const sections = [
                    {
                      title: "For Riders",
                      description: "Cruise Bay Saint Louis in style. Grab a golf cart ride to local hotspots and hidden gems.",
                      gradient: "from-teal-400 via-teal-500 to-teal-600",
                      iconSrc: "/assets/moon.png"
                    },
                    {
                      title: "For Businesses",
                      description: "Expand your reach. Let our golf carts bring your local flavors directly to customers.",
                      gradient: "from-orange-400 via-orange-500 to-orange-600",
                      iconSrc: "/assets/shop.png"
                    },
                    {
                      title: "For Drivers",
                      description: "Share your Bay Saint Louis. Turn your golf cart into a fun, flexible earning opportunity.",
                      gradient: "from-purple-500 via-purple-600 to-purple-700",
                      iconSrc: "/assets/marker.png"
                    }
                  ];
                
                  // Handle "Learn More" Click
                  const handleLearnMore = (index, event) => {
                    // Handle learn more logic here
                  };
                
                  return (
                    <div>
                      {showWalkthrough && (
                        <Walkthrough
                          onComplete={() => setShowWalkthrough(false)}
                          initialScreen={walkthroughScreen}
                          isPanelExpanded={isPanelExpanded}
                        />
                      )}
                      {!isPanelExpanded && <CountdownTimer />}
                    </div>
                  );
                };
                
                export default OnBoard;                import React, { useContext, useCallback, useState } from 'react';
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
                  const { isRightPanelOpen, appMode, isLeftPanelOpen, isPanelExpanded } = useAppState(); // Use the state from AppStateContext
                
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
                                    {isPanelExpanded ? (
                                      <p>Less content to prevent overflow...</p>
                                    ) : (
                                      <ContentView
                                        viewType={viewType}
                                        activeSort={activeSort}
                                        setActiveSort={setActiveSort}
                                      />
                                    )}
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
                
                export default SimplifiedApp; Checkout (${bookingAmount ? `$${bookingAmount.toFixed(2)}` : '...'} )`}
            </Button>
          )}
        </form>
      </Flex>
    </Box>
  );
};

SearchBar.propTypes = {
  onDestinationSelect: PropTypes.func.isRequired,
  onPickupSelect: PropTypes.func.isRequired,
  onBookRide: PropTypes.func.isRequired,
  initialLatLng: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  selectedItem: PropTypes.object,
  selectedRide: PropTypes.object,
  autoPopulateDestination: PropTypes.shape({
    address: PropTypes.string,
    coords: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
  }), // New prop for auto-populating destination
};

export default SearchBar;