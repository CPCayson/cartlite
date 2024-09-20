import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../hooks/firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createStripeConnectedAccount } from '../api/stripeApi';
import { toast } from 'react-toastify';

const StripeContext = createContext();

export const useStripe = () => useContext(StripeContext);

export const StripeProvider = ({ children }) => {
  const { user } = useAuth();
  const [stripeAccountStatus, setStripeAccountStatus] = useState('not_created');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStripeData = async () => {
      if (user?.email) {
        try {
          setLoading(true);
          const userRef = doc(db, 'users', user.email);
          let userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            // If the user document doesn't exist, create it
            await setDoc(userRef, {
              email: user.email,
              stripeAccountStatus: 'not_created',
            });
            userDoc = await getDoc(userRef);
          }

          const userData = userDoc.data();
          setStripeAccountStatus(userData.stripeAccountStatus || 'not_created');

          if (userData.stripeAccountStatus !== 'active') {
            // Only proceed with Stripe account creation if not already active
            try {
              const stripeData = await createStripeConnectedAccount(user.email);
              // Update the user document with the new Stripe account ID
              await setDoc(userRef, { stripeAccountId: stripeData.stripeAccountId }, { merge: true });
              setStripeAccountStatus('pending');
            } catch (stripeError) {
              console.error('Error creating Stripe account:', stripeError);
              toast.error('Failed to create Stripe account. Please try again later.');
            }
          }
        } catch (error) {
          console.error('Error fetching Stripe data:', error);
          toast.error('Failed to load user data.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchStripeData();
  }, [user]);

  const beginStripeOnboarding = async () => {
    if (user?.email) {
      try {
        const stripeData = await createStripeConnectedAccount(user.email);
        window.location.href = stripeData.onboardingUrl;
      } catch (error) {
        console.error('Error starting Stripe onboarding:', error);
        toast.error('Failed to start Stripe onboarding. Please try again.');
      }
    } else {
      toast.error('User information is missing. Please ensure youre logged in.');
    }
  };

  return (
    <StripeContext.Provider value={{ stripeAccountStatus, loading, beginStripeOnboarding }}>
      {children}
    </StripeContext.Provider>
  );
};

import PropTypes from 'prop-types';

StripeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

