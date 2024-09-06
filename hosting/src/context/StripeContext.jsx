import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { updateStripeStatusInDb, createAccountLink, createStripeConnectedAccount_test} from '../api/stripeApi';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc , updateDoc} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // For navigation
import PropTypes from 'prop-types';

// Create a context for Stripe-related data and functions
const StripeContext = createContext();

export const useStripe = () => useContext(StripeContext);

export const StripeProvider = ({ children }) => {
  const { user } = useAuth();
  const [stripeAccountId, setStripeAccountId] = useState(null);
  const [stripeAccountStatus, setStripeAccountStatus] = useState('not_created');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchStripeData = async () => {
      if (user?.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            let accountId = userData.stripeAccountId || null;
            
            // If no Stripe account ID exists, create a new Stripe account
            if (!accountId) {
              const stripeData = await createStripeConnectedAccount_test(user.email); // Create a new Stripe account for the user
              accountId = stripeData.accountId; // Assuming this field is returned by your API
              await updateStripeStatusInDb(user.uid, 'not_completed');
              await updateDoc(userRef, { stripeAccountId: accountId }); // Save the new Stripe account ID in Firestore
            }
  
            setStripeAccountId(accountId);
            setStripeAccountStatus(userData.stripeAccountStatus || 'not_completed');
  
            // Redirect to onboarding if the account status is not completed
            if (userData.stripeAccountStatus === 'not_completed') {
              const accountLink = await createAccountLink(accountId); 
              navigate(`/stripe-onboarding/${accountId}`, { state: { accountLink } });
            }
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
  }, [user, navigate]);
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
    <StripeContext.Provider value={{ stripeAccountId, stripeAccountStatus, setStripeAccountId, updateStripeStatus, loading }}>
      {children}
    </StripeContext.Provider>
  );
};

StripeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
