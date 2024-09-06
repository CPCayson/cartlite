
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SearchBar from './SearchBar';
import { listenToRideRequests, updateBooking } from '../api/firebaseApi';
import { handleCreateCheckoutSession, handleCancelPaymentIntent } from '../api/stripeApi';

const Dashboard = ({ 
  appMode, 
  selectedItem, 
  paymentIntentStatus,
  onSearchDestinationSelect,
  onSearchPickupSelect,
  createStripeCheckoutSession 
}) => {
  const [earnings] = useState(1234); // Example constant value
  const [activeRides] = useState(3); // Example constant value
  const [transactions, setTransactions] = useState([]);
  const [bookings] = useState([
    { time: '2:30 PM', description: 'Airport Pickup' },
    { time: '5:00 PM', description: 'Downtown Dropoff' },
    { time: '7:15 PM', description: 'Evening Ride' },
  ]);
  const [stripeBalance, setStripeBalance] = useState(null);
  const [stripeTransactions, setStripeTransactions] = useState([]);
  const [message, setMessage] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState(null);

  // Listen to ride requests and update transactions
  useEffect(() => {
    const unsubscribe = listenToRideRequests((rideRequests) => {
      setTransactions(rideRequests);
    });

    return () => unsubscribe();
  }, [appMode, selectedItem]);

  // Fetch Stripe balance and transactions only for host mode
  useEffect(() => {
    if (appMode === 'host') {
      const fetchStripeData = async () => {
        try {
          const balanceResponse = await fetch('/api/stripe-balance');
          const balanceData = await balanceResponse.json();
          setStripeBalance(balanceData.balance);

          const transactionsResponse = await fetch('/api/stripe-transactions');
          const transactionsData = await transactionsResponse.json();

          setStripeTransactions(transactionsData.transactions || []);
        } catch (error) {
          console.error('Error fetching Stripe data:', error);
          setMessage(`Error fetching Stripe data: ${error.message}`);
        }
      };

      fetchStripeData();
    }
  }, [appMode]);

  const handlePaymentIntentUpdate = (paymentIntentId, status) => {
    setPaymentIntentId(paymentIntentId);
    setMessage(`Payment Intent ${status}`);
  };

  const handleBookingConfirmation = (bookingDetails) => {
    setMessage(`Booking confirmed for ride ID: ${bookingDetails.rideId} with amount: $${bookingDetails.amount}`);
    onSearchDestinationSelect(bookingDetails.destination);
    onSearchPickupSelect(bookingDetails.pickup);
  };



  const cancelStripePaymentIntent = async () => {
    try {
      const response = await handleCancelPaymentIntent(paymentIntentId);
      setMessage(`Payment Intent canceled: ${response.id}`);
    } catch (error) {
      console.error('Error canceling payment intent:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleAcceptRide = async (ride) => {
    try {
      await updateBooking(ride.id, { is_driver_assigned: true });
      setPaymentIntentId(ride.paymentIntentId);
      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction.id !== ride.id)
      );
    } catch (error) {
      console.error('Error accepting ride:', error);
      setMessage(`Error accepting ride: ${error.message}`);
    }
  };

  return (
    <section id="dashboard" className="content-section active w-full h-full min-h-0 flex flex-col bg-white dark:bg-gray-800 text-gray-800 dark:text-white transition-colors duration-200">
           {appMode === 'rabbit' && !selectedItem && (
          <SearchBar
            paymentIntentId={paymentIntentId}
            paymentIntentStatus={paymentIntentStatus}
            onPaymentIntentUpdate={handlePaymentIntentUpdate}
            onBookRide={handleBookingConfirmation}
            onCreateCheckoutSession={createStripeCheckoutSession}
            onDestinationSelect={onSearchDestinationSelect}
            onPickupSelect={onSearchPickupSelect}
          />
        )}
      <div className="flex-grow overflow-auto p-4">
      <button onClick={handleBookingConfirmation} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
          Search The Town
        </button>
        <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>

        {/* Display selected item in both rabbit and host modes */}
        {selectedItem && (
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-lg font-semibold mb-2">Selected Place</h3>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Name:</strong> {selectedItem.name}<br />
              <strong>Type:</strong> {selectedItem.type_of_place}<br />
              <strong>Description:</strong> {selectedItem.description || "A wonderful place to visit."}
            </p>
            <button onClick={() => createStripeCheckoutSession(1000)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">
              Checkout
            </button>
          </div>
        )}

        {/* Host mode */}
        {appMode === 'host' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <DashboardCard title="Total Earnings" value={`$${earnings}`} valueClass="text-green-600 dark:text-green-400" />
            <DashboardCard title="Active Rides" value={activeRides} valueClass="text-blue-600 dark:text-blue-400" />
            <DashboardCard title="Stripe Balance" value={`${stripeBalance ? stripeBalance.available[0].amount / 100 : 'Loading...'}`} valueClass="text-purple-600 dark:text-purple-400" />
            <DashboardList title="Available Ride Requests" items={transactions.map(t => (
              <div key={t.id} className="flex justify-between items-center">
                <span>{t.user_name} - {t.rideFee}</span>
                <button onClick={() => handleAcceptRide(t)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
                  Accept
                </button>
              </div>
            ))} />
            <DashboardList title="Stripe Transactions" items={stripeTransactions.map(t => `${t.amount / 100} - ${t.description}`)} />
            <DashboardList title="Upcoming Bookings" items={bookings.map(b => `${b.time} - ${b.description}`)} />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={cancelStripePaymentIntent} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Cancel Payment Intent
        </button>
        <button onClick={cancelStripePaymentIntent} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Get a ride
        </button>
        {message && <p className="mt-2 text-red-500 dark:text-red-400">{message}</p>}
      </div>
    </section>
  );
};

// DashboardCard component
const DashboardCard = ({ title, value, valueClass }) => (
  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className={`text-3xl font-bold ${valueClass}`}>{value}</p>
  </div>
);
DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  valueClass: PropTypes.string,
};

// DashboardList component
const DashboardList = ({ title, items }) => (
  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);
DashboardList.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.node).isRequired,
};


Dashboard.propTypes = {
  appMode: PropTypes.string.isRequired,
  selectedItem: PropTypes.object,
  onSearchDestinationSelect: PropTypes.func.isRequired,
  onSearchPickupSelect: PropTypes.func.isRequired,
  createStripeCheckoutSession: PropTypes.func, // Optional prop
};

export default Dashboard;
