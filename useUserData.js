import { useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './hosting/src/hooks/firebase/firebaseConfig';
import { STRIPE_STATUS } from './hosting/src/hooks/auth/constants';
import { useStripeIntegration } from './hosting/src/hooks/auth/useStripeIntegration';

export const useUserData = () => {
  const { checkStripeAccountStatus } = useStripeIntegration();

  const updateUserData = useCallback(async (currentUser) => {
    console.log('Updating user data for:', currentUser.uid);
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
  
    if (!userDoc.exists()) {
      console.log('User document does not exist, creating one');
      await setDoc(userDocRef, {
        email: currentUser.email,
        createdAt: new Date().toISOString(),
        stripeAccountStatus: STRIPE_STATUS.NOT_CREATED,
      });
      return { ...currentUser, createdAt: new Date().toISOString(), stripeAccountStatus: STRIPE_STATUS.NOT_CREATED };
    }
  
    const userData = userDoc.data();
    console.log('Fetched user data:', userData);
  
    if (userData.stripeConnectedAccountId) {
      const stripeStatus = await checkStripeAccountStatus(userData.stripeConnectedAccountId);
      if (stripeStatus !== userData.stripeAccountStatus) {
        console.log('Updating Stripe account status:', stripeStatus);
        await updateDoc(userDocRef, { stripeAccountStatus: stripeStatus });
        userData.stripeAccountStatus = stripeStatus;
      }
    }
  
    return { ...currentUser, ...userData };
  }, [checkStripeAccountStatus]);

  return { updateUserData };
};