// StripeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { updateStripeStatusInDb, createAccountLink } from '../api/stripeApi';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

// Create a context for Stripe-related data and functions
const StripeContext = createContext();

export const useStripe = () => useContext(StripeContext);

export const StripeProvider = ({ children }) => {
  const { user } = useAuth();
  const [stripeAccountId, setStripeAccountId] = useState(null);
  const [stripeAccountStatus, setStripeAccountStatus] = useState('not_created');

  useEffect(() => {
    const fetchStripeData = async () => {
      if (user?.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setStripeAccountId(userData.stripeAccountId || null);
            setStripeAccountStatus(userData.stripeAccountStatus || 'not_created');
          } else {
            console.error('No user document found');
            toast.error('No user document found. Please complete the profile first.');
          }
        } catch (error) {
          console.error('Error fetching Stripe data:', error);
          toast.error('Failed to load Stripe data.');
        }
      }
    };

    fetchStripeData();
  }, [user]);

  const updateStripeStatus = async (status) => {
    if (user?.uid) {
      try {
        await updateStripeStatusInDb(user.uid, status);
        setStripeAccountStatus(status);
        toast.success('Stripe status updated successfully.');
      } catch (error) {
        console.error('Error updating Stripe status:', error);
        toast.error('Failed to update Stripe status.');
      }
    }
  };

  return (
    <StripeContext.Provider value={{ stripeAccountId, stripeAccountStatus, setStripeAccountId, updateStripeStatus }}>
      {children}
    </StripeContext.Provider>
  );
};

StripeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
