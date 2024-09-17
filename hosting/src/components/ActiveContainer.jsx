import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../hooks/firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import GuestChatComponent from './chat/GuestChatComponent';
import ChatComponent from './chat/ChatComponent'; // Unified chat component

const ActiveContainer = ({
  rideRequest,
  cancelAction,
  onAcceptRide,
  appMode,
  hostLocation,
  updateHostLocation
}) => {
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');

  // Fetch chat messages for the ride
  useEffect(() => {
    if (!rideRequest) return;

    const chatRef = collection(db, 'chats');
    const q = query(
      chatRef,
      where('rideId', '==', rideRequest.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChatMessages(fetchedMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [rideRequest]);

  if (!rideRequest) {
    return <div>No active ride request.</div>;
  }

  const sendMessage = async () => {
    // Simulate sending a message for both guest and host
    console.log('Message sent:', chatInput);
    setChatInput(''); // Clear input after sending
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between space-x-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md mb-6">
      {/* Host Chat Component */}
      <div className="w-full lg:w-1/2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Host View</h3>
        <ChatComponent
          chatId={rideRequest.id}
          currentUser={user}
          otherUser={rideRequest.user_uid}
          isHost={true}
        />
      </div>

      {/* Guest Chat Component */}
      <div className="w-full lg:w-1/2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Guest View</h3>
        <GuestChatComponent
          rideId={rideRequest.id}
          hostId={rideRequest.driver_uid}
          hostLocation={hostLocation}
          chatMessages={chatMessages}
          sendMessage={sendMessage}
          chatInput={chatInput}
          setChatInput={setChatInput}
        />
      </div>
    </div>
  );
};

ActiveContainer.propTypes = {
  rideRequest: PropTypes.shape({
    id: PropTypes.string.isRequired,
    pid: PropTypes.string.isRequired,
    priceTotal: PropTypes.string.isRequired,
    user_location: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    }).isRequired,
    destination_location: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired,
    }).isRequired,
    user_name: PropTypes.string.isRequired,
    user_phone_number: PropTypes.string.isRequired,
    is_driver_assigned: PropTypes.bool.isRequired,
    user_uid: PropTypes.string.isRequired,
    driver_uid: PropTypes.string,
  }),
  cancelAction: PropTypes.func.isRequired,
  onAcceptRide: PropTypes.func.isRequired,
  appMode: PropTypes.oneOf(['host', 'rabbit']).isRequired,
  hostLocation: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }),
  updateHostLocation: PropTypes.func,
};

export default ActiveContainer;
