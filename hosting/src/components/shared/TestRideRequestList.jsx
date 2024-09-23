import React from 'react';
import ReactDOM from 'react-dom/client';
import RideRequestList from './RideRequestList';
import { RideProvider } from '../../context/RideContext';
import { BusinessProvider } from '../../context/BusinessContext'; 

// Sample ride request data
const sampleRideRequests = [
  { id: '1', user_location: 'Location A', destination_location: 'Location B', rideFee: 10 },
  { id: '2', user_location: 'Location C', destination_location: 'Location D', rideFee: 15 },
];

const handleRideAccepted = (ride) => {
  console.log('Ride accepted:', ride);
  // Add your logic here for handling ride acceptance
};

const App = () => (
  <RideProvider>
    <BusinessProvider>
      <RideRequestList rideRequests={sampleRideRequests} onRideAccepted={handleRideAccepted} />
    </BusinessProvider>
  </RideProvider>
);

const root = ReactDOM.createRoot(document.getElementById('test-root'));
root.render(<App />);
