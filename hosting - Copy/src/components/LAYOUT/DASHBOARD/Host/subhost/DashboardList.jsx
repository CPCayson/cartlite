import PropTypes from 'prop-types';

const DashboardList = ({ title, items }) => (
  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md mt-4">
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

export default DashboardList;
