//useFetchStripeData(apiEndpoint, params): Reusable hook for fetching Stripe data.
import { useState, useEffect } from 'react';
import stripeApi from '../api/stripeApi';

export const useFetchStripeDataForConnectedAccount = (accountId) => {
  const [stripeData, setStripeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStripeData = async () => {
      try {
        const response = await stripeApi.get(`/stripeApi/fetch-stripe-data/${accountId}`);
        setStripeData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStripeData();
  }, [accountId]);

  return { stripeData, loading, error };
};
