import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { Button, FormControl, FormLabel, Input, Box, VStack, Heading, Text, useToast } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { useStripe } from '../../context/StripeContext';

const StripeOnboarding = () => {
  const { user } = useAuth();
  const { stripeAccountStatus, setStripeAccountId } = useStripe();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (stripeAccountStatus === 'active') {
      navigate('/dashboard');
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [stripeAccountStatus, navigate, user]);

  const handleOnboarding = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User is not authenticated');
      }

      const token = await user.getIdToken();
      const response = await fetch('https://us-central1-rabbit-2ba47.cloudfunctions.net/createStripeAccountLink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: email }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.url) {
        setStripeAccountId(data.stripeAccountId);
        window.location.href = data.url;
      } else {
        throw new Error(data.message || 'Failed to start onboarding');
      }
    } catch (error) {
      console.error('Error during Stripe onboarding:', error);
      toast({
        title: "Onboarding Failed",
        description: error.message || "An error occurred during onboarding. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="400px" margin="auto" mt={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="xl" textAlign="center">Welcome!</Heading>
        <Text textAlign="center">Let's set up your payment details with Stripe.</Text>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </FormControl>
        <Button
          colorScheme="teal"
          onClick={handleOnboarding}
          isLoading={loading}
          loadingText="Starting Onboarding..."
        >
          Begin Stripe Onboarding
        </Button>
      </VStack>
    </Box>
  );
};

export default StripeOnboarding;