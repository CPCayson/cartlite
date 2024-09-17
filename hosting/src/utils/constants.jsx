//            Categories, map default settings, category icons, colors, etc.

// src/utils/constants.js

export const categories = [
    { value: 'all', label: 'All', color: '#FFFFFF', location: { lat: 30.2951, lng: -89.3988 } },
    { value: 'bar', label: 'Bars', color: '#FF0000', location: { lat: 30.3101, lng: -89.3567 } },
    { value: 'restaurant', label: 'Food', color: '#00FF00', location: { lat: 30.3101, lng: -89.3567 } },
    { value: 'lodging', label: 'Houses', color: '#0000FF', location: { lat: 30.3101, lng: -89.3567 } },
    { value: 'accommodation', label: 'Accommodation', color: '#FFFF00', location: { lat: 30.3101, lng: -89.3567 } },
  ];
  
  export const categoryIcons = {
    all: '/assets/all.png',
    bar: '/assets/bar.png',
    restaurant: '/assets/food.png',
    lodging: '/assets/house.png',
    accommodation: '/assets/accommodation.png',
  };
  
  export const markerSizes = {
    default: new google.maps.Size(30, 30),
    user: new google.maps.Size(40, 40),
  };
  
  export const specialMarkers = {
    user: '/assets/user-location.png',
    cart: '/assets/golf-cart.png',
    default: '/assets/default-marker.png',
  };

  const categoryIcons = {
    food: '/assets/food.png',
    shopping: '/assets/shopping.png',
    fun: '/assets/fun.png',
    // ...other categories
  };
  
  export const categoryColors = {
    all: '#FFFFFF',
    bar: '#FF0000',
    restaurant: '#00FF00',
    lodging: '#0000FF',
    accommodation: '#FFFF00',
  };
  
  export const MAX_DISTANCE = 32.19; // 20 miles in kilometers
  
  export const mapDefaults = {
    center: { lat: 30.3088076, lng: -89.3300461 },
    zoom: 14,
    mapTypeId: 'hybrid',
    tilt: 45,
    heading: 0,
  };
  
  
  export const drawerSize = 'md';
  
  export const firebaseCollections = {
    places: 'places',
    carts: 'carts',
  };
  
  export const dashboardDefaultStats = {
    totalPlaces: 0,
    averageRating: 0,
    mostPopularCategory: 'N/A',
  };
  
  export const toastConfig = {
    duration: 5000,
    isClosable: true,
  };
  
  export const mapContainerStyle = { width: '100%', height: '100%' };
  
  export const gridTemplateColumns = "repeat(4, 1fr)";
  
  export const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeId: 'hybrid',
    tilt: 45,
    heading: 0,
  };
  // utils.js
  
  const categoryIcons = {
    food: '/assets/food.png',
    shopping: '/assets/shopping.png',
    fun: '/assets/fun.png',
    // ...other categories
  };
  // Normalize the distance between minDist and maxDist to a value between 1 and 5
  const normalizeDistance = (distance, minDist = 0, maxDist = 40) => {
    if (distance < minDist) distance = minDist;
    if (distance > maxDist) distance = maxDist;
    return 1 + ((distance - minDist) / (maxDist - minDist)) * 4;
  };
  
  // Calculate the cost based on the normalized distance
  const calculateCost = (normalizedValue) => {
    const baseCost = 5; // Base cost of the trip
    return baseCost + (normalizedValue - 1); // Adjust cost based on normalized value
  };
  
  // Main function to calculate the trip cost based on distance
  export const calculateTripCost = (distance) => {
    const normalizedDistance = normalizeDistance(distance);
    const cost = calculateCost(normalizedDistance);
    return parseFloat(cost.toFixed(2));
  };
  
  // Calculate the distance (in km) and time (in hours) between two geographical points
  export const calculateDistanceAndTime = (start, end) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (end.lat - start.lat) * (Math.PI / 180);
    const dLng = (end.lng - start.lng) * (Math.PI / 180);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(start.lat * (Math.PI / 180)) * Math.cos(end.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
  
    const speed = 25; // Average speed in km/h
    const time = distance / speed;
  
    return { distance, time };
  };
  
  // Function to get latitude and longitude using Google Geocoding API
  export const getLatLng = (address) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') {
          console.log('Geocode results:', results);
          resolve(results[0].geometry.location);
        } else {
          console.error('Geocode error:', status);
          reject(new Error('Geocode was not successful for the following reason: ' + status));
        }
      });
    });
  };
  