import DashboardCard from './DashboardCard';
import PropTypes from 'prop-types';

const DashboardCardGroup = ({ financialAccount, loadingFinancialAccount, financialAccountError }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Financial Account Information */}
      {loadingFinancialAccount ? (
        <DashboardCard title="Financial Account" value="Loading..." />
      ) : financialAccountError ? (
        <DashboardCard title="Financial Account" value={financialAccountError} />
      ) : (
        <DashboardCard title="Financial Account" value={financialAccount.account_number} />
      )}
    </div>
  );
};

DashboardCardGroup.propTypes = {
  financialAccount: PropTypes.object,
  loadingFinancialAccount: PropTypes.bool.isRequired,
  financialAccountError: PropTypes.string,
};

export default DashboardCardGroup;
