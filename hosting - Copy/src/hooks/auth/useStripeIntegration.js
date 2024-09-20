// useStripeIntegration.js

import { useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Adjust import path
import { STRIPE_STATUS } from './constants'; // Adjust import path
import {
  createStripeConnectedAccount,
  getStripeAccountStatus,
  createAccountLink,
  createStripeCustomer,
} from '@api/stripeApi'; // Adjust import path

export const useStripeIntegration = () => {
  /**
   * Initializes Stripe customer and Express Connect account for a user.
   */
  const initializeUserStripeAccount = useCallback(async (userId, email) => {
    try {
      console.log('Initializing Stripe account for user:', userId);
      const connectedAccount = await createStripeConnectedAccount(email);
      console.log('Stripe connected account created:', connectedAccount.id);

      const customer = await createStripeCustomer(email);
      console.log('Stripe customer created:', customer.id);

      const accountLink = await createAccountLink(connectedAccount.id);
      console.log('Stripe account link created:', accountLink.url);

      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        stripeConnectedAccountId: connectedAccount.id,
        stripeCustomerId: customer.id,
        stripeAccountStatus: STRIPE_STATUS.PENDING,
        stripeAccountLink: accountLink.url,
        stripeLastUpdated: new Date().toISOString(),
      });

      return {
        stripeConnectedAccountId: connectedAccount.id,
        stripeCustomerId: customer.id,
        stripeAccountStatus: STRIPE_STATUS.PENDING,
        stripeAccountLink: accountLink.url,
        stripeLastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to initialize Stripe account:', error);
      throw error;
    }
  }, []);

  /**
   * Retrieves the Stripe account link for onboarding.
   */
  const getStripeAccountLink = useCallback(async (stripeConnectedAccountId) => {
    if (!stripeConnectedAccountId) {
      console.log('No Stripe account ID found for user');
      return null;
    }
    console.log('Getting Stripe account link for account:', stripeConnectedAccountId);
    try {
      const link = await createAccountLink(stripeConnectedAccountId);
      console.log('Stripe account link created:', link.url);
      return link.url;
    } catch (error) {
      console.error('Failed to create Stripe account link:', error);
      throw error;
    }
  }, []);

  /**
   * Checks the current status of a Stripe account.
   */
  const checkStripeAccountStatus = useCallback(async (stripeAccountId) => {
    if (!stripeAccountId) {
      console.log('No Stripe account ID found for user');
      return STRIPE_STATUS.NOT_CREATED;
    }
    console.log('Checking Stripe account status for account:', stripeAccountId);
    try {
      const status = await getStripeAccountStatus(stripeAccountId);
      console.log('Stripe account status:', status);
      return status;
    } catch (err) {
      console.error('Failed to check Stripe account status:', err);
      return STRIPE_STATUS.ERROR;
    }
  }, []);

  return { initializeUserStripeAccount, getStripeAccountLink, checkStripeAccountStatus };
};
