//useFetchStripeData(apiEndpoint, params): Reusable hook for fetching Stripe data.
import { useState, useEffect } from 'react';
import stripeApi from '../api/stripeApi';

export const useFetchStripeData = (endpoint, params = {}) => {
  const [stripeData, setStripeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await stripeApi.get(endpoint, { params });
        setStripeData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [endpoint, params]);

  return { stripeData, loading, error };
};
