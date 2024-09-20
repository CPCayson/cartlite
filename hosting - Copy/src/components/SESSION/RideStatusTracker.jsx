// import React from 'react';
// import PropTypes from 'prop-types';
// import { doc, onSnapshot, collection, addDoc, query, orderBy, limit } from 'firebase/firestore';
// import { db } from '../hooks/firebase/firebaseConfig';
// import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import useWeather from '../hooks/other/rides/userWeather';

// // Replace with actual icon paths
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: import('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: import('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: import('leaflet/dist/images/marker-shadow.png'),
// });

// const RideStatusTracker = ({ rideRequestId }) => {
//     const [rideStatus, setRideStatus] = React.useState(null);
//     const [loading, setLoading] = React.useState(true);
//     const [countdown, setCountdown] = React.useState(300); // 5 minutes in seconds
//     const [driverPath, setDriverPath] = React.useState([]);
//     const [messages, setMessages] = React.useState([]);
//     const [newMessage, setNewMessage] = React.useState('');
//     const mapRef = React.useRef();
  
//     // Use the custom weather hook
//     const { weather, loading: weatherLoading, error: weatherError } = useWeather(
//       rideStatus?.user_location?.latitude,
//       rideStatus?.user_location?.longitude
//     );

//     // Fetch ride request data from Firestore
//     React.useEffect(() => {
//       const rideRequestId ='825EuIU3kXq6MGSw14h4';
//         const rideRef = doc(db, 'rideRequests', rideRequestId);
//         const unsubscribe = onSnapshot(rideRef, (doc) => {
//             if (doc.exists()) {
//                 const data = doc.data();
//                 // Only set relevant fields if they exist
//                 setRideStatus({
//                     createdAt: data.createdAt || null,
//                     destination_location: data.destination_location || "N/A",
//                     hostId: data.hostId || "Unknown",
//                     id: data.id || "Unknown",
//                     is_driver_assigned: data.is_driver_assigned || false,
//                     paymentIntentId: data.paymentIntentId || "Unknown",
//                     rideFee: data.rideFee || 0,
//                     status: data.status || "pending",
//                     user_email: data.user_email || "Unknown",
//                     user_location: data.user_location || "Unknown",
//                     user_uid: data.user_uid || "Unknown"
//                 });
//                 setLoading(false);
//             } else {
//                 console.error("No ride request found");
//                 setLoading(false);
//             }
//         }, (error) => {
//             console.error("Error fetching ride status:", error);
//             setLoading(false);
//         });

//         return () => unsubscribe();
//     }, [rideRequestId]);

//     // Countdown for ride cancellation
//     React.useEffect(() => {
//         if (rideStatus && rideStatus.is_driver_assigned && countdown > 0) {
//             const timer = setInterval(() => {
//                 setCountdown(prevCount => prevCount - 1);
//             }, 1000);
//             return () => clearInterval(timer);
//         }
//     }, [rideStatus, countdown]);

//     // Fetch chat messages from Firestore
//     React.useEffect(() => {
//         const chatRef = collection(db, 'rideRequests', rideRequestId, 'messages');
//         const q = query(chatRef, orderBy('timestamp', 'desc'), limit(20));
//         const unsubscribe = onSnapshot(q, (snapshot) => {
//             const newMessages = snapshot.docs.map(doc => ({
//                 id: doc.id,
//                 ...doc.data()
//             })).reverse();
//             setMessages(newMessages);
//         });

//         return () => unsubscribe();
//     }, [rideRequestId]);

//     // Send a chat message
//     const handleSendMessage = async (e) => {
//         e.preventDefault();
//         if (newMessage.trim() === '') return;

//         try {
//             await addDoc(collection(db, 'rideRequests', rideRequestId, 'messages'), {
//                 text: newMessage.trim(),
//                 sender: 'user',
//                 timestamp: new Date()
//             });
//             setNewMessage('');
//         } catch (error) {
//             console.error("Error sending message:", error);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="loading-spinner">
//                 <div className="spinner"></div>
//                 <p>Connecting you with a driver...</p>
//             </div>
//         );
//     }

//     if (!rideStatus) {
//         return <div>Error loading ride status. Please try again.</div>;
//     }

//     return (
//         <div className="ride-status-tracker">
//             <h2>Your Ride Status</h2>
            
//             <div className="status-container">
//                 <p><strong>Status:</strong> {rideStatus.status}</p>
//                 <p><strong>Pickup Location:</strong> {rideStatus.user_location}</p>
//                 <p><strong>Destination Location:</strong> {rideStatus.destination_location}</p>
//                 <p><strong>Ride Fee:</strong> ${rideStatus.rideFee.toFixed(2)}</p>
                
//                 {rideStatus.is_driver_assigned ? (
//                     <div className="status-indicator assigned">Driver Assigned!</div>
//                 ) : (
//                     <div className="status-indicator pending">Waiting for Driver...</div>
//                 )}
//             </div>

//             {!weatherLoading && !weatherError && weather && (
//                 <div className="weather-info">
//                     <h3>Weather at Pickup</h3>
//                     <p>{weather.weather[0].description}</p>
//                     <p>Temperature: {Math.round(weather.main.temp)}°F</p>
//                     <p>Feels like: {Math.round(weather.main.feels_like)}°F</p>
//                     <p>Humidity: {weather.main.humidity}%</p>
//                     <p>Wind: {Math.round(weather.wind.speed)} mph</p>
//                 </div>
//             )}

//             {weatherError && (
//                 <div className="weather-info error">
//                     <p>Unable to load weather information</p>
//                 </div>
//             )}

//             <div className="countdown-timer">
//                 {countdown > 0 ? (
//                     <p>You can cancel in: {Math.floor(countdown / 60)}:{countdown % 60 < 10 ? '0' : ''}{countdown % 60}</p>
//                 ) : (
//                     <p>You can now cancel your ride if needed</p>
//                 )}
//             </div>

//             {rideStatus.is_driver_assigned && (
//                 <div className="map-container">
//                     <MapContainer 
//                         center={[rideStatus.user_location.latitude, rideStatus.user_location.longitude]} 
//                         zoom={13} 
//                         style={{height: '400px', width: '100%'}}
//                         ref={mapRef}
//                     >
//                         <TileLayer
//                             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                         />
//                         <Marker position={[rideStatus.user_location.latitude, rideStatus.user_location.longitude]}>
//                             <Popup>Your pickup location</Popup>
//                         </Marker>
//                     </MapContainer>
//                 </div>
//             )}

//             <div className="chat-container">
//                 <h3>Chat with Driver</h3>
//                 <div className="messages">
//                     {messages.map(message => (
//                         <div key={message.id} className={`message ${message.sender}`}>
//                             {message.text}
//                         </div>
//                     ))}
//                 </div>
//                 <form onSubmit={handleSendMessage}>
//                     <input 
//                         type="text" 
//                         value={newMessage} 
//                         onChange={(e) => setNewMessage(e.target.value)} 
//                         placeholder="Type a message..."
//                     />
//                     <button type="submit">Send</button>
//                 </form>
//             </div>

//             <div className="ride-actions">
//                 <button className="contact-driver">Contact Driver</button>
//                 <button className="cancel-ride" disabled={countdown > 0}>
//                     {countdown > 0 ? `Cancel (${Math.floor(countdown / 60)}:${countdown % 60 < 10 ? '0' : ''}${countdown % 60})` : 'Cancel Ride'}
//                 </button>
//             </div>
//         </div>
//     );
// };

// RideStatusTracker.propTypes = {
//     rideRequestId: PropTypes.string.isRequired,
// };

// export default RideStatusTracker;

// src/components/RideStatusTracker.jsx

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Text } from '@chakra-ui/react';
import { db } from '../../hooks/firebase/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

/**
 * RideStatusTracker component displays the current status of a ride.
 */
<RideStatusTracker
/>

const RideStatusTracker = ({ rideRequestId = '' }) => {
  const [status, setStatus] = useState('Pending');

  useEffect(() => {
    if (!rideRequestId) return;

    const rideRequestRef = doc(db, 'rideRequests', rideRequestId);

    // Other logic to track the ride status using Firestore...
  }, [rideRequestId]);

  return (
    <div>
      {/* Render status information here */}
      <p>Ride Status: {status}</p>
    </div>
  );
};


RideStatusTracker.propTypes = {
  rideRequestId: PropTypes.string.isRequired,
};

export default RideStatusTracker;
