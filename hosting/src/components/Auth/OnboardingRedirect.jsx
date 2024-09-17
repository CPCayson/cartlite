// OnboardingRedirect.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../hooks/firebase/firebaseConfig'; // Adjust the import path as needed
import { useNavigate } from 'react-router-dom';
import { useToast, Box, Heading } from '@chakra-ui/react';
import { STRIPE_STATUS } from '../../hooks/auth/constants'; // Adjust the import path as needed
import { useStripeIntegration } from '../../hooks/auth/useStripeIntegration'; // Adjust the import path as needed

const OnboardingRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { checkStripeAccountStatus } = useStripeIntegration();

  useEffect(() => {
    const completeOnboarding = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const stripeStatus = await checkStripeAccountStatus(user.stripeConnectedAccountId);

          // Update the 'isNew' flag based on Stripe account status
          if (stripeStatus === STRIPE_STATUS.ACTIVE) {
            await updateDoc(userDocRef, { isNew: false, stripeAccountStatus: stripeStatus });
            toast({
              title: 'Onboarding Complete',
              description: 'Your Stripe account has been set up successfully.',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            navigate('/'); // Redirect to home or dashboard
          } else {
            toast({
              title: 'Onboarding Incomplete',
              description: 'Your Stripe account is not active yet. Please complete the onboarding process.',
              status: 'warning',
              duration: 3000,
              isClosable: true,
            });
            // Optionally, redirect back to onboarding
            navigate('/auth'); // Adjust the path as needed
          }
        } catch (error) {
          console.error('Onboarding Redirect Error:', error);
          toast({
            title: 'Error',
            description: 'Failed to complete onboarding. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/auth'); // Redirect to authentication page
        }
      } else {
        toast({
          title: 'User Not Found',
          description: 'No authenticated user found.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/auth'); // Redirect to authentication page
      }
    };

    completeOnboarding();
  }, [user, checkStripeAccountStatus, navigate, toast]);

  return (
    <Box textAlign="center" mt={10}>
      <Heading color="white">Completing Onboarding...</Heading>
    </Box>
  );
};

export default OnboardingRedirect;
