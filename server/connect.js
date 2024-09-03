const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Stripe = require('stripe');
const app = express();
app.use(express.json());

// Set your secret key. Remember to switch to your live secret key in production.
const stripe = Stripe('sk_test_51PKXFdLZTLOaKlNsdrW06M3v1QLOO1wo2EZ8MtRu0iei3io1zLdYadKIrwE6jR4L28xMq6fGnmreqo0lDF69p2AL00QArFCGwL');

// Serve the HTML file with embedded client-side JavaScript
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to create an account session
app.post('/account_session', async (req, res) => {
  try {
    const accountSession = await stripe.accountSessions.create({
      account: 'acct_123ABC', // Replace with actual connected account ID
      components: {
        financial_account: {
          enabled: true,
          features: {
            money_movement: true,
            external_account_collection: true,
          },
        },
      },
    });

    res.json({ client_secret: accountSession.client_secret });
  } catch (error) {
    console.error('Error creating account session:', error);
    res.status(500).send('Error creating account session');
  }
});

// Webhook endpoint to handle events from Stripe
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'whsec_...'; // Replace with your webhook secret

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payout.failed') {
    const payout = event.data.object;
    const connectedAccountId = event.account;
    handleFailedPayout(connectedAccountId, payout);
  }

  res.json({ received: true });
});

const handleFailedPayout = (connectedAccountId, payout) => {
  console.log('Connected account ID:', connectedAccountId);
  console.log('Payout:', JSON.stringify(payout));
};

// Middleware to add Content Security Policy headers
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "frame-src https://connect-js.stripe.com https://js.stripe.com; img-src https://*.stripe.com; script-src https://connect-js.stripe.com https://js.stripe.com; style-src sha256-0hAheEzaMe6uXIKV4EehS9pu1am1lj/KnnzrOYqckXk=");
  next();
});

app.listen(4242, () => console.log('Node server listening on port 4242!'));

// The HTML file content with embedded client-side JS
const fs = require('fs');

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stripe Connect Example</title>
  <script src="https://js.stripe.com/connect/v1"></script>
</head>
<body>
  <h1>Stripe Connect Financial Account</h1>
  <div id="stripe-connect-container"></div>
  <script type="module">
    import { loadConnectAndInitialize } from "@stripe/connect-js";
    import { ConnectFinancialAccount, ConnectComponentsProvider } from "@stripe/react-connect-js";

    const fetchClientSecret = async () => {
      const response = await fetch('/account_session', { method: 'POST' });
      const { client_secret: clientSecret } = await response.json();
      return clientSecret;
    };

    const initializeStripeConnect = async () => {
      const clientSecret = await fetchClientSecret();
      const stripeConnectInstance = await loadConnectAndInitialize({
        publishableKey: "pk_test_51PKXFdLZTLOaKlNslmwEPt9pWm5uS9ZyOsr5gXeJKCmLal5nT1gofFJm2icRtOJgxEhs5265M6LRpSGPHEHydRna00CVialgWd",
        fetchClientSecret: fetchClientSecret,
      });

      const container = document.getElementById('stripe-connect-container');
      ReactDOM.render(
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
          <ConnectFinancialAccount financialAccount="fin_123ABC" />
        </ConnectComponentsProvider>,
        container
      );
    };

    initializeStripeConnect();
  </script>
</body>
</html>
`;

// Write the HTML content to a file
fs.writeFileSync(path.join(__dirname, 'index.html'), htmlContent);
