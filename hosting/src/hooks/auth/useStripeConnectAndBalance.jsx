// useStripeConnectAndBalance.js

import { useState, useEffect } from 'react';
import { loadConnectAndInitialize } from "@stripe/connect-js";

export const useStripeConnectAndBalance = (connectedAccountId) => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);
  const [stripeBalance, setStripeBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch the Stripe balance
  const fetchStripeBalance = async () => {
    try {
      const response = await fetch('/api/stripe/balance'); // Update endpoint as needed
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      const data = await response.json();
      setStripeBalance(data);
    } catch (error) {
      console.error('Error fetching Stripe balance:', error);
      setError('Failed to fetch Stripe balance.');
    }
  };

  useEffect(() => {
    if (connectedAccountId) {
      const initializeStripeConnect = async () => {
        try {
          // Fetch Client Secret
          const fetchClientSecret = async () => {
            const response = await fetch('/api/account_session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ account: connectedAccountId }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorData.error}`
              );
            }

            const { client_secret: clientSecret } = await response.json();
            return clientSecret;
          };

          // Initialize Stripe Connect
          const instance = await loadConnectAndInitialize({
            publishableKey: 'pk_test_51PKXFdLZTLOaKlNslmwEPt9pWm5uS9ZyOsr5gXeJKCmLal5nT1gofFJm2icRtOJgxEhs5265M6LRpSGPHEHydRna00CVialgWd', // Replace with your Stripe publishable key
            clientSecret: await fetchClientSecret(),
            appearance: {
              // Customize appearance as needed
              variables: {
                colorPrimary: '#000000',
              },
            },
          });

          setStripeConnectInstance(instance);

          // Fetch Stripe Balance
          await fetchStripeBalance();
        } catch (error) {
          console.error(
            'Error initializing Stripe Connect or fetching balance:',
            error
          );
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      initializeStripeConnect();
    }
  }, [connectedAccountId]);

  return { stripeConnectInstance, stripeBalance, loading, error };
};

export default useStripeConnectAndBalance;
