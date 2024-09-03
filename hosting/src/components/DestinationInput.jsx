import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Input } from '@chakra-ui/react';
import { Search } from 'lucide-react';

const DestinationInput = ({ onDestinationChange }) => {
  const [destination, setDestination] = useState('');
  const destinationInputRef = useRef(null);

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
        const formattedAddress = place.formatted_address;
        setDestination(formattedAddress);
        onDestinationChange(formattedAddress);
      }
    });
  };

  return (
    <div className="destination-input">
      <Input
        type="text"
        ref={destinationInputRef}
        placeholder="Enter destination..."
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        className="w-full pr-10"
      />
      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
    </div>
  );
};

// PropTypes validation
DestinationInput.propTypes = {
  onDestinationChange: PropTypes.func.isRequired,
};

export default DestinationInput;
