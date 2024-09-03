import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SearchBar from './SearchBar';
import { listenToRideRequests, updateBooking } from '../api/firebaseApi'; // Import Firebase functions
import { handleCreateStripeOnboarding, handleCreateCheckoutSession, handleCapturePaymentIntent, handleCancelPaymentIntent } from '../api/stripeApi';

const Dashboard = ({ appMode, selectedItem }) => {
  const [earnings, setEarnings] = useState(1234); // Example static data; replace with fetched data
  const [activeRides, setActiveRides] = useState(3); // Example static data; replace with fetched data
  const [transactions, setTransactions] = useState([]); // Replacing with dynamic data from Firebase
  const [bookings, setBookings] = useState([
    { time: '2:30 PM', description: 'Airport Pickup' },
    { time: '5:00 PM', description: 'Downtown Dropoff' },
    { time: '7:15 PM', description: 'Evening Ride' },
  ]); // Example static data; replace with fetched data
  const [stripeBalance, setStripeBalance] = useState(null);
  const [stripeTransactions, setStripeTransactions] = useState([]);
  const [message, setMessage] = useState(''); // For displaying messages or errors
  const [email, setEmail] = useState(''); // For Stripe onboarding and sessions
  const [paymentIntentId, setPaymentIntentId] = useState(null); // To store PaymentIntent ID for the chat component

  // Fetch ride requests where is_driver_assigned is false
  useEffect(() => {
    const unsubscribe = listenToRideRequests((rideRequests) => {
      setTransactions(rideRequests);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Fetch Stripe data (balance and transactions)
  useEffect(() => {
    const fetchStripeData = async () => {
      try {
        // Fetch Stripe Balance
        const balanceResponse = await fetch('/api/stripe-balance');
        if (!balanceResponse.ok) throw new Error(`HTTP error! Status: ${balanceResponse.status}`);
        const balanceData = await balanceResponse.json();
        setStripeBalance(balanceData.balance);

        // Fetch Stripe Transactions
        const transactionsResponse = await fetch('/api/stripe-transactions');
        if (!transactionsResponse.ok) throw new Error(`HTTP error! Status: ${transactionsResponse.status}`);
        const transactionsData = await transactionsResponse.json();

        if (Array.isArray(transactionsData.transactions)) {
          setStripeTransactions(transactionsData.transactions);
        } else {
          console.error('Unexpected data format for transactions:', transactionsData);
          setStripeTransactions([]); // Ensure it's always an array
        }
      } catch (error) {
        console.error('Error fetching Stripe data:', error);
        setMessage(`Error fetching Stripe data: ${error.message}`);
      }
    };

    fetchStripeData();
  }, []);

  const startStripeOnboarding = async () => {
    try {
      const response = await handleCreateStripeOnboarding(email);
      window.location.href = response.url; // Redirect to Stripe onboarding
    } catch (error) {
      console.error('Error starting Stripe onboarding:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const createStripeCheckoutSession = async () => {
    try {
      const response = await handleCreateCheckoutSession(1000, email); // Example amount in cents
      window.location.href = response.url; // Redirect to Stripe Checkout
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const captureStripePaymentIntent = async () => {
    try {
      if (!paymentIntentId) {
        throw new Error('Payment Intent ID is missing.');
      }
      const response = await handleCapturePaymentIntent(paymentIntentId); // Pass necessary params
      setMessage(`Payment Intent captured: ${response.id}`);
    } catch (error) {
      console.error('Error capturing payment intent:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const cancelStripePaymentIntent = async () => {
    try {
      if (!paymentIntentId) {
        throw new Error('Payment Intent ID is missing.');
      }
      const response = await handleCancelPaymentIntent(paymentIntentId); // Pass necessary params
      setMessage(`Payment Intent canceled: ${response.id}`);
    } catch (error) {
      console.error('Error canceling payment intent:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  // Handle accepting a ride request
  const handleAcceptRide = async (ride) => {
    try {
      await updateBooking(ride.id, { is_driver_assigned: true });
      setPaymentIntentId(ride.paymentIntentId); // Set PaymentIntent ID for the chat component
      setTransactions((prevTransactions) =>
        prevTransactions.filter((transaction) => transaction.id !== ride.id)
      );
    } catch (error) {
      console.error('Error accepting ride:', error);
      setMessage(`Error accepting ride: ${error.message}`);
    }
  };

  return (
    <section id="dashboard" className="content-section active flex flex-wrap">
      <div className="w-full lg:w-2/3 pr-0 lg:pr-4 mb-4 lg:mb-0">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Dashboard Overview</h2>
        {appMode === 'rabbit' && selectedItem ? (
          <>
            <SearchBar />
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Selected Place</h3>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Name:</strong> {selectedItem.name}<br />
                <strong>Type:</strong> {selectedItem.type}<br />
                <strong>Description:</strong> {selectedItem.description || "A wonderful place to visit."}
              </p>
              <button onClick={createStripeCheckoutSession} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">
                Checkout
              </button>
            </div>
          </>
        ) : appMode === 'host' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DashboardCard title="Total Earnings" value={`$${earnings}`} valueClass="text-green-600" />
            <DashboardCard title="Active Rides" value={activeRides} valueClass="text-blue-600" />
            <DashboardCard title="Stripe Balance" value={`${stripeBalance ? stripeBalance.available[0].amount / 100 : 'Loading...'}`} valueClass="text-purple-600" />
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
        ) : (
          <div className="text-gray-600 dark:text-gray-300">
            Select a place from the left panel to see its details.
          </div>
        )}

        <div className="mt-4">
          <button onClick={startStripeOnboarding} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
            Start Onboarding
          </button>
          <button onClick={createStripeCheckoutSession} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
            Create Checkout Session
          </button>
          <button onClick={captureStripePaymentIntent} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2">
            Capture Payment Intent
          </button>
          <button onClick={cancelStripePaymentIntent} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Cancel Payment Intent
          </button>
          {message && <p className="mt-2 text-red-500">{message}</p>}
        </div>
      </div>
    </section>
  );
};

const DashboardCard = ({ title, value, valueClass }) => (
  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{title}</h3>
    <p className={`text-3xl font-bold ${valueClass}`}>{value}</p>
  </div>
);

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  valueClass: PropTypes.string,
};

const DashboardList = ({ title, items }) => (
  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{title}</h3>
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
  appMode: PropTypes.string.isRequired, // 'rabbit' or 'host'
  selectedItem: PropTypes.object, // Object containing the selected item's details
};

export default Dashboard;
