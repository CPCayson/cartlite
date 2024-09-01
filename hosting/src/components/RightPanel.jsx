import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Ensure this import is correct
import { Button, Input, FormControl, FormLabel, Spinner, Box } from '@chakra-ui/react'; // Using Chakra UI components for consistency
import { useStripe } from '../hooks/useStripe'; // Custom Stripe hook
import TabbedSettingsForm from './TabbedSettingsForm'; // Import the TabbedSettingsForm component

const RightPanel = ({ isOpen, setIsOpen, selectedItem, appMode, setAppMode }) => {
  const { user, loading: authLoading, login, register, logout, error: authError } = useAuth(); // Use custom auth hook
  const [isOnboarding, setIsOnboarding] = useState(false); // Toggle between sign-in and onboarding forms
  const [email, setEmail] = useState(''); // Email state
  const [password, setPassword] = useState(''); // Password state
  const [formError, setFormError] = useState(''); // Local error handling state

  // Custom Stripe hook to manage onboarding and status checks
  const { stripeAccountStatus, loading: stripeLoading, error: stripeError } = useStripe(user);

  useEffect(() => {
    if (authError) setFormError(authError);
  }, [authError]);

  useEffect(() => {
    if (stripeError) setFormError(stripeError);
  }, [stripeError]);

  const handleToggleForm = () => {
    setIsOnboarding((prev) => !prev); // Toggle form state
  };

  const handleAuthAction = async () => {
    setFormError(''); // Reset any previous errors
    try {
      if (isOnboarding) {
        await register(email, password, { stripeAccountStatus: 'not_created' }); // Register with initial Stripe status
      } else {
        await login(email, password); // Log in existing user
      }
    } catch (error) {
      setFormError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout(); // Call logout function from AuthContext
      setAppMode('rabbit'); // Switch to rabbit mode upon logout
      setIsOpen(false); // Close the right panel
    } catch (error) {
      console.error('Error logging out:', error);
      setFormError('Failed to log out. Please try again.');
    }
  };

  if (authLoading || stripeLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${isOpen ? 'w-1/2' : 'w-0'} overflow-hidden`}>
      {isOpen && !selectedItem && !user && (
        <Box
          fontFamily="Arial, sans-serif"
          maxW="350px"
          mx="auto"
          p="20px"
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          borderRadius="8px"
          bg="white"
        >
          <h2 style={{ marginTop: 0 }}>{isOnboarding ? "Complete Your Profile" : "Sign In"}</h2>
          <p style={{ color: '#666' }}>
            {isOnboarding ? "Tell us more about yourself" : "Choose a sign-in method"}
          </p>

          <FormControl mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </FormControl>

          {formError && <p style={{ color: 'red' }}>{formError}</p>}

          <Button colorScheme="teal" width="full" onClick={handleAuthAction}>
            {isOnboarding ? 'Sign Up' : 'Sign In'}
          </Button>

          <Button variant="link" colorScheme="blue" onClick={handleToggleForm} mt={2}>
            {isOnboarding ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </Button>
        </Box>
      )}

      {isOpen && appMode === 'host' && user && (
        <div className="p-4">
          <button onClick={() => setIsOpen(false)} className="mb-4 flex items-center text-blue-500">
            <ArrowLeft className="mr-2" /> Back to List
          </button>

          {/* Integrate TabbedSettingsForm for driver settings */}
          <TabbedSettingsForm />

          {/* Logout button to switch back to rabbit mode and log out */}
          <Button colorScheme="red" width="full" onClick={handleLogout} mt={4}>
            Logout
          </Button>
        </div>
      )}

      {isOpen && selectedItem && (
        <div className="p-4">
          <button onClick={() => setIsOpen(false)} className="mb-4 flex items-center text-blue-500">
            <ArrowLeft className="mr-2" /> Back to List
          </button>
          <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{selectedItem.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">{selectedItem.type}</p>
            {appMode === 'host' && <p className="text-blue-500 mb-2">ETA: {selectedItem.eta}</p>}
            <div className="flex mb-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < selectedItem.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
            </div>
            {appMode === 'host' && (
              <Button colorScheme="teal" width="full">
                Book Ride
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

RightPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  selectedItem: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    eta: PropTypes.string,
    rating: PropTypes.number,
  }),
  appMode: PropTypes.oneOf(['rabbit', 'host']).isRequired,
  setAppMode: PropTypes.func.isRequired, // Ensure this is passed to handle mode switch
};

export default RightPanel;
