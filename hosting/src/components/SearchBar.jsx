import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Clock, Search } from 'lucide-react';
import { Input, Button, Select, Box, Flex } from '@chakra-ui/react';

const SearchBar = ({ userEmail, paymentIntentId, paymentIntentStatus, onPaymentIntentUpdate, onBookRide }) => {
  const [step, setStep] = useState(0);
  const [destination, setDestination] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Current Location');
  const [countdownTime, setCountdownTime] = useState(null);
  const [bookingAmount] = useState(Math.floor(Math.random() * 10000) + 500); // Random amount between 500 and 10,500 cents
  const destinationInputRef = useRef(null);
  const pickupInputRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCOkJd62Hu9iEVlJ_LIIrakwbkm19cg8CU&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initAutocomplete;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof updateCountdown === 'function') {
        updateCountdown();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownTime]);

  const initAutocomplete = () => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps API not loaded');
      return;
    }

    const bounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(30.2817, -89.4178),
      new window.google.maps.LatLng(30.3617, -89.2978)
    );

    const options = {
      bounds: bounds,
      strictBounds: true,
      types: ['geocode'],
    };

    const destinationAutocomplete = new window.google.maps.places.Autocomplete(destinationInputRef.current, options);
    destinationAutocomplete.addListener('place_changed', () => {
      const place = destinationAutocomplete.getPlace();
      if (place.geometry) {
        setDestination(place.formatted_address);
        setStep(1); // Move to the next step
      }
    });

    const pickupAutocomplete = new window.google.maps.places.Autocomplete(pickupInputRef.current, options);
    pickupAutocomplete.addListener('place_changed', () => {
      const place = pickupAutocomplete.getPlace();
      if (place.geometry) {
        setPickupLocation(place.formatted_address);
      }
    });
  };

  const updateCountdown = () => {
    // Implement your countdown logic here
  };

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handleBookingConfirmation = () => {
    onBookRide(bookingAmount, 'test_ride_id');
  };

  const handleCapturePayment = async () => {
    if (!paymentIntentId) {
      console.error('No payment intent ID to capture.');
      return;
    }

    try {
      const response = await fetch('/api/capture-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId, customerEmail: userEmail }),
      });

      const result = await response.json();
      if (result.error) {
        console.error('Error capturing payment:', result.error);
      } else {
        onPaymentIntentUpdate(paymentIntentId, 'captured');
        console.log('Payment captured successfully.');
      }
    } catch (error) {
      console.error('Error capturing payment:', error);
    }
  };

  const handleCancelPayment = async () => {
    if (!paymentIntentId) {
      console.error('No payment intent ID to cancel.');
      return;
    }

    try {
      const response = await fetch('/api/cancel-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId, customerEmail: userEmail }),
      });

      const result = await response.json();
      if (result.error) {
        console.error('Error canceling payment:', result.error);
      } else {
        onPaymentIntentUpdate(null, 'canceled');
        console.log('Payment canceled successfully.');
      }
    } catch (error) {
      console.error('Error canceling payment:', error);
    }
  };

  const handleRefundPayment = async () => {
    if (!paymentIntentId) {
      console.error('No payment intent ID to refund.');
      return;
    }

    try {
      const response = await fetch('/api/refund-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId, customerEmail: userEmail }),
      });

      const result = await response.json();
      if (result.error) {
        console.error('Error refunding payment:', result.error);
      } else {
        onPaymentIntentUpdate(null, 'refunded');
        console.log('Payment refunded successfully.');
      }
    } catch (error) {
      console.error('Error refunding payment:', error);
    }
  };

  return (
    <Box className="search-bar-container" p={4} bg="gray.100" rounded="lg">
      <Flex align="center" justify="space-between" wrap="nowrap">
        {step === 0 && (
          <Flex flex="1" align="center">
            <Input
              type="text"
              ref={destinationInputRef}
              placeholder="Enter destination..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </Flex>
        )}

        {step >= 1 && (
          <Flex flex="1" align="center">
            <MapPin size={20} />
            <Box ml={2}>{destination}</Box>
            <Button ml={4} onClick={handleNextStep}>Set Time</Button>
          </Flex>
        )}

        {step >= 2 && (
          <Flex flex="1" align="center">
            <Clock size={20} />
            <Select placeholder="Select time" value={countdownTime} onChange={(e) => setCountdownTime(e.target.value)}>
              <option value="10">10 minutes</option>
              <option value="20">20 minutes</option>
              <option value="30">30 minutes</option>
            </Select>
            <Button ml={4} onClick={handleNextStep}>Confirm</Button>
          </Flex>
        )}

        {step === 3 && (
          <Flex flex="1" align="center">
            <Button colorScheme="teal" onClick={handleBookingConfirmation}>
              Book Now (${(bookingAmount / 100).toFixed(2)})
            </Button>
            {paymentIntentId && (
              <>
                <Button ml={4} colorScheme="green" onClick={() => handleCapturePayment()}>
                  Capture Payment
                </Button>
                <Button ml={4} colorScheme="red" onClick={() => handleCancelPayment()}>
                  Cancel Payment
                </Button>
                <Button ml={4} colorScheme="orange" onClick={() => handleRefundPayment()}>
                  Refund Payment
                </Button>
              </>
            )}
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

// PropTypes validation
SearchBar.propTypes = {
  userEmail: PropTypes.string.isRequired,
  paymentIntentId: PropTypes.string,
  paymentIntentStatus: PropTypes.string,
  onPaymentIntentUpdate: PropTypes.func.isRequired,
  onBookRide: PropTypes.func.isRequired,
};

export default SearchBar;
