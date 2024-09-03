import React, { useState } from 'react';
import { Button, Spinner, FormControl, FormLabel, Input, Box } from '@chakra-ui/react';
import { getAuth } from 'firebase/auth';

const OnboardingModal = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Onboarding function to call Google Cloud Function
  const handleOnboarding = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User is not authenticated');
      }

      // Get the token from Firebase Auth
      const token = await user.getIdToken();

      // Make the request to your Cloud Function
      const response = await fetch('https://us-central1-rabbit-2ba47.cloudfunctions.net/createStripeAccountLink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the token in the request
        },
        body: JSON.stringify({ email: user.email }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe onboarding
      } else {
        console.error('Error during onboarding:', data.message);
      }
    } catch (error) {
      console.error('Error initiating onboarding:', error);
      setFormError('Failed to start onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <FormControl>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </FormControl>
      {formError && <p style={{ color: 'red' }}>{formError}</p>}
      <Button colorScheme="teal" onClick={handleOnboarding} isLoading={loading}>
        Start Onboarding
      </Button>
    </Box>
  );
};

export default OnboardingModal;
