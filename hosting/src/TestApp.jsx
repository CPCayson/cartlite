import React, { useState, useEffect } from 'react';
import { ChakraProvider, Button, Input, VStack, Text } from '@chakra-ui/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useFirebase } from './context/FirebaseContext.jsx'; // Using Firebase context
import { useAuth } from './context/AuthContext.jsx'; // Using Auth context
import { useStripe } from './context/StripeContext.jsx'; // Using Stripe context
import axios from 'axios';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; 
import TabbedSettingsForm from './components/Forms/TabbedSettingsForm'; // Import TabbedSettingsForm component
import OnboardingModal from './components/OnboardingModal'; // Import OnboardingModal component

// Load Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const TestApp = () => {
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartData, setCartData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false); // State for onboarding modal

  const { user: currentUser, loading, error } = useAuth(); // Use the authentication context to get the current user
  const db = getFirestore(); // Initialize Firestore

  useEffect(() => {
    console.log('useEffect: Checking current user and payment intent');
    if (currentUser) {
      setEmail(currentUser.email);
      fetchUserData(currentUser.email);
      fetchCartData();
      setShowSettings(true);
    } else {
      setShowSettings(false);
    }

    const storedPaymentIntentId = localStorage.getItem('paymentIntentId');
    if (storedPaymentIntentId) {
      setPaymentIntentId(storedPaymentIntentId);
      handleCapturePaymentIntent(storedPaymentIntentId);
      localStorage.removeItem('paymentIntentId'); // Clear it after processing
    }
  }, [currentUser]);

  const fetchUserData = async (email) => {
    console.log(`Fetching data for user: ${email}`);
    setMessage('Loading user data...');
    try {
      const userRef = doc(db, 'users', email);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        console.log('User data found:', userDoc.data());
        setUserData(userDoc.data());
        setUserExists(true);
        setMessage('User data loaded.');
        if (!userDoc.data().stripeAccountId || userDoc.data().stripeAccountStatus !== 'complete') {
          setIsOnboardingOpen(true); // Open the onboarding modal
        }
      } else {
        console.log('User does not exist in the database.');
        setUserExists(false);
        setMessage('User does not exist in the database.');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setMessage(`Error loading user data: ${error.message}`);
    }
  };

  const fetchCartData = async () => {
    setMessage('Loading cart data...');
    try {
      const cartRef = doc(db, 'carts', 'cart10'); // Example cart ID, replace with dynamic ID as needed
      const cartDoc = await getDoc(cartRef);

      if (cartDoc.exists()) {
        setCartData(cartDoc.data());
        setMessage('Cart data loaded.');
      } else {
        setMessage('Cart data does not exist in the database.');
      }
    } catch (error) {
      console.error('Error loading cart data:', error);
      setMessage(`Error loading cart data: ${error.message}`);
    }
  };

  const handleSaveUserData = async (data) => {
    try {
      const userRef = doc(db, 'users', email);
      if (userExists) {
        await updateDoc(userRef, data);
        setMessage('User data updated successfully.');
      } else {
        await setDoc(userRef, data);
        setMessage('New user created successfully.');
        setUserExists(true);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      setMessage(`Error saving user data: ${error.message}`);
    }
  };

  const handleSaveCartData = async (data) => {
    try {
      const cartRef = doc(db, 'carts', 'cart10'); // Example cart ID, replace with dynamic ID as needed
      await updateDoc(cartRef, data);
      setMessage('Cart data updated successfully.');
    } catch (error) {
      console.error('Error saving cart data:', error);
      setMessage(`Error saving cart data: ${error.message}`);
    }
  };

    try {
      const response = await axios.post('/api/cancel-payment-intent', {
        paymentIntentId,
        customerEmail: email,
      });
      setMessage(`Payment Intent canceled: ${response.data.id}`);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || 'Failed to cancel payment intent'}`);
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <ChakraProvider>
        <VStack spacing={4} p={5}>
          <Text fontSize="xl">Test Server Endpoints</Text>
          <Input
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handleCreateStripeOnboarding}>
            Check or Create User in Firebase
          </Button>
          <Input
            placeholder="Amount (USD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            placeholder="Payment Intent ID"
            value={paymentIntentId}
            onChange={(e) => setPaymentIntentId(e.target.value)}
          />
          <Button onClick={handleCreateCheckoutSession}>
            Create Checkout Session
          </Button>
          <Button onClick={() => handleCapturePaymentIntent(paymentIntentId)} isDisabled={!paymentIntentId}>
            Capture Payment Intent
          </Button>
          <Button onClick={handleCancelPaymentIntent} isDisabled={!paymentIntentId}>
            Cancel Payment Intent
          </Button>

          {showSettings && (
            <TabbedSettingsForm
              userData={userData}
              cartData={cartData}
              onSaveUserData={handleSaveUserData}
              onSaveCartData={handleSaveCartData}
            />
          )}

          {/* Display Messages */}
          <Text color="red.500">{message}</Text>

          {/* Onboarding Modal */}
          <OnboardingModal
            isOpen={isOnboardingOpen}
            onClose={() => setIsOnboardingOpen(false)}
            user={userData}
          />
        </VStack>
      </ChakraProvider>
    </Elements>
  );
};

export default TestApp;
