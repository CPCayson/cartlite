import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, DirectionsService } from '@react-google-maps/api';
import './book.css'
const Card = ({ card }) => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [active, setActive] = useState(false);

  const mapContainerStyle = {
    width: '100%',
    height: '200px',
  };

  const center = {
    lat: (card.latLngFrom.lat + card.latLngTo.lat) / 2,
    lng: (card.latLngFrom.lng + card.latLngTo.lng) / 2,
  };

  const handleCardClick = () => {
    if (animating) return;
    setAnimating(true);
    setActive(!active);
    setTimeout(() => setAnimating(false), 500); // Simulate animation timing
  };

  useEffect(() => {
    if (!map || !active) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: card.latLngFrom,
        destination: card.latLngTo,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  }, [map, active]);

  return (
    <div className={`card ${active ? 'active' : ''}`} onClick={handleCardClick}>
      <header className="card__header">
        <span className="card__header__id">{card.category}</span>
        <span className="card__header__price">${card.price}</span>
      </header>
      <div className="card__stats" style={{ backgroundImage: `url(${card.bgImgUrl})` }}>
        <div className="card__stats__item">
          <p className="card__stats__type">Ambiance</p>
          <span className="card__stats__value">{card.ambiance}</span>
        </div>
      </div>

      {active && (
        <LoadScript googleMapsApiKey="YOUR_API_KEY">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
            onLoad={mapInstance => setMap(mapInstance)}
          >
            <Marker position={card.latLngFrom} />
            <Marker position={card.latLngTo} />
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </LoadScript>
      )}
    </div>
  );
};

export default Card;
