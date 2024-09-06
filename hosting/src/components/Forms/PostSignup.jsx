
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Assuming you have an AuthContext
import { useStripe } from '../../context/StripeContext'; // Assuming you have a StripeContext
import { useNavigate } from 'react-router-dom';
import { Button } from '@chakra-ui/react';
import { createStripeConnectedAccount_test } from '../../api/stripeApi'; // Your Stripe API function

const PostSignup = () => {
  const { user } = useAuth(); // Get user from context
  const { stripeAccountStatus, setStripeAccountId } = useStripe(); // Get Stripe account status from context
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if user is already onboarded
  useEffect(() => {
    if (stripeAccountStatus === 'active') {
      navigate('/dashboard'); // Redirect to dashboard if Stripe is already active
    }
  }, [stripeAccountStatus, navigate]);

  const handleOnboarding = async () => {
    setLoading(true);
    try {
      const accountData = await createStripeConnectedAccount_test(user.email); // Call your API to create a Stripe account
      setStripeAccountId(accountData.stripeAccountId); // Update Stripe account ID in context
      window.location.href = accountData.onboardingUrl; // Redirect to Stripe onboarding
    } catch (error) {
      console.error('Error during Stripe onboarding:', error);
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">You're now logged in!</h2>
      <p className="mb-4">Let's get started by setting up your payment details with Stripe.</p>
      <Button 
        colorScheme="teal" 
        onClick={handleOnboarding} 
        isLoading={loading}
        loadingText="Starting Onboarding..."
      >
        Begin Stripe Onboarding
      </Button>
    </div>
  );
};

export default PostSignup;
