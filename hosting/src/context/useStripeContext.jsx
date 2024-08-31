// src/contexts/StripeContext.jsx

// Context Creation:

// You create a StripeContext using createContext(). This context will hold the Stripe-related data and functions.
// useStripe Hook:

// This hook provides a convenient way to access the context values within your components. It uses useContext(StripeContext) to retrieve the values.
// StripeProvider Component:

// This component is responsible for providing the Stripe context to your application.
// It uses the useAuth hook (assuming you have an authentication provider) to get the currentUser.
// It initializes two state variables:
// stripeAccountId: Stores the user's Stripe account ID.
// stripeAccountStatus: Stores the status of the user's Stripe account (e.g., 'not_created', 'incomplete', 'verified').
// Fetching Stripe Data:

// Inside a useEffect hook, it fetches the user's Stripe data from Firestore when the currentUser changes.
// It retrieves the user document from Firestore and updates the state variables with the fetched data.
// updateStripeStatus Function:

// This function allows you to update the user's Stripe account status in Firestore.
// It takes the new status as an argument and updates the stripeAccountStatus field in the user's document.
// Providing Context Values:

// The StripeProvider wraps its children with StripeContext.Provider and passes the following values:
// stripeAccountId
// stripeAccountStatus
// setStripeAccountId
// updateStripeStatus
import { useContext } from 'react';

import { StripeContext } from './StripeContext';



export function useStripeContext() {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripeContext must be used within a StripeProvider');
  }
  return context;
}

