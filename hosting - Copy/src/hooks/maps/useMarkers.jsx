// src/hooks/useMarkers.jsx

import { useRef, useCallback } from 'react';

export const useMarkers = () => {
  const markersRef = useRef([]);

  const addMarkersToMap = useCallback((map, places) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add place markers
    places.forEach(place => {
      const marker = new window.google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude },
        map: map,
        title: place.name,
        icon: {
          url: "/assets/marker.png",
          scaledSize: new window.google.maps.Size(50, 50),
        }
      });
      markersRef.current.push(marker);
    });
  }, []);

  const navigateToPlace = useCallback((map, place) => {
    if (!map || !place) return;

    const newCenter = { lat: place.latitude, lng: place.longitude };
    const newHeading = Math.random() * 360;
    const newTilt = 65;

    map.panTo(newCenter);
    map.setTilt(newTilt);
    map.setHeading(newHeading);

    // Ensure the marker is updated for the selected place
    const marker = new window.google.maps.Marker({
      position: newCenter,
      map: map,
      title: place.name,
      icon: {
        url: "/assets/serve.png",
        scaledSize: new window.google.maps.Size(60, 60),
      }
    });

    markersRef.current.push(marker);
  }, []);

  return { addMarkersToMap, navigateToPlace };
};



//            Categories, map default settings, category icons, colors, etc.

// // src/utils/constants.js

// export const categories = [
//   { value: 'all', label: 'All', color: '#FFFFFF', location: { lat: 30.2951, lng: -89.3988 } },
//   { value: 'bar', label: 'Bars', color: '#FF0000', location: { lat: 30.3101, lng: -89.3567 } },
//   { value: 'restaurant', label: 'Food', color: '#00FF00', location: { lat: 30.3101, lng: -89.3567 } },
//   { value: 'lodging', label: 'Houses', color: '#0000FF', location: { lat: 30.3101, lng: -89.3567 } },
//   { value: 'accommodation', label: 'Accommodation', color: '#FFFF00', location: { lat: 30.3101, lng: -89.3567 } },
// ];

// export const categoryIcons = {
//   all: '/assets/all.png',
//   bar: '/assets/bar.png',
//   restaurant: '/assets/food.png',
//   lodging: '/assets/house.png',
//   accommodation: '/assets/accommodation.png',
// };

// export const markerSizes = {
//   default: new google.maps.Size(30, 30),
//   user: new google.maps.Size(40, 40),
// };

// export const specialMarkers = {
//   user: '/assets/user-location.png',
//   cart: '/assets/golf-cart.png',
//   default: '/assets/default-marker.png',
// };



// export const categoryColors = {
//   all: '#FFFFFF',
//   bar: '#FF0000',
//   restaurant: '#00FF00',
//   lodging: '#0000FF',
//   accommodation: '#FFFF00',
// };

// export const MAX_DISTANCE = 32.19; // 20 miles in kilometers

// export const mapDefaults = {
//   center: { lat: 30.3088076, lng: -89.3300461 },
//   zoom: 14,
//   mapTypeId: 'hybrid',
//   tilt: 45,
//   heading: 0,
// };


// export const drawerSize = 'md';

// export const firebaseCollections = {
//   places: 'places',
//   carts: 'carts',
// };

// export const dashboardDefaultStats = {
//   totalPlaces: 0,
//   averageRating: 0,
//   mostPopularCategory: 'N/A',
// };

// export const toastConfig = {
//   duration: 5000,
//   isClosable: true,
// };

// export const mapContainerStyle = { width: '100%', height: '100%' };

// export const gridTemplateColumns = "repeat(4, 1fr)";

// export const mapOptions = {
//   disableDefaultUI: true,
//   zoomControl: true,
//   mapTypeId: 'hybrid',
//   tilt: 45,
//   heading: 0,
// };
// // utils.js

// const categoryIcons = {
//   food: '/assets/food.png',
//   shopping: '/assets/shopping.png',
//   fun: '/assets/fun.png',
//   // ...other categories
// };
// // Nor