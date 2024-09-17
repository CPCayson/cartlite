import { useEffect, useState } from 'react'; // Import useState only once
import { useStripe as useStripeJs } from '@stripe/react-stripe-js';
import {
  createStripeConnectedAccount,
  getStripeAccountStatus,
  createAccountLink,
  retrievePaymentIntent,
  updateStripeStatusInDb
} from '../api/stripeApi';

export const useStripe = (user, clientSecret = null) => {
  const [stripeAccountStatus, setStripeAccountStatus] = useState('not_created');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isLinkAuthorized, setIsLinkAuthorized] = useState(false);
  const [error, setError] = useState(null);
  const stripe = useStripeJs();

  useEffect(() => {
    const initializeStripe = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Ensure the Stripe Account ID is available before checking status
        if (!user.stripeAccountId) {
          const stripeAccount = await createStripeConnectedAccount(user.email);
          await updateStripeStatusInDb(user.uid, 'not_created');
          user.stripeAccountId = stripeAccount.accountId; // Ensure user object is updated
        }

        if (user.stripeAccountId) {
          const stripeAccountData = await getStripeAccountStatus(user.stripeAccountId);
          setStripeAccountStatus(stripeAccountData);

          if (stripeAccountData === 'not_created' || stripeAccountData === 'incomplete') {
            const accountLink = await createAccountLink(user.stripeAccountId);
            window.location.href = accountLink.url;
          }
        } else {
          throw new Error('Stripe Account ID is required but not available.');
        }

        if (clientSecret) {
          try {
            const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
            setEmail(paymentIntent.receipt_email || '');
          } catch (err) {
            console.error('Error retrieving payment intent:', err);
            setError(err.message);
          }
        }
      } catch (err) {
        console.error('Error initializing Stripe:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, [user, clientSecret, stripe]);

  return {
    stripeAccountStatus,
    loading,
    email,
    isLinkAuthorized,
    error,
  };
};

export default useStripe;
