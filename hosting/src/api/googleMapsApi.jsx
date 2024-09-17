// Ensure this is called only once in your app
let googleMapsScriptLoaded = false;

export const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (googleMapsScriptLoaded) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      googleMapsScriptLoaded = true;
      resolve();
    };

    script.onerror = (error) => reject(error);

    document.head.appendChild(script);
  });
};
