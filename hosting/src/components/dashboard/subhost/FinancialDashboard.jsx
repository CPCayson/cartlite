// FinancialDashboard.js
import useAppState from '../../../hooks/useAppState';
import useFinancialData from '../../../hooks/useFinancialData';
import DashboardCardGroup from './DashboardCardGroup';
import StripeTransactions from './StripeTransactions';

const FinancialDashboard = () => {
  const { user } = useAppState();
  const {
    financialAccount,
    loadingFinancialAccount,
    financialAccountError,
  
  } = useFinancialData(user.id); // Assuming we need to pass user id to fetch financial data

  return (
    <div>
      <h2>Financial Dashboard</h2>
      {/* Dashboard Cards */}
      <DashboardCardGroup
        financialAccount={financialAccount}
        loadingFinancialAccount={loadingFinancialAccount}
        financialAccountError={financialAccountError}
      />
      {/* Stripe Transactions */}
      <StripeTransactions />
    </div>
  );
};

export default FinancialDashboard;
