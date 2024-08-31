// src/utils/googleMapsUtils.js

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