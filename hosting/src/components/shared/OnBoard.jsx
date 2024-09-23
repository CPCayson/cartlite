// src/components/OnBoard.jsx

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import BusinessOnboardingForm from './BusinessOnboardingForm'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalCloseButton, 
  ModalBody, 
  useDisclosure 
} from '@chakra-ui/react';
import SignupForm from '@components/shared/SignupForm'; // Ensure this path is correct

// Countdown Timer Component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date("2024-09-28T08:00:00-05:00");
      const currentTime = new Date();
      const difference = targetDate - currentTime;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    const timerId = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Initialize immediately
    return () => clearInterval(timerId);
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
const WalkthroughScreen = ({ title, subtitle, description, imageSrc, imageAlt, iconSrc, gradient }) => (
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
    <h3 className="text-xl mb-4 text-white font-poppins">{subtitle}</h3>
    <p className="text-white font-poppins text-lg leading-relaxed">{description}</p>
  </motion.div>
);

// Walkthrough Component
const Walkthrough = ({ onComplete, initialScreen = 0 }) => {
  const [currentScreen, setCurrentScreen] = useState(initialScreen);
  const [isVisible, setIsVisible] = useState(true);

  const screens = [
    {
      title: "For Riders",
      subtitle: "Cruise Bay Saint Louis",
      description: "Hop on a golf cart for a breezy ride to local hotspots, beaches, and events. Experience our town like a local!",
      imageSrc: "/assets/cart1.png", // Update with your image path
      imageAlt: "Golf cart ride",
      gradient: "from-teal-400 via-teal-500 to-teal-600",
      iconSrc: "/assets/cake.png" // Path to your larger custom icon
    },
    {
      title: "For Businesses",
      subtitle: "Deliver Bay Saint Louis Flavors",
      description: "Connect with customers through our golf cart delivery service. Bring your local specialties right to their door!",
      imageSrc: "/assets/shop.png", // Update with your image path
      imageAlt: "Local restaurant",
      gradient: "from-orange-400 via-orange-500 to-orange-600",
      iconSrc: "/assets/shop.png" // Path to your larger custom icon
    },
    {
      title: "For Drivers",
      subtitle: "Share Your Bay Saint Louis",
      description: "Turn your golf cart into an earning opportunity. Show off your town, meet new people, and work on your own schedule.",
      imageSrc: "/assets/marker.png", // Update with your image path
      imageAlt: "Golf cart driver",
      gradient: "from-purple-500 via-purple-600 to-purple-700",
      iconSrc: "/assets/moon.png" // Path to your larger custom icon
    }
  ];

  const nextScreen = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      setIsVisible(false);
      onComplete();
    }
  };

  const prevScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 md:p-8 max-w-md w-full bg-gradient-to-r ${screens[currentScreen].gradient} shadow-2xl`}>
        <div className="flex justify-center mb-4">
          {screens.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentScreen ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
              animate={{ scale: index === currentScreen ? 1.25 : 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <WalkthroughScreen key={currentScreen} {...screens[currentScreen]} />
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={prevScreen}
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
            currentScreen === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
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
            onClick={() => {
              setIsVisible(false);
              onComplete();
            }}
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
    setShowWalkthrough(true);
  }, []);

  // Sections Array
  const sections = [
    {
      title: "For Riders",
      description: "Cruise Bay Saint Louis in style. Grab a golf cart ride to local hotspots and hidden gems.",
      gradient: "from-teal-400 via-teal-500 to-teal-600",
      iconSrc: "/assets/moon.png" // Path to your larger custom icon
    },
    {
      title: "For Businesses",
      description: "Expand your reach. Let our golf carts bring your local flavors directly to customers.",
      gradient: "from-orange-400 via-orange-500 to-orange-600",
      iconSrc: "/assets/shop.png" // Path to your larger custom icon
    },
    {
      title: "For Drivers",
      description: "Share your Bay Saint Louis. Turn your golf cart into a fun, flexible earning opportunity.",
      gradient: "from-purple-500 via-purple-600 to-purple-700",
      iconSrc: "/assets/marker.png" // Path to your larger custom icon
    }
  ];

  // Handle "Learn More" Click
  const handleLearnMore = (index, event) => {
    setWalkthroughScreen(index);
    setShowWalkthrough(true);
    if (index === 1) { // Only trigger confetti for the "For Businesses" section
      const rect = event.currentTarget.getBoundingClientRect();
      setConfettiConfig({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-black via-gray-800 to-black text-gray-900 font-poppins p-4">
      
      {/* Countdown Timer */}
      <div className="rounded-lg p-6 bg-gradient-to-r from-black via-gray-800 to-black shadow-lg mb-8 w-full max-w-md">
        <CountdownTimer />
      </div>
      
      {/* Header */}
      <header className="w-full max-w-6xl text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          {/* Logo */}
          <img src="/assets/logo.png" alt="CartRabbit Logo" className="text-teal-600 mr-4 h-16 w-auto" /> 
        </div>
        <p className="text-2xl text-orange-500 font-semibold">Ride. Dine. Explore.</p> {/* Slightly lighter orange for better contrast */}
        <p className="text-xl text-gray-300 mt-2">Bay Saint Louis' Neighborhood Golf Cart Service</p> {/* Gray-300 for better readability on dark background */}
        
        {/* Buttons */}
        <div className="mt-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
          
          {/* "Become a Host" Button */}
          <button
            onClick={onSignupOpen}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full transition-colors duration-300 font-semibold text-lg"
          >
            Become a Host
          </button>

          {/* Chakra UI Modal for SignupForm */}
          <Modal isOpen={isSignupOpen} onClose={onSignupClose} size="xl" isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Sign Up to Become a Host</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <SignupForm onClose={onSignupClose} isSignup={true} />
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* "Onboard as a Local Business" Button */}
          <button
            onClick={onBusinessOpen}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full transition-colors duration-300 font-semibold text-lg"
          >
            Onboard as a Local Business
          </button>

          {/* Chakra UI Modal for BusinessOnboardingForm */}
          <Modal isOpen={isBusinessOpen} onClose={onBusinessClose} size="xl" isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Onboard Your Business</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <BusinessOnboardingForm onClose={onBusinessClose} />
              </ModalBody>
            </ModalContent>
          </Modal>
        </div>
      </header>

      {/* Main Sections */}
      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            className={`rounded-lg p-6 md:p-8 text-white bg-gradient-to-br ${section.gradient} shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col items-center`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(event) => handleLearnMore(index, event)}
          >
            {/* Icon */}
            <img src={section.iconSrc} alt={`${section.title} Icon`} className="w-20 h-20 mb-4" />
            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{section.title}</h2>
            {/* Description */}
            <p className="text-md md:text-lg mb-4 leading-relaxed">{section.description}</p>
            {/* "Learn More" Button */}
            <button 
              className="mt-auto bg-white text-teal-600 px-4 py-2 rounded-full hover:bg-yellow-300 hover:text-teal-700 transition-colors duration-300 font-semibold text-lg"
            >
              Learn More
            </button>
          </motion.div>
        ))}
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-400">
        <p className="text-lg">Experience the charm of Bay Saint Louis with CartRabbit</p>
      </footer>

      {/* Walkthrough Modal */}
      {showWalkthrough && (
        <Walkthrough 
          onComplete={() => setShowWalkthrough(false)} 
          initialScreen={walkthroughScreen}
        />
      )}

      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          confettiSource={{
            x: confettiConfig.x,
            y: confettiConfig.y,
            w: 0,
            h: 0
          }}
          recycle={false}
          numberOfPieces={200}
        />
      )}
    </div>
  );
};

export default OnBoard;

