import PropTypes from 'prop-types';

const Dashboard = () => {
  const earnings = 1234; // Replace with dynamic data as needed
  const activeRides = 3; // Replace with dynamic data as needed
  const transactions = [
    { amount: 25, user: 'John D.' },
    { amount: 18, user: 'Sarah M.' },
    { amount: 30, user: 'Alex W.' },
  ]; // Replace with dynamic data as needed
  const bookings = [
    { time: '2:30 PM', description: 'Airport Pickup' },
    { time: '5:00 PM', description: 'Downtown Dropoff' },
    { time: '7:15 PM', description: 'Evening Ride' },
  ]; // Replace with dynamic data as needed

  return (
    <section id="dashboard" className="content-section active flex flex-wrap">
      <div className="w-full lg:w-2/3 pr-0 lg:pr-4 mb-4 lg:mb-0">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardCard title="Total Earnings" value={`$${earnings}`} valueClass="text-green-600" />
          <DashboardCard title="Active Rides" value={activeRides} valueClass="text-blue-600" />
          <DashboardList title="Recent Transactions" items={transactions.map(t => `$${t.amount} - ${t.user}`)} />
          <DashboardList title="Upcoming Bookings" items={bookings.map(b => `${b.time} - ${b.description}`)} />
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
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Dashboard;
