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
