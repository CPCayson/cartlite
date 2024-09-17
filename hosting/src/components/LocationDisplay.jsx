// LocationDisplay.jsx
import PropTypes from 'prop-types';
import React from 'react';

const LocationDisplay = ({ location }) => {
  if (!location) return null;

  return (
    <div className="location-info">
      <p>Your current location: Lat {location.lat}, Lng {location.lng}</p>
    </div>
  );
};

LocationDisplay.propTypes = {
  location: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
};

export default LocationDisplay;