// src/components/CarrotRating.js

import React from 'react';
import PropTypes from 'prop-types';

const CarrotRating = ({ rating, size = 'medium' }) => {
  const fullCarrots = Math.floor(rating);
  const hasHalfCarrot = rating % 1 >= 0.5;
  const totalCarrots = 4; // Maximum of 4 carrots

  return (
    <div className="flex items-center">
      {[...Array(totalCarrots)].map((_, i) => (
        <span
          key={i}
          className={`${size === 'small' ? 'text-lg' : 'text-2xl'} ${
            i < fullCarrots
              ? 'text-orange-500'
              : i === fullCarrots && hasHalfCarrot
              ? 'text-orange-300'
              : 'text-gray-300'
          }`}
        >
          🥕
        </span>
      ))}
    </div>
  );
};

CarrotRating.propTypes = {
  rating: PropTypes.number.isRequired,
  size: PropTypes.oneOf(['small', 'medium']),
};

export default CarrotRating;
