import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { useStripe } from '@stripe/react-stripe-js'; 
import { getAuth, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Custom hook for handling authorization and onboarding logic
const useAuthorization = () => {
  const { user, loading: authLoading, login, register, logout, error: authError } = useAuth();
  const stripe = useStripe();

  const auth = getAuth();
  const firestore = getFirestore();

  const [formError, setFormError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [authMethod, setAuthMethod] = useState('email');
  const [redirecting, setRedirecting] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);  // New state to check if recaptcha is loaded

  useEffect(() => {
    if (authError) {
      console.error('Authentication Error:', authError);
      setFormError(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (!recaptchaLoaded && authMethod === 'phone') {
      setupRecaptcha();
      setRecaptchaLoaded(true);  // Only load Recaptcha once
    }
  }, [authMethod]);

  const handleToggleForm = () => {
    setIsOnboarding((prev) => !prev);
  };

  const handleAuthAction = async () => {
    setFormError('');
    try {
      if (authMethod === 'email') {
        if (isOnboarding) {
          await register(email, password, { stripeAccountStatus: 'not_created' });
        } else {
          await login(email, password);
        }
      } else if (authMethod === 'phone') {
        await phoneLogin();
      }
      // Handle Google, Apple, Facebook here if needed
    } catch (error) {
      console.error('Authentication or Registration Error:', error);
      setFormError(error.message);
    }
  };

  const phoneLogin = async () => {
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      // Handle the confirmation of the code here (add a UI prompt for the code)
    } catch (error) {
      console.error('Error during phone authentication:', error);
      setFormError(error.message);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          console.log('Recaptcha resolved');
        },
        'expired-callback': () => {
          console.warn('Recaptcha expired');
        }
      }, auth);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
      setFormError('Failed to log out. Please try again.');
    }
  };

  const redirectToStripeOnboarding = async (user) => {
    setRedirecting(true);
    try {
      const response = await fetch('/__/functions/createStripeAccountLink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setFormError('Error during onboarding process.');
      }
    } catch (error) {
      console.error('Error redirecting to Stripe onboarding:', error);
      setFormError('Failed to start Stripe onboarding. Please try again.');
    } finally {
      setRedirecting(false);
    }
  };

  return {
    user,
    authLoading,
    formError,
    email,
    password,
    phoneNumber,
    isOnboarding,
    authMethod,
    handleToggleForm,
    handleAuthAction,
    handleLogout,
    setEmail,
    setPassword,
    setPhoneNumber,
    setAuthMethod,
    redirecting,
    redirectToStripeOnboarding,
  };
};

export default useAuthorization;
