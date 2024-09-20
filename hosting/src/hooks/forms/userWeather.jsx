import { useState, useEffect } from 'react';

const API_KEY = '4c30fb6bdde1f850e52d45d0754fc524';

const useWeather = (lat, lon) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
        );
        if (!response.ok) {
          throw new Error('Weather data not available');
        }
        const data = await response.json();
        setWeather(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (lat && lon) {
      fetchWeather();
    }
  }, [lat, lon]);

  return { weather, loading, error };
};

export default useWeather;