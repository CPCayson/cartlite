import React, { useState, useEffect } from 'react';
import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
  ConnectPayouts,
  ConnectPayments,
} from "@stripe/react-connect-js";

const AccountSessionComponent = ({ accountId }) => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch the client secret for initializing Stripe Connect
  const fetchClientSecret = async () => {
    try {
      const response = await fetch('/api/create-account-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
      }
  
      const data = await response.json();
      console.log("Client Secret fetched:", data.clientSecret);  // Log client secret
      return data.clientSecret;
    } catch (error) {
      console.error('Error fetching client secret:', error);
      throw error;
    }
  };
  
  // Initialize Stripe Connect
  useEffect(() => {
    const initializeStripeConnect = async () => {
      if (!accountId) return;
      
      try {
        const instance = await loadConnectAndInitialize({
          publishableKey: 'pk_test_51PKXFdLZTLOaKlNslmwEPt9pWm5uS9ZyOsr5gXeJKCmLal5nT1gofFJm2icRtOJgxEhs5265M6LRpSGPHEHydRna00CVialgWd',
          fetchClientSecret,
        });
    
        console.log("Stripe Connect instance initialized:", instance);  // Log instance
        setStripeConnectInstance(instance);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing Stripe Connect:', error);
        setError('Error initializing Stripe Connect');
        setLoading(false);
      }
    };
    

    initializeStripeConnect();
  }, [accountId]);

  // Handle completion of the onboarding process
  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
    // Optionally, refresh the account status here
  };

  if (loading) {
    return <div>Loading Stripe Connect...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      {!onboardingComplete ? (
        <ConnectAccountOnboarding onComplete={handleOnboardingComplete} />
      ) : (
        <>
          <ConnectPayouts />
          <ConnectPayments />
        </>
      )}
    </ConnectComponentsProvider>
  );
};

export default AccountSessionComponent;
