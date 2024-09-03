// src/api/googleMapsApi.js

let isScriptLoaded = false;
let loadScriptPromise = null;

export const loadGoogleMapsScript = (apiKey) => {
  if (isScriptLoaded) {
    return loadScriptPromise;
  }

  loadScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;  // Load asynchronously to prevent blocking
    script.defer = true;  // Ensures it doesn't execute until page has finished parsing
    script.onload = () => {
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

