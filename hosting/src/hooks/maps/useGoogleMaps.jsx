import { useState, useEffect } from 'react';
import { loadGoogleMapsScript } from '../../api/googleMapsApi';

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);



  const initAutocomplete = ({ onDestinationSelect, onPickupSelect }) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps API not loaded');
      return () => {};
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

    const destinationAutocomplete = new window.google.maps.places.Autocomplete(document.getElementById('destination-input'), options);
    const pickupAutocomplete = new window.google.maps.places.Autocomplete(document.getElementById('pickup-input'), options);

    const destinationListener = destinationAutocomplete.addListener('place_changed', () => {
      const place = destinationAutocomplete.getPlace();
      if (place.geometry) {
        onDestinationSelect(place);
      }
    });

    const pickupListener = pickupAutocomplete.addListener('place_changed', () => {
      const place = pickupAutocomplete.getPlace();
      if (place.geometry) {
        onPickupSelect(place);
      }
    });

    return () => {
      if (window.google && window.google.maps && window.google.maps.event) {
        window.google.maps.event.removeListener(destinationListener);
        window.google.maps.event.removeListener(pickupListener);
      }
    };
  };

  return { isLoaded, initAutocomplete };
};