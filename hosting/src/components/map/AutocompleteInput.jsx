import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Flex } from '@chakra-ui/react';

const AutocompleteInput = ({ onPlaceSelect, placeholder }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      const bounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(30.2817, -89.4178),
        new window.google.maps.LatLng(30.3617, -89.2978)
      );

      const options = {
        bounds: bounds,
        strictBounds: true,
        types: ['geocode'],
      };

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, options);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          onPlaceSelect(place.formatted_address);
        }
      });
    }
  }, [onPlaceSelect]);

  return (
    <Flex>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        width="300px"
      />
      <Button onClick={() => onPlaceSelect(inputRef.current.value)} ml={2}>Submit</Button>
    </Flex>
  );
};

AutocompleteInput.propTypes = {
  onPlaceSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
};

export default AutocompleteInput;