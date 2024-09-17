import React from 'react';
import { Button } from '@chakra-ui/react';
import useNavigation from '../../../hooks/useNavigation';

const NavigationButtons = () => {
  const { navigateToUserProfile, navigateToCartProfile, openStripeDashboard } = useNavigation();

  return (
    <>
      <Button colorScheme="teal" onClick={navigateToUserProfile}>
        Go to User Profile
      </Button>
      <Button colorScheme="teal" onClick={navigateToCartProfile}>
        Go to Cart Profile
      </Button>
      <Button colorScheme="teal" onClick={openStripeDashboard}>
        Open Stripe Dashboard
      </Button>
    </>
  );
};

export default NavigationButtons;
