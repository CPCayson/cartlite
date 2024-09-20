// src/utils/googleMapsUtils.js
//This file is important as it centralizes utility functions related to Google Maps. By separating these functions, you maintain a clean codebase where each file has a single responsibility. Functions like initializeMap and addMarker are reusable across different components that might need to interact with Google Maps.
//            fetchPlaces(map, category, setPlaces, callback): Fetch places using Google Places API.
// createMarkers(map, places, category, categories): Create markers on the map.
//loadGoogleMapsAPI(): Dynamically load the Google Maps API script.
export const initializeMap = (mapElement, options) => {
    const map = new window.google.maps.Map(mapElement, options);
    return map;
};  
  export const addMarker = (map, position, options) => {
    const marker = new window.google.maps.Marker({
      position,
      map,
      ...options,
    });
    return marker;
  };  

  