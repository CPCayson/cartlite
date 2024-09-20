import PropTypes from 'prop-types';

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

export default DashboardCard;
