// useUserData.js

import { useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Adjust import path
import { STRIPE_STATUS } from './constants'; // Adjust import path
import { useStripeIntegration } from './useStripeIntegration'; // Adjust import path

export const useUserData = () => {
  const { checkStripeAccountStatus } = useStripeIntegration();

  const updateUserData = useCallback(
    async (currentUser) => {
      console.log('Updating user data for:', currentUser.uid);
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.log('User document does not exist, creating one');
        await setDoc(userDocRef, {
          email: currentUser.email,
          createdAt: new Date().toISOString(),
          stripeAccountStatus: STRIPE_STATUS.NOT_CREATED,
          // Add other default fields if necessary
        });
        return {
          ...currentUser,
          createdAt: new Date().toISOString(),
          stripeAccountStatus: STRIPE_STATUS.NOT_CREATED,
        };
      }

      const userData = userDoc.data();
      console.log('Fetched user data:', userData);

      let updatedData = { ...userData };

      if (userData.stripeConnectedAccountId) {
        const stripeStatus = await checkStripeAccountStatus(userData.stripeConnectedAccountId);
        if (stripeStatus !== userData.stripeAccountStatus) {
          console.log('Updating Stripe account status:', stripeStatus);
          await updateDoc(userDocRef, { stripeAccountStatus: stripeStatus });
          updatedData.stripeAccountStatus = stripeStatus;
        }
      }

      return { ...currentUser, ...updatedData };
    },
    [checkStripeAccountStatus]
  );

  return { updateUserData };
};
