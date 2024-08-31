//  useStripeLink(clientSecret): Encapsulate logic related to Stripe link authorization and payment intent retrieval.
import { useState, useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';

export const useStripeLink = (clientSecret) => {
  const stripe = useStripe();
  const [email, setEmail] = useState('');
  const [isLinkAuthorized, setIsLinkAuthorized] = useState(false);

  useEffect(() => {
    if (stripe && clientSecret) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        setEmail(paymentIntent.receipt_email || '');
      });
    }
  }, [stripe, clientSecret]);

  const handleLinkAuthorization = async (e) => {
    e.preventDefault();
    if (!stripe || !clientSecret) return;

    const { error } = await stripe.verifyIdentity(clientSecret);
    if (error) {
      console.error('Error verifying identity:', error);
    } else {
      setIsLinkAuthorized(true);
    }
  };

  return { email, setEmail, isLinkAuthorized, handleLinkAuthorization };
};

