// import { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
// import { doc, updateDoc } from 'firebase/firestore';
// import useStripeConnectAndBalance from '../../hooks/useStripeConnectAndBalance';
// import useStripeTransactions from '../../hooks/useFinancialData';
// import useHostLocation from '../../hooks/useHostLocation';
// import useRideRequests from '../../hooks/rides/useRideRequests';
// import { Box, VStack, Text, Button } from '@chakra-ui/react';
// import  useAuth  from '../../context/AuthContext';
// import RideRequestList from '../leftpanel/subhost/RideRequestList';
// import AcceptedRideInfo from '../AcceptedRideInfo';
// import ActiveContainer from '../ActiveContainer';
// import DashboardCardGroup from './subhost/DashboardCardGroup';
// import StripeTransactions from './subhost/StripeTransactions';
// import DashboardList from './subhost/DashboardList';
// import { db } from '../../hooks/firebase/firebaseConfig';

// const HostDashboard = ({ selectedRide, onCancelRide }) => {
//   const [earnings] = useState(1234);
//   const [activeRides] = useState(3);
//   const [connectedAccountId, setConnectedAccountId] = useState(null);
//   const [accountLoading, setAccountLoading] = useState(true);
//   const [accountError, setAccountError] = useState(null);
//   const [acceptedRide, setAcceptedRide] = useState(null);

//   const { user } = useAuth();
//   const { rideRequests, loading, error } = useRideRequests(user?.uid);
//   const { getCurrentLocation } = useGeolocation();
  
//   // Fetch Stripe Connect instance and balance
//   const { stripeBalance, loading: loadingBalance } = useStripeConnectAndBalance(connectedAccountId);
//   const { hostLocation, updateHostLocation } = useHostLocation(selectedRide);
//   const { transactions: stripeTransactions, loading: loadingTransactions, error: transactionError, loadMoreTransactions, hasMore } = useStripeTransactions();

//   // Fetch connectedAccountId from an API or Firebase
//   // useEffect(() => {
//   //   const fetchConnectedAccountId = async () => {
//   //     try {
//   //       const response = await fetch('/api/get-connected-account'); // Replace with your actual endpoint
//   //       const data = await response.json();
//   //       setConnectedAccountId(data.accountId); // Assuming the API returns { accountId: "your_account_id" }
//   //       setAccountLoading(false);
//   //     } catch (error) {
//   //       console.error('Error fetching connectedAccountId:', error);
//   //       setAccountError('Failed to fetch connected account.');
//   //       setAccountLoading(false);
//   //     }
//   //   };

//   //   fetchConnectedAccountId();
//   // }, []);

//   const availableRideRequests = rideRequests.filter((request) => !request.is_driver_assigned);

//   const handleAcceptRide = async (rideRequest) => {
//     try {
//       const location = await getCurrentLocation();
//       await updateDoc(doc(db, 'rideRequests', rideRequest.id), {
//         driver_name: user.displayName,
//         driver_location: location,
//         driver_uid: user.uid,
//         is_driver_assigned: true,
//       });
//       setAcceptedRide(rideRequest);
//     } catch (error) {
//       console.error('Error accepting ride:', error);
//       // Handle error (e.g., show an error message to the user)
//     }
//   };

//   const handleCancelRide = async () => {
//     if (!acceptedRide) return;

//     try {
//       await updateDoc(doc(db, 'rideRequests', acceptedRide.id), {
//         driver_name: '',
//         driver_location: '',
//         driver_uid: '',
//         is_driver_assigned: false,
//       });
//       setAcceptedRide(null);
//     } catch (error) {
//       console.error('Error cancelling ride:', error);
//       // Handle error
//     }
//   };



//   return (
//     <Box>
//       {acceptedRide ? (
//         <AcceptedRideInfo ride={acceptedRide} onCancelRide={handleCancelRide} />
//       ) : (
//         <VStack spacing={4} align="stretch">
//           <Text fontSize="xl" fontWeight="bold">Available Ride Requests</Text>
//           <RideRequestList rideRequests={availableRideRequests} onRideAccepted={handleAcceptRide} />
//         </VStack>
//       )}

//       {selectedRide ? (
//         <ActiveContainer
//           rideRequest={selectedRide}
//           cancelAction={handleCancelRide}
//           hostLocation={hostLocation}
//           updateHostLocation={updateHostLocation}
//         />
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//           <div className="lg:col-span-2">
// ol        
//           </div>
//         </div>
//       )}
//     </Box>
//   );
// };

// HostDashboard.propTypes = {
//   selectedRide: PropTypes.object,
//   onCancelRide: PropTypes.func.isRequired,
// };

// export default HostDashboard;

import  { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, VStack, Text } from '@chakra-ui/react';
import useRideRequests from '../../hooks/other/rides/useRideRequests';
import RideRequestList from '../leftpanel/subhost/RideRequestList';
import AcceptedRideInfo from '../AcceptedRideInfo';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../hooks/firebase/firebaseConfig';
import useAppState from '../../hooks/useAppState';

const HostDashboard = ({ selectedRide, onCancelRide }) => {
  const { user, getCurrentLocation } = useAppState();
  const [acceptedRide, setAcceptedRide] = useState(null);
  const { rideRequests, loading, error } = useRideRequests(user?.uid);

  const availableRideRequests = rideRequests.filter((request) => !request.is_driver_assigned);

  const handleAcceptRide = async (rideRequest) => {
    try {
      const location = await getCurrentLocation();
      await updateDoc(doc(db, 'rideRequests', rideRequest.id), {
        driver_uid: user.uid,
        is_driver_assigned: true,
        driver_location: location,
      });
      setAcceptedRide(rideRequest);
    } catch (error) {
      console.error('Error accepting ride:', error);
    }
  };

  return (
    <Box>
      {acceptedRide ? (
        <AcceptedRideInfo ride={acceptedRide} onCancelRide={onCancelRide} />
      ) : (
        <VStack spacing={4} align="stretch">
          <Text fontSize="xl" fontWeight="bold">Available Ride Requests</Text>
          <RideRequestList rideRequests={availableRideRequests} onRideAccepted={handleAcceptRide} />
        </VStack>
      )}
    </Box>
  );
};

HostDashboard.propTypes = {
  selectedRide: PropTypes.object,
  onCancelRide: PropTypes.func.isRequired,
};

export default HostDashboard;

