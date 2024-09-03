// Import required packages
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const stripe = require('stripe')('sk_test_51PKXFdLZTLOaKlNsdrW06M3v1QLOO1wo2EZ8MtRu0iei3io1zLdYadKIrwE6jR4L28xMq6fGnmreqo0lDF69p2AL00QArFCGwL');

// Load environment variabless
dotenv.config({ path: path.join(__dirname, '.env') });

// Validate environment variables
const requiredEnvVars = [
  'HOST_ACCOUNT_ID',
  'USE_CONNECT',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'FRONTEND_URL',
  'EMAIL_SERVICE',
  'EMAIL_USER',
  'EMAIL_PASS',
  'VITE_FIREBASE_SERVICE_ACCOUNT_KEY',
  'VITE_FIREBASE_DATABASE_URL',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not set in the environment variables.`);
    process.exit(1);
  }
});

const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware setup
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Safely parse FIREBASE_SERVICE_ACCOUNT_KEY
let serviceAccountKey;
try {
  if (process.env.VITE_FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccountKey = JSON.parse(process.env.VITE_FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    throw new Error('VITE_FIREBASE_SERVICE_ACCOUNT_KEY is undefined');
  }
} catch (error) {
  console.error("Failed to parse Firebase service account key:", error);
  process.exit(1);
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
});

const db = admin.firestore(); // Initialize Firestore

// Set up email transporter for sending confirmation emails
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Utility function to send confirmation emails
const sendConfirmationEmail = (email, subject, message) => {
  transporter.sendMail(
    {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: message,
    },
    (err, info) => {
      if (err) {
        console.error('Error sending confirmation email:', err);
      } else {
        console.log('Confirmation email sent:', info.response);
      }
    }
  );
};

// API route to create a Checkout Session with validation
app.post('/api/create-checkout-session', async (req, res) => {
  const { amount, currency = 'usd' } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'Amount and customerEmail are required.' });
  }
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'Ride Payment',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      phone_number_collection: {
        enabled: true,
      },
      payment_intent_data: {
        capture_method: 'manual',
      },
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: 'Internal Server Error while creating checkout session.' });
  }
});

// API route to capture a Payment Intent
app.post('/api/capture-payment-intent', async (req, res) => {
  const { paymentIntentId, customerEmail } = req.body;
  if (!paymentIntentId) return res.status(400).json({ error: 'Payment Intent ID is required.' });

  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    sendConfirmationEmail(customerEmail, 'Payment Captured', 'Your payment has been successfully captured.');
    res.json(paymentIntent);
  } catch (error) {
    console.error('Error capturing payment:', error.message);
    res.status(500).json({ error: 'Internal Server Error while capturing payment intent.' });
  }
});

// API route to create a new Stripe account link for onboarding
app.post('/api/create-stripe-account-link', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists in Firestore
    const userRef = db.collection('users').doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // If the user doesn't exist, create a new user document with default values
      await userRef.set({
        email,
        name: '', // Placeholder for the name, if you want to collect it later
        stripeAccountId: '',
        stripeAccountStatus: 'not_created',
        stripeLink: '',
        userType: 'host', // Assuming new users are hosts, adjust as needed
      });
      console.log(`New user created with email: ${email}`);
    } else {
      const userData = userDoc.data();

      // Ensure that userData and stripeAccountId exist before using them
      if (userData && userData.stripeAccountId) {
        // Create a new Stripe account link for onboarding
        const accountLink = await stripe.accountLinks.create({
          account: userData.stripeAccountId,
          refresh_url: `${process.env.FRONTEND_URL}/`, // Redirect if user refreshes the onboarding
          return_url: `${process.env.FRONTEND_URL}/`, // Redirect after onboarding is complete
          type: 'account_onboarding',
        });

        return res.json({ url: accountLink.url });
      }
    }

    // If no Stripe account ID exists, create a new one
    const account = await stripe.accounts.create({
      type: 'express',
      business_type: 'individual',
      email: email,
      business_profile: {
        url: 'https://cart-rabbit.com',
        mcc: '4121',
        product_description: 'We provide high-quality software products for ride-share delivery services.',
      },
    });

    // Update Firestore with new Stripe account ID
    await userRef.update({ stripeAccountId: account.id, stripeAccountStatus: 'incomplete' });

    // Create an onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/`,
      return_url: `${process.env.FRONTEND_URL}/`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating Stripe account link:', error);
    res.status(500).json({ message: 'Error creating Stripe account link' });
  }
});

// API route to get Stripe balance
app.get('/api/stripe-balance', async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve();
    res.json({ balance });
  } catch (error) {
    console.error('Error fetching Stripe balance:', error);
    res.status(500).json({ error: 'Failed to fetch Stripe balance' });
  }
});

// API route to get Stripe transactions
app.get('/api/stripe-transactions', async (req, res) => {
  try {
    const transactions = await stripe.balanceTransactions.list();
    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching Stripe transactions:', error);
    res.status(500).json({ error: 'Failed to fetch Stripe transactions' });
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
