// src/api/googleMapAspi.js

let isScriptLoaded = false;
let loadScriptPromise = null;

/**
 * Loads the Google Maps JavaScript API into the page.
 *
 * @param {string} apiKey The API key to use when loading the script.
 * @returns {Promise} A promise that resolves when the script has been loaded
 * successfully, or rejects if the script load fails.
 */
export const loadGoogleMapsScript = (apiKey) => {
  if (isScriptLoaded) {
    return loadScriptPromise;
  }

  loadScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
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
