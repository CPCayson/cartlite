// src/api/googleMapsApi.js
let isScriptLoaded = false;
let loadScriptPromise = null;

export const loadGoogleMapsScript = (apiKey) => {
  if (isScriptLoaded) {
    return loadScriptPromise;
  }
  
  loadScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    window.initMap = () => {
      isScriptLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load the Google Maps script'));
    };
    
    document.head.appendChild(script);
  });
  
  return loadScriptPromise;
};