// Import required packages
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer'); // For sending confirmation emails
const stripe = require('stripe');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Validate environment variables
const requiredEnvVars = ['STRIPE_SECRET_KEY', 'STRIPE_PUBLIC_KEY', 'FIREBASE_SERVICE_ACCOUNT_KEY', 'FIREBASE_DATABASE_URL', 'EMAIL_SERVICE', 'EMAIL_USER', 'EMAIL_PASS'];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not set in the environment variables.`);
    process.exit(1);
  }
});

const app = express();
const port = process.env.PORT || 5000;

// Middleware setup
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Set up email transporter for sending confirmation emails
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Middleware for token verification
const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) return next();

  try {
    req.user = await admin.auth().verifyIdToken(idToken);
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Utility function to send confirmation emails
const sendConfirmationEmail = (email, subject, message) => {
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text: message,
  }, (err, info) => {
    if (err) {
      console.error('Error sending confirmation email:', err);
    } else {
      console.log('Confirmation email sent:', info.response);
    }
  });
};

// API route to create a Checkout Session with validation
app.post('/api/create-checkout-session', verifyToken, async (req, res) => {
  const { amount, currency = 'usd', rideId, customerEmail } = req.body;

  // Input validation
  if (!rideId || !amount || !customerEmail) {
    return res.status(400).json({ error: 'rideId, amount, and customerEmail are required' });
  }
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number' });
  }

  try {
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: 'Ride Payment',
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      customer_email: customerEmail,
      metadata: { rideId },
      payment_intent_data: {
        capture_method: 'manual',
      },
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/cancel`,
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API route to capture a Payment Intent
app.post('/api/capture-payment-intent', verifyToken, async (req, res) => {
  const { paymentIntentId, customerEmail } = req.body;
  if (!paymentIntentId) return res.status(400).json({ error: 'Payment Intent ID is required' });

  try {
    const paymentIntent = await stripeClient.paymentIntents.capture(paymentIntentId);
    sendConfirmationEmail(customerEmail, 'Payment Captured', 'Your payment has been successfully captured.');
    res.json(paymentIntent);
  } catch (error) {
    console.error('Error capturing payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// API route to cancel a Payment Intent
app.post('/api/cancel-payment-intent', verifyToken, async (req, res) => {
  const { paymentIntentId, customerEmail } = req.body;
  if (!paymentIntentId) return res.status(400).json({ error: 'Payment Intent ID is required' });

  try {
    const canceledIntent = await stripeClient.paymentIntents.cancel(paymentIntentId);
    sendConfirmationEmail(customerEmail, 'Payment Canceled', 'Your payment has been successfully canceled.');
    res.json(canceledIntent);
  } catch (error) {
    console.error('Error canceling payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// API route to refund a Payment Intent
app.post('/api/refund-payment-intent', verifyToken, async (req, res) => {
  const { paymentIntentId, customerEmail } = req.body;
  if (!paymentIntentId) return res.status(400).json({ error: 'Payment Intent ID is required' });

  try {
    const refund = await stripeClient.refunds.create({ payment_intent: paymentIntentId });
    sendConfirmationEmail(customerEmail, 'Payment Refunded', 'Your payment has been successfully refunded.');
    res.json(refund);
  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for Stripe to handle payment status updates
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      break;
    case 'payment_intent.payment_failed':
      const paymentError = event.data.object;
      console.log('Payment failed:', paymentError.last_payment_error);
      break;
    // Add more event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

// Serve the minimal frontend HTML with dynamic amount calculation and loading indicators
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Integration</title>
    <style>
      /* Add simple styles for loading spinner and feedback */
      .loading-spinner {
        display: none;
        border: 4px solid #f3f3f3;
        border-radius: 50%;
        border-top: 4px solid #3498db;
        width: 20px;
        height: 20px;
        animation: spin 2s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .feedback {
        margin-top: 10px;
        font-size: 14px;
        color: red;
      }
    </style>
  </head>
  <body>
    <h1>Stripe Payment Integration</h1>
    <input type="email" id="customerEmail" placeholder="Enter your email" required />
    <input type="number" id="amountInput" placeholder="Enter amount" required />
    <button id="checkoutButton">Pay with Stripe</button>
    <button id="captureButton" style="display: none;">Capture Payment</button>
    <button id="cancelButton" style="display: none;">Cancel Payment</button>
    <button id="refundButton" style="display: none;">Refund Payment</button>
    <div class="loading-spinner" id="loadingSpinner"></div>
    <div id="feedback" class="feedback"></div>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const checkoutButton = document.getElementById('checkoutButton');
        const captureButton = document.getElementById('captureButton');
        const cancelButton = document.getElementById('cancelButton');
        const refundButton = document.getElementById('refundButton');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const feedback = document.getElementById('feedback');
        const customerEmailInput = document.getElementById('customerEmail');
        const amountInput = document.getElementById('amountInput');

        const storedPaymentIntentId = localStorage.getItem('paymentIntentId');
        
        if (storedPaymentIntentId) {
          captureButton.style.display = 'block';
          cancelButton.style.display = 'block';
          refundButton.style.display = localStorage.getItem('paymentIntentStatus') === 'captured' ? 'block' : 'none';
        }

        const showLoading = () => {
          loadingSpinner.style.display = 'inline-block';
        };

        const hideLoading = () => {
          loadingSpinner.style.display = 'none';
        };

        const displayFeedback = (message, isError = true) => {
          feedback.textContent = message;
          feedback.style.color = isError ? 'red' : 'green';
        };

        checkoutButton.addEventListener('click', async () => {
          const customerEmail = customerEmailInput.value;
          const amount = parseInt(amountInput.value) * 100; // Convert to cents
          if (!customerEmail || !amount) {
            displayFeedback('Please enter a valid email and amount.');
            return;
          }
          showLoading();
          feedback.textContent = ''; // Clear any previous feedback
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount, rideId: 'test_ride_id', customerEmail })
          });
          
          const { url, error } = await response.json();
          hideLoading();
          if (error) {
            displayFeedback(error);
          } else {
            window.location.href = url; // Redirect to the Stripe Checkout page
          }
        });

        captureButton.addEventListener('click', async () => {
          const paymentIntentId = localStorage.getItem('paymentIntentId');
          const customerEmail = customerEmailInput.value;
          if (!paymentIntentId) return displayFeedback('No Payment Intent ID found in local storage.');
          showLoading();
          const response = await fetch('/api/capture-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentIntentId, customerEmail })
          });

          const result = await response.json();
          hideLoading();
          if (result.error) {
            displayFeedback('Error capturing payment: ' + result.error);
          } else {
            displayFeedback('Payment captured successfully!', false);
            localStorage.setItem('paymentIntentStatus', 'captured');
            refundButton.style.display = 'block'; // Show refund button after capture
          }
        });

        cancelButton.addEventListener('click', async () => {
          const paymentIntentId = localStorage.getItem('paymentIntentId');
          const customerEmail = customerEmailInput.value;
          if (!paymentIntentId) return displayFeedback('No Payment Intent ID found in local storage.');
          showLoading();
          const response = await fetch('/api/cancel-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentIntentId, customerEmail })
          });

          const result = await response.json();
          hideLoading();
          if (result.error) {
            displayFeedback('Error canceling payment: ' + result.error);
          } else {
            displayFeedback('Payment canceled successfully!', false);
            localStorage.removeItem('paymentIntentId');
            localStorage.removeItem('paymentIntentStatus');
            captureButton.style.display = 'none';
            cancelButton.style.display = 'none';
            refundButton.style.display = 'none';
          }
        });

        refundButton.addEventListener('click', async () => {
          const paymentIntentId = localStorage.getItem('paymentIntentId');
          const customerEmail = customerEmailInput.value;
          if (!paymentIntentId) return displayFeedback('No Payment Intent ID found in local storage.');
          showLoading();
          const response = await fetch('/api/refund-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentIntentId, customerEmail })
          });

          const result = await response.json();
          hideLoading();
          if (result.error) {
            displayFeedback('Error refunding payment: ' + result.error);
          } else {
            displayFeedback('Payment refunded successfully!', false);
            localStorage.removeItem('paymentIntentId');
            localStorage.removeItem('paymentIntentStatus');
            refundButton.style.display = 'none';
          }
        });
      });
    </script>
  </body>
</html>
          
  `);
});

// Success and Cancel pages
app.get('/success', (req, res) => {
  const sessionId = req.query.session_id;

  // Fetch the session from Stripe to get the PaymentIntent ID
  stripeClient.checkout.sessions.retrieve(sessionId)
    .then(session => {
      const paymentIntentId = session.payment_intent;
      // Store the PaymentIntent ID in local storage via client-side script
      res.send(`
        <script>
          localStorage.setItem('paymentIntentId', '${paymentIntentId}');
          window.location.href = '/';
        </script>
      `);
    })
    .catch(error => res.send(`<h1>Error retrieving session: ${error.message}</h1>`));
});

app.get('/cancel', (req, res) => {
  res.send(`<h1>Payment canceled</h1><p>Your payment was canceled. Please try again.</p>`);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
