
// StripeTransactions.js
import React from 'react';
import useFinancialData from '../../../../../hooks/auth/useFinancialData';
import useAppState from '../../../../../hooks/useAppState';

const StripeTransactions = () => {
  const { user } = useAppState();
  const {
    transactions,
    loadingTransactions,
    transactionError,
    loadMoreTransactions,
    hasMore,
  } = useFinancialData(user.id); // Assuming we need to pass user id to fetch financial data

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-4">Stripe Transactions</h3>
      {loadingTransactions && <p>Loading transactions...</p>}
      {transactionError && <p>{transactionError}</p>}
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>{transaction.details}</li>
        ))}
      </ul>
      {hasMore && !loadingTransactions && (
        <button onClick={loadMoreTransactions} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">
          Load More Transactions
        </button>
      )}
    </div>
  );
};

export default StripeTransactions;
