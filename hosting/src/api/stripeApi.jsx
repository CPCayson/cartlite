                //capturePaymentIntent, //cancelPaymentIntent, //refundPaymentIntent
                //completeStripeOnboarding, ////createPaymentIntent
                
                //createStripeConnectedAccount, //createStripeAccount, updateConnectAccount, retrieveConnectAccount
      
                //createAccountLink, //createAccountSession, //getStripeAccountStatus,//handleRequestAction,
                
//What I need: createCustomer, updateCustomer, ,  ,
import axios from 'axios';
import { auth } from './firebaseConfig'; // Ensure this is the correct path to your Firebase config

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create an Axios instance with base URL and interceptors for authentication
const createApi = () => {
  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  // Interceptor to add auth token to requests
  api.interceptors.request.use(async (config) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(true); // Force refresh the token
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    } catch (error) {
      console.error('Error setting up request interceptor:', error);
      return Promise.reject(error);
    }
  });

  return api;
};

const stripeApi = createApi();

// Function to create a new Stripe customer
export const createCustomer = async (customerData) => {
  try {
    const response = await stripeApi.post('/stripeApi/create-customer', customerData);
    return response.data;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create Stripe customer: ' + (error.response?.data?.error || error.message));
  }
};

// Function to update an existing Stripe customer
export const updateCustomer = async (customerId, updateData) => {
  if (!customerId) {
    throw new Error('Customer ID is required');
  }
  try {
    const response = await stripeApi.post(`/stripeApi/update-customer/${customerId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating Stripe customer:', error);
    throw new Error('Failed to update Stripe customer: ' + (error.response?.data?.error || error.message));
  }
};

// Function to retrieve a payment intent
export const retrievePaymentIntent = async (paymentIntentId) => {
  if (!paymentIntentId) {
    throw new Error('Payment Intent ID is required');
  }
  try {
    const response = await stripeApi.get(`/stripeApi/retrieve-payment-intent/${paymentIntentId}`);
    return response.data;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new Error('Failed to retrieve payment intent: ' + (error.response?.data?.error || error.message));
  }
};

// Function to create a checkout session
export const createCheckoutSession = async (sessionData) => {
  try {
    const response = await stripeApi.post('/stripeApi/create-checkout-session', sessionData);
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session: ' + (error.response?.data?.error || error.message));
  }
};



// Function to create a Stripe connected account
export const createStripeConnectedAccount = async (email) => {
    try {
      const response = await stripeApi.post('/stripeApi/create-connected-account', { email });
      return response.data;
    } catch (error) {
      console.error('Error creating Stripe connected account:', error);
      throw new Error('Failed to create Stripe connected account: ' + (error.response?.data?.error || error.message));
    }
  };
  
  // Function to create a Stripe account (if different from `createStripeConnectedAccount`)
  export const createStripeAccount = async (email) => {
    try {
      const response = await stripeApi.post('/stripeApi/create-connected-account', { email });
      return response.data;
    } catch (error) {
      console.error('Error creating Stripe account:', error);
      throw new Error('Failed to create Stripe account: ' + (error.response?.data?.error || error.message));
    }
  };
  
  // Function to create an account link for Stripe onboarding
  export const createAccountLink = async (accountId) => {
    if (!accountId) {
      throw new Error('Account ID is required');
    }
  
    try {
      const response = await stripeApi.post('/stripeApi/create-account-link', { accountId });
      return response.data;
    } catch (error) {
      console.error('Error creating account link:', error);
      throw new Error('Failed to create account link: ' + (error.response?.data?.error || error.message));
    }
  };
  // Function to complete Stripe onboarding
  export const completeStripeOnboarding = async (accountId) => {
    if (!accountId) {
      throw new Error('Account ID is required');
    }
    try {
      const response = await stripeApi.post('/stripeApi/complete-stripe-onboarding', { accountId });
      return response.data;
    } catch (error) {
      console.error('Error completing Stripe onboarding:', error);
      throw new Error('Failed to complete Stripe onboarding: ' + (error.response?.data?.error || error.message));
    }
  };

  // Function to create an account session for Stripe Connect
  export const createAccountSession = async (accountId) => {
    if (!accountId) {
      throw new Error('Account ID is required');
    }
    try {
      const response = await stripeApi.post('/stripeApi/create-account-session', { accountId });
      return response.data;
    } catch (error) {
      console.error('Error creating account session:', error);
      throw new Error('Failed to create account session: ' + (error.response?.data?.error || error.message));
    }
  };

  // Other functions remain unchanged
  export const getStripeAccountStatus = async (accountId) => {
    if (!accountId) {
      throw new Error('Account ID is required');
    }
    try {
      const response = await stripeApi.get(`/stripeApi/stripe-account-status/${accountId}`);
      return response.data.status;
    } catch (error) {
      console.error('Error fetching Stripe account status:', error);
      throw new Error('Failed to fetch Stripe account status: ' + (error.response?.data?.error || error.message));
    }
  };

  // Function to create a payment intent
  export const createPaymentIntent = async ({
    amount,
    currency,
    email,
    destination_address,
    destination_location,
    user_location,
    user_name,
    user_uid,
    cartId,
    rideId,
  }) => {
    const headers = { 'Content-Type': 'application/json' };
    if (!rideId || rideId.trim() === '') {
      throw new Error('Ride ID is required and cannot be empty.');
    }
    try {
      const response = await stripeApi.post(
        '/stripeApi/create-payment-intent',
        {
          amount,
          currency,
          email,
          destination_address,
          destination_location,
          user_location,
          user_name,
          user_uid,
          cartId,
          rideId,
          isAnonymous: true,
        },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent: ' + (error.response?.data?.error || error.message));
    }
  };

  // Function to capture a payment intent
  export const capturePaymentIntent = async (rideId, amount) => {
    if (!rideId || !amount) {
      throw new Error('Missing rideId or amount in request body');
    }
    try {
      const response = await stripeApi.post('/stripeApi/capture-payment-intent', { rideId, amount });
      return response.data;
    } catch (error) {
      console.error('Error capturing payment:', error);
      throw new Error('Failed to capture payment: ' + (error.response?.data?.error || error.message));
    }
  };
  // Function to cancel a payment intent
  export const cancelPaymentIntent = async (paymentIntentId) => {
    if (!paymentIntentId) {
      throw new Error('Payment Intent ID is required');
    }
    try {
      const response = await stripeApi.post('/stripeApi/cancel-payment-intent', { paymentIntentId });
      return response.data;
    } catch (error) {
      console.error('Error canceling payment intent:', error);
      throw new Error('Failed to cancel payment intent: ' + (error.response?.data?.error || error.message));
    }
  };
 
  // Function to refund a payment intent
  export const refundPaymentIntent = async (paymentIntentId) => {
    if (!paymentIntentId) {
      throw new Error('Payment Intent ID is required');
    }
    try {
      const response = await stripeApi.post('/stripeApi/refund-payment-intent', { paymentIntentId });
      return response.data;
    } catch (error) {
      console.error('Error refunding payment intent:', error);
      throw new Error('Failed to refund payment: ' + (error.response?.data?.error || error.message));
    }
  };
  
  // Function to handle request actions
  export const handleRequestAction = async (request, action) => {
    try {
      if (!request.rideId || !request.rideFee) {
        throw new Error('Missing rideId or rideFee in the request data');
      }
  
      if (action === 'accept') {
        // Capture payment intent with rideId and amount
        await capturePaymentIntent(request.rideId, Math.round(request.rideFee * 100));
  
        // Additional Firestore update logic...
      } else if (action === 'reject') {
        if (!request.paymentIntentId) {
          throw new Error('Payment Intent ID is required');
        }
  
        await cancelPaymentIntent(request.paymentIntentId);
        // Additional Firestore update logic...
      }
    } catch (error) {
      console.error(`Error ${action === 'accept' ? 'accepting' : 'rejecting'} ride request:`, error);
      throw error;
    }
  };
  
  // Function to create a ride request
  export default stripeApi;
