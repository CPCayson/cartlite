// StripeOnboarding.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const StripeOnboarding = () => {
  const { accountId } = useParams();
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccountLink = async () => {
      try {
        const response = await axios.post('https://us-central1-rabbit-2ba47.cloudfunctions.net/createStripeAccountLink_test', {
          accountID: accountId
        });

        setLink(response.data.body.success);
        setLoading(false);
      } catch (error) {
        console.error('Error creating account link:', error);
        setLoading(false);
      }
    };

    fetchAccountLink();
  }, [accountId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Complete Your Stripe Onboarding</h2>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white p-2 rounded">
          Complete Onboarding
        </a>
      ) : (
        <p>Failed to generate onboarding link. Please try again later.</p>
      )}
    </div>
  );
};

export default StripeOnboarding;
