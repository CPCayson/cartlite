// FinancialDashboard.js
import useAppState from '../../../../../hooks/useAppState';
import useFinancialData from '../../../../../hooks/auth/useFinancialData';
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


// // FinancialDashboard.jsx

// import React, { useEffect, useRef } from 'react';

// const FinancialDashboard = ({ stripeConnectInstance }) => {
//   const containerRef = useRef(null);

//   useEffect(() => {
//     if (stripeConnectInstance && containerRef.current) {
//       stripeConnectInstance.mount({
//         componentName: 'financial_accounts_overview', // Replace with the desired component name
//         elementOrSelector: containerRef.current,
//         props: {
//           // Pass any required props for the component
//         },
//       });
//     }
//   }, [stripeConnectInstance]);

//   return <div ref={containerRef} style={{ minHeight: '500px' }} />;
// };

// export default FinancialDashboard;

