export const calculateDistanceAndTime = (start, end) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (end.lat - start.lat) * (Math.PI / 180);
  const dLng = (end.lng - start.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(start.lat * (Math.PI / 180)) * Math.cos(end.lat * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  const speed = 25; // Average speed in km/h
  const time = distance / speed;

  return { distance, time };
};

export const normalizeDistance = (distance, minDist = 0, maxDist = 3) => {
  if (distance < minDist) distance = minDist;
  if (distance > maxDist) distance = maxDist;
  return 1 + ((distance - minDist) / (maxDist - minDist)) * 4;
};



// Calculate the cost based on the normalized distance
const calculateCost = (normalizedValue) => {
  const baseCost = 5; // Base cost of the trip
  return baseCost + (normalizedValue - 1); // Adjust cost based on normalized value
};

// Main function to calculate the trip cost based on distance
export const calculateTripCost = (distance) => {
  const normalizedDistance = normalizeDistance(distance);
  const cost = calculateCost(normalizedDistance);
  return parseFloat(cost.toFixed(2));
};
