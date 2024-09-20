// useFinancialData.js

import { useState, useEffect } from 'react';
import axios from 'axios';

export const useFinancialData = () => {
  // State for financial account
  const [financialAccount, setFinancialAccount] = useState(null);
  const [loadingFinancialAccount, setLoadingFinancialAccount] = useState(true);
  const [financialAccountError, setFinancialAccountError] = useState(null);

  // State for Stripe transactions
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState(null);

  // Fetch financial account data
  const fetchFinancialAccount = async () => {
    setLoadingFinancialAccount(true);
    try {
      const response = await fetch('/api/financial_account'); // Update endpoint as needed
      const json = await response.json();
      setFinancialAccount(json.financial_account);
    } catch (error) {
      setFinancialAccountError('Error fetching financial account data.');
    } finally {
      setLoadingFinancialAccount(false);
    }
  };

  // Fetch Stripe transactions data
  const fetchTransactions = async (startingAfter = null) => {
    setLoadingTransactions(true);
    setTransactionError(null);

    try {
      const response = await axios.get('/api/stripe-transactions', {
        params: { starting_after: startingAfter },
      });

      const { transactions: newTransactions, has_more, last_transaction_id } = response.data;

      setTransactions((prev) => [...prev, ...newTransactions]);
      setHasMore(has_more);
      setLastTransactionId(last_transaction_id);
    } catch (error) {
      console.error('Error fetching Stripe transactions:', error);
      setTransactionError('Failed to fetch Stripe transactions.');
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Load more transactions
  const loadMoreTransactions = () => {
    if (hasMore && lastTransactionId) {
      fetchTransactions(lastTransactionId);
    }
  };

  // Fetch financial account and initial transactions on component mount
  useEffect(() => {
    fetchFinancialAccount();
    fetchTransactions();
  }, []);

  return {
    // Financial account data
    financialAccount,
    loadingFinancialAccount,
    financialAccountError,

    // Transactions data
    transactions,
    loadingTransactions,
    transactionError,
    loadMoreTransactions,
    hasMore,
  };
};

export default useFinancialData;
