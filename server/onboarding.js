const express = require('express');
const stripe = require('stripe')('sk_test_51PKXFdLZTLOaKlNsdrW06M3v1QLOO1wo2EZ8MtRu0iei3io1zLdYadKIrwE6jR4L28xMq6fGnmreqo0lDF69p2AL00QArFCGwL'); // Replace with your Stripe secret key
const app = express();

app.use(express.json());

// Mock Database (In-memory)
const users = {
  'business1@example.com': { stripeAccountId: null }, // Example user without Stripe account
};

// Serve HTML directly from backend
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Stripe Connect Onboarding</title>
    </head>
    <body>
        <h1>Stripe Connect Onboarding</h1>
        <form id="authForm">
            <input type="email" id="email" placeholder="Enter your business email" required>
            <button type="submit">Sign In / Onboard</button>
        </form>

        <div id="userInfo" style="display: none;">
            <h2>User Information</h2>
            <pre id="accountInfo"></pre>
        </div>

        <script>
            document.getElementById('authForm').addEventListener('submit', async function (e) {
                e.preventDefault();
                const email = document.getElementById('email').value;

                // Check Stripe status
                const response = await fetch('/api/check-stripe-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (data.onboarded) {
                    alert('User is onboarded and can access the platform.');

                    // Fetch user info after onboarding
                    const userInfoResponse = await fetch('/api/get-user-info', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });

                    const userInfo = await userInfoResponse.json();
                    if (userInfo.success) {
                        document.getElementById('userInfo').style.display = 'block';
                        document.getElementById('accountInfo').textContent = JSON.stringify(userInfo.account, null, 2);
                    } else {
                        alert('Error retrieving user information.');
                    }
                } else {
                    // Create a Stripe account link for onboarding
                    const response = await fetch('/api/create-stripe-account-link', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });

                    const data = await response.json();
                    if (data.url) {
                        window.location.href = data.url; // Redirect to Stripe onboarding
                    } else {
                        alert('Error during onboarding process.');
                    }
                }
            });
        </script>
    </body>
    </html>
  `);
});

// Route to check if user is onboarded with Stripe
app.post('/api/check-stripe-status', async (req, res) => {
  const { email } = req.body;
  console.log(`Checking Stripe status for email: ${email}`); // Debugging

  // Check if user exists, if not, add user to the mock database
  if (!users[email]) {
    console.log('User not found, adding to mock database.');
    users[email] = { stripeAccountId: null };
  }

  const user = users[email];

  if (user.stripeAccountId) {
    try {
      const account = await stripe.accounts.retrieve(user.stripeAccountId);
      if (account.details_submitted) {
        console.log('Account details submitted');
        return res.json({ onboarded: true });
      }
    } catch (error) {
      console.error('Error retrieving Stripe account:', error); // Debugging
      return res.status(500).json({ message: 'Error retrieving Stripe account' });
    }
  }

  // User not onboarded
  console.log('User not onboarded');
  res.json({ onboarded: false });
});

// Route to create a new Stripe account link for onboarding
app.post('/api/create-stripe-account-link', async (req, res) => {
  const { email } = req.body;
  console.log(`Creating Stripe account link for email: ${email}`); // Debugging

  const user = users[email];

  if (!user) {
    console.log('User not found');
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    const account = await stripe.accounts.create({
      type: 'express',
      business_type: 'individual', // Could be 'individual' or 'company'
      company: {
        name: 'CaysonPoint STUDIO LLC: CartRabbit',
        address: {
          line1: '117 Demontluzen Ave',
          city: 'Bay Saint Louis',
          state: 'MS',
          postal_code: '39520',
          country: 'US',
        },
      },
      business_profile: {
        url: 'https://cart-rabbit.com', // Business website
        mcc: '4121', // Merchant Category Code (MCC) for ride-sharing services
        product_description: 'We provide high-quality software products for ride-share delivery services.',
      },
    });

    // Update user in database with Stripe account ID
    user.stripeAccountId = account.id;

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:3000/',
      return_url: 'http://localhost:3000/',
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating Stripe account link:', error); // Debugging
    res.status(500).json({ message: 'Error creating Stripe account link' });
  }
});

// Route to retrieve user information after successful onboarding
app.post('/api/get-user-info', async (req, res) => {
  const { email } = req.body;
  console.log(`Retrieving user information for email: ${email}`); // Debugging

  const user = users[email];

  if (!user || !user.stripeAccountId) {
    console.log('User or Stripe account not found');
    return res.status(404).json({ message: 'User or Stripe account not found' });
  }

  try {
    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    console.log('Stripe Account Details:', account); // Log the account details to debug

    res.json({ success: true, account });
  } catch (error) {
    console.error('Error retrieving user information:', error); // Debugging
    res.status(500).json({ message: 'Error retrieving user information' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});