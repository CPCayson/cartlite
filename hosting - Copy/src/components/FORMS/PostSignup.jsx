import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // Import the AuthContext

export default function PostSignup() {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [error, setError] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState(null);
  const [stripeAccountStatus, setStripeAccountStatus] = useState(null);
  const { user } = useAuth(); // Get the current user from AuthContext

  // Fetch user data on component mount and when the user object updates
  useEffect(() => {
    if (user?.email) {
      fetchUserData(user.email);
    }
  }, [user]);

  // Fetch the user's Stripe account data from the backend
  const fetchUserData = async (email) => {
    try {
      setAccountCreatePending(true);
      const token = await user.getIdToken(); // Get the current user's authentication token

      const response = await fetch(`/api/user/${email}`, {
        headers: {
          "Authorization": `Bearer ${token}`,  // Include the authentication token in the request
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }

      const data = await response.json();
      setConnectedAccountId(data.stripeAccountId);  // Set the connected Stripe Account ID
      setStripeAccountStatus(data.stripeAccountStatus);  // Set the Stripe Account status
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(true);
    } finally {
      setAccountCreatePending(false);
    }
  };

  // Handle Stripe onboarding or dashboard redirection
  const handleOnboardingOrDashboard = async () => {
    try {
      setAccountCreatePending(true);
      setError(false);

     // const token = await user.getIdToken(); // Get the current user's authentication token

      if (!connectedAccountId || stripeAccountStatus === 'incomplete') {
        // If account is incomplete, create an onboarding session
        const sessionResponse = await fetch("/api/create-account-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer acct_1PxVQjPxtP6CqxpM",  // Include token in headers
          },
          body: JSON.stringify({ accountId: connectedAccountId, email: user.email }),
        });

        if (!sessionResponse.ok) {
          const sessionErrorText = await sessionResponse.text();
          throw new Error(`HTTP error! status: ${sessionResponse.status}, body: ${sessionErrorText}`);
        }

        const sessionJson = await sessionResponse.json();
        if (sessionJson.url) {
          window.location.href = sessionJson.url;  // Redirect to Stripe onboarding link
        }
      } else {
        // If onboarding is complete, open the Stripe Express Dashboard
        const dashboardResponse = await fetch("/api/create-dashboard-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,  // Include token in headers
          },
          body: JSON.stringify({ accountId: connectedAccountId }),
        });

        if (!dashboardResponse.ok) {
          const dashboardErrorText = await dashboardResponse.text();
          throw new Error(`HTTP error! status: ${dashboardResponse.status}, body: ${dashboardErrorText}`);
        }

        const dashboardJson = await dashboardResponse.json();
        if (dashboardJson.url) {
          window.location.href = dashboardJson.url;  // Redirect to the Stripe Dashboard link
        }
      }
    } catch (error) {
      console.error("Error handling onboarding or dashboard:", error);
      setError(true);
    } finally {
      setAccountCreatePending(false);
    }
  };

  return (
    <div className="container">
      <div className="banner">
        <h2>cartRabbit</h2>
      </div>
      <div className="content">
        <h2>{stripeAccountStatus === 'incomplete' ? 'Finish your Stripe onboarding' : 'Access your Stripe Dashboard'}</h2>
        <p>cartRabbit is the world's leading air travel platform: join our team of pilots to help people travel faster.</p>
        {!accountCreatePending && (
          <div>
            <button onClick={handleOnboardingOrDashboard}>
              {stripeAccountStatus === 'incomplete' ? 'Continue Onboarding' : 'Open Dashboard'}
            </button>
          </div>
        )}
        {accountCreatePending && <p>Loading...</p>}
        {error && <p className="error">Something went wrong! Please try again.</p>}
      </div>
    </div>
  );
}
