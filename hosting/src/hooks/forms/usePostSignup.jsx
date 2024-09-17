import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext'; // Assume you have a user context
import { api } from './api'; // Your API utility
import { ConnectAccountOnboarding, ConnectComponentsProvider } from "@stripe/react-connect-js";

const StripeOnboarding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);
  const { user, updateUser } = useUser();

  useEffect(() => {
    if (user && user.stripeAccountId) {
      checkAccountStatus(user.stripeAccountId);
    }
  }, [user]);

  useEffect(() => {
    // Initialize Stripe Connect instance
    const initStripeConnect = async () => {
      const stripe = await loadStripe('');
      const instance = await stripe.connectInstance();
      setStripeConnectInstance(instance);
    };
    initStripeConnect();
  }, []);

  const checkAccountStatus = async (accountId) => {
    try {
      const { status } = await api.get(`/api/account-status/${accountId}`);
      updateUser({ stripeAccountStatus: status });
    } catch (error) {
      console.error('Error checking account status:', error);
      setError('Failed to check account status. Please try again.');
    }
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const { accountId, customerId } = await api.post('/api/create-connected-account', { email: user.email });
      updateUser({ stripeAccountId: accountId, stripeCustomerId: customerId, stripeAccountStatus: 'not_onboarded' });
    } catch (error) {
      console.error('Error creating Stripe account:', error);
      setError('Failed to create Stripe account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingExit = async () => {
    console.log("The account has exited onboarding");
    await checkAccountStatus(user.stripeAccountId);
  };

  const openDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const { url } = await api.post('/api/create-dashboard-link', { accountId: user.stripeAccountId });
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening Stripe dashboard:', error);
      setError('Failed to open Stripe dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!stripeConnectInstance) {
    return <div>Loading Stripe Connect...</div>;
  }

  if (user.stripeAccountStatus === 'complete') {
    return (
      <div>
        <h2>Stripe Account Onboarded</h2>
        <button onClick={openDashboard} disabled={loading}>
          Open Stripe Dashboard
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  if (!user.stripeAccountId) {
    return (
      <div>
        <h2>Create Stripe Account</h2>
        <button onClick={handleCreateAccount} disabled={loading}>
          Create Stripe Account
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <h2>Complete Stripe Onboarding</h2>
      <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
        <ConnectAccountOnboarding
          accountId={user.stripeAccountId}
          onExit={handleOnboardingExit}
          // Optional: Uncomment and provide URLs as needed
          // fullTermsOfServiceUrl="https://your-website.com/terms"
          // recipientTermsOfServiceUrl="https://your-website.com/recipient-terms"
          // privacyPolicyUrl="https://your-website.com/privacy"
          // skipTermsOfServiceCollection={false}
          // collectionOptions={{
          //   fields: 'eventually_due',
          //   futureRequirements: 'include',
          // }}
        />
      </ConnectComponentsProvider>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default StripeOnboarding;