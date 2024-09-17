import axios from 'axios';
import { auth } from '../hooks/firebase/firebaseConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error('Error setting up request interceptor:', error);
    return Promise.reject(error);
  }
});



export const createPaymentIntent = async (amount, pickup, destination) => {
  try {
    const response = await api.post('/api/create-payment-intent', { amount, pickup, destination });
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent: ' + (error.response?.data?.error || error.message));
  }
};

export const capturePaymentIntent = async (bookingId) => {
  try {
    const response = await api.post('/api/capture-payment-intent', { bookingId });
    return response.data;
  } catch (error) {
    console.error('Error capturing payment intent:', error);
    throw new Error('Failed to capture payment intent: ' + (error.response?.data?.error || error.message));
  }
};

export const cancelPaymentIntent = async (bookingId) => {
  try {
    const response = await api.post('/api/cancel-booking', { bookingId });
    return response.data;
  } catch (error) {
    console.error('Error canceling payment intent:', error);
    throw new Error('Failed to cancel payment intent: ' + (error.response?.data?.error || error.message));
  }
};

export const refundPaymentIntent = async (bookingId) => {
  try {
    const response = await api.post('/api/refund-booking', { bookingId });
    return response.data;
  } catch (error) {
    console.error('Error refunding payment intent:', error);
    throw new Error('Failed to refund payment intent: ' + (error.response?.data?.error || error.message));
  }
};

export const handleCreateCheckoutSession = async (amount, customerEmail) => {
  try {
    const response = await api.post('/api/create-checkout-session', {
      amount: parseInt(amount) * 100, // Convert to cents
      customerEmail,
    });
    window.location.href = response.data.url; // Redirect to Stripe Checkout
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Error creating checkout session: ' + error.message);
  }
};

// stripeApi.jsx
export const retrievePaymentIntent = async (clientSecret) => {
  try {
    const response = await fetch(`/api/stripe/retrieve-payment-intent/${clientSecret}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error retrieving Payment Intent');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error retrieving Payment Intent:', error);
    throw error;
  }
};



export const handleCapturePaymentIntent = async (bookingId) => {
  try {
    const response = await capturePaymentIntent(bookingId);
    return response;
  } catch (error) {
    console.error('Error handling capture payment intent:', error);
    throw new Error('Error handling capture payment intent: ' + error.message);
  }
};

export const handleCancelPaymentIntent = async (bookingId) => {
  try {
    const response = await cancelPaymentIntent(bookingId);
    return response;
  } catch (error) {
    console.error('Error handling cancel payment intent:', error);
    throw new Error('Error handling cancel payment intent: ' + error.message);
  }
};



// Function to create a Stripe connected account
export const createStripeConnectedAccount = async (email) => {
  console.log('Attempting to create Stripe connected account for:', email);
  try {
    const response = await api.post('/api/create-stripe-account', { email });
    console.log('Stripe connected account successfully created:', response.data);
    // Ensure that the backend returns both accountId and customerId
    const { accountId, customerId } = response.data;
    return { accountId, customerId };
  } catch (error) {
    console.error('Error creating Stripe connected account:', error);
    throw new Error('Failed to create Stripe connected account: ' + (error.response?.data?.error || error.message));
  }
};

// Renamed from createStripeAccountSession to createAccountLink
// export const createAccountLink = async (accountId) => {
//   console.log('Attempting to create Stripe onboarding session for account:', accountId);
//   try {
//     const response = await api.post('/api/create-account-session', { accountId });
//     console.log('Onboarding session created successfully:', response.data);
//     return response.data; // Assuming this returns { url }
//   } catch (error) {
//     console.error('Error creating Stripe account session:', error);
//     throw new Error('Failed to create Stripe account session: ' + (error.response?.data?.error || error.message));
//   }
// };

// New function to get Stripe account status
export const getStripeAccountStatus = async (accountId) => {
  console.log('Checking Stripe account status for account:', accountId);
  try {
    const response = await api.get(`/api/check-account-status/${accountId}`);
    console.log('Stripe account status:', response.data.status);
    return response.data.status;
  } catch (error) {
    console.error('Error checking Stripe account status:', error);
    throw new Error('Failed to check Stripe account status: ' + (error.response?.data?.error || error.message));
  }
};
export const createAccountLink = async (accountId) => {
  const response = await fetch('/create-account-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountId,
      returnUrl: 'https://your-app.com/stripe-onboarding-complete', // Replace with your actual return URL
    }),
  });
  const data = await response.json();
  return data;
};

// New function to create a Stripe customer
export const createStripeCustomer = async (email) => {
  console.log('Attempting to create Stripe customer for:', email);
  try {
    const response = await api.post('/api/create-stripe-customer', { email });
    console.log('Stripe customer successfully created:', response.data);
    return response.data; // Assuming this returns { customerId }
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create Stripe customer: ' + (error.response?.data?.error || error.message));
  }
};

// This function is not needed in the AuthProvider, but you might use it elsewhere in your app
export const initializeStripeAccountAndSession = async (email) => {
  try {
    console.log('Starting the Stripe account creation process for email:', email);
    const { accountId, customerId } = await createStripeConnectedAccount(email);
    console.log('Creating onboarding session for the new account ID:', accountId);
    const { url } = await createAccountLink(accountId);
    console.log('Stripe onboarding session URL created:', url);
    return { accountId, customerId, url };
  } catch (error) {
    console.error('Error during Stripe account initialization process:', error);
    throw error;
  }
};


export const checkStripeStatus = async (email) => {
  try {
    const response = await api.post('/checkStripeStatus', { email });
    return response.data;
  } catch (error) {
    console.error('Error checking Stripe status:', error);
    throw new Error('Failed to check Stripe status: ' + (error.response?.data?.error || error.message));
  }
};






// stripeApi.jsx

// stripeApi.jsx
export const updateStripeStatusInDb = async (userId, status) => {
  const response = await fetch(`/api/update-stripe-status/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  return data;
};

// stripeApi.jsx


export default api;