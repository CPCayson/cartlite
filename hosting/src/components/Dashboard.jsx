
const Dashboard = () => {
  return (
    <section id="dashboard" className="content-section active flex flex-wrap">
      <div className="w-full lg:w-2/3 pr-0 lg:pr-4 mb-4 lg:mb-0">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Total Earnings</h3>
            <p className="text-3xl font-bold text-green-600">$<span id="totalEarnings">1,234</span></p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Active Rides</h3>
            <p className="text-3xl font-bold text-blue-600"><span id="activeRides">3</span></p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Recent Transactions</h3>
            <ul id="transactionsList" className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>$25 - John D.</li>
              <li>$18 - Sarah M.</li>
              <li>$30 - Alex W.</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Upcoming Bookings</h3>
            <ul id="bookingsList" className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>2:30 PM - Airport Pickup</li>
              <li>5:00 PM - Downtown Dropoff</li>
              <li>7:15 PM - Evening Ride</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
