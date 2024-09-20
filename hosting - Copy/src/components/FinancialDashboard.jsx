// src/components/FinancialDashboard.jsx

import React from 'react';
import PropTypes from 'prop-types';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Box, Button, Heading, Text, Spinner, Alert, AlertIcon } from '@chakra-ui/react';

const FinancialDashboard = ({ onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error('[createPaymentMethod error]', error);
      // Handle error appropriately, e.g., display a message to the user
    } else {
      console.log('[PaymentMethod]', paymentMethod);
      // Proceed with your payment process
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentMethod);
      }
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={5} borderWidth="1px" borderRadius="lg">
      <Heading mb={6} textAlign="center">
        Financial Dashboard
      </Heading>
      <form onSubmit={handleSubmit}>
        <CardElement options={{ hidePostalCode: true }} />
        <Button
          mt={4}
          colorScheme="teal"
          type="submit"
          isFullWidth
          isLoading={!stripe}
          loadingText="Processing"
        >
          Submit Payment
        </Button>
      </form>
    </Box>
  );
};

FinancialDashboard.propTypes = {
  onPaymentSuccess: PropTypes.func, // Optional callback prop
};

export default FinancialDashboard;
