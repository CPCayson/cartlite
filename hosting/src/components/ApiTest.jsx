// src/ApiTest.js
import React, { useState } from 'react';

function ApiTest() {
  const [result, setResult] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');

  const handleApiCall = async (endpoint, data) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resultData = await response.json();
      setResult(JSON.stringify(resultData, null, 2));

      if (endpoint === '/api/create-payment-intent') {
        setPaymentIntentId(resultData.booking.paymentIntentId); // Save Payment Intent ID
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setResult(`Error: ${error.message}`);
    }
  };

  const createPaymentIntent = () => {
    handleApiCall('/api/create-payment-intent', {
      amount: 1000, // $10.00
      pickup: '123 Main St, Bay Saint Louis, MS',
      destination: '456 Oak St, Bay Saint Louis, MS'
    });
  };

  const createCheckoutSession = () => {
    if (!paymentIntentId) {
      alert('No Payment Intent ID saved! Create a Payment Intent first.');
      return;
    }

    handleApiCall('/api/create-checkout-session', {
      paymentIntentId, // Use the saved Payment Intent ID
      amount: 1000, // Same amount used for Payment Intent
      pickup: '123 Main St, Bay Saint Louis, MS',
      destination: '456 Oak St, Bay Saint Louis, MS'
    });
  };

  return (
    <div>
      <h1>Test Your API Endpoints</h1>
      <button onClick={createPaymentIntent}>
        Create Payment Intent
      </button>
      <button onClick={createCheckoutSession}>
        Create Checkout Session
      </button>
      <button onClick={() => handleApiCall('/api/capture-payment-intent', { bookingId: paymentIntentId })}>
        Capture Payment Intent
      </button>
      <button onClick={() => {
        const bookingId = prompt('Enter Booking ID to cancel:');
        handleApiCall('/api/cancel-booking', { bookingId });
      }}>
        Cancel Booking
      </button>
      <button onClick={() => {
        const bookingId = prompt('Enter Booking ID to refund:');
        handleApiCall('/api/refund-booking', { bookingId });
      }}>
        Refund Booking
      </button>
      <div>
        <h2>Results</h2>
        <pre>{result}</pre>
      </div>
    </div>
  );
}

export default ApiTest;
