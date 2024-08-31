import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Import the useAuth hook from AuthContext
import { db } from '../firebase/firebaseConfig'; // Import Firestore from Firebase config
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify'; // Import react-toastify for notifications
import PropTypes from 'prop-types';

// Create a Context for Stripe
const StripeContext = createContext();

// Custom hook to use the Stripe context
export const useStripe = () => useContext(StripeContext);

// StripeProvider component to provide Stripe-related state and functions
export const StripeProvider = ({ children }) => {
  const { user } = useAuth(); // Correctly use destructured user from useAuth
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
            toast.error('No user document found');
          }
        } catch (error) {
          console.error('Error fetching Stripe data:', error);
          toast.error('Failed to load Stripe data.');
        }
      }
    };

    fetchStripeData();
  }, [user]); // Run this effect whenever user changes

  const updateStripeStatus = async (status) => {
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          stripeAccountStatus: status,
        });
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
