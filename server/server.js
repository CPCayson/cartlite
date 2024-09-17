const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const cookieParser = require('cookie-parser');
// @ts-ignore
const dotenv = require('dotenv');
const Stripe = require('stripe'); // Correct Stripe import for JavaScript
const nodemailer = require('nodemailer');
const path = require('path');
const winston = require('winston');
// Load environment variables
const { doc, updateDoc } = require('firebase/firestore');
dotenv.config({ path: path.join(__dirname, '.env') });

// @ts-ignore
const stripe = new Stripe("sk_test_51PKXFdLZTLOaKlNsdrW06M3v1QLOO1wo2EZ8MtRu0iei3io1zLdYadKIrwE6jR4L28xMq6fGnmreqo0lDF69p2AL00QArFCGwL", {});

const app = express();
const port = process.env.PORT || 5000;


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});


if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
const checkStripeApiVersion = async () => {
  try {
    const stripeVersion = await stripe.stripe.VERSION;
    const configuredVersion = '2023-10-16';
    
    if (stripeVersion !== configuredVersion) {
      logger.warn(`Stripe API version mismatch. Configured: ${configuredVersion}, Actual: ${stripeVersion}`);
    } else {
      logger.info(`Stripe API version verified: ${stripeVersion}`);
    }
  } catch (error) {
    logger.error('Error checking Stripe API version', { error: error.message });
  }
};

// Call this function when your server starts
checkStripeApiVersion();
// Logging middleware
// @ts-ignore
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Determine the status code
  const statusCode = err.statusCode || 500;
  
  // Send a more informative error response
  res.status(statusCode).json({
    error: {
      message: err.message || 'An unexpected error occurred',
      type: err.name,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    }
  });
});

// CORS configuration
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
app.use(express.urlencoded({ extended: true }));

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables');
  process.exit(1);
}

// Firebase Admin Initialization
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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
});

const db = admin.firestore();

// Set up email transporter
// @ts-ignore
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Middleware to verify Firebase token

const verifyFirebaseToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  
  if (!idToken) {
    logger.warn('No Firebase token provided');
    return res.status(403).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    logger.info('Firebase token verified successfully', { uid: decodedToken.uid });
    next();
  } catch (error) {
    logger.error('Invalid Firebase token', { error: error.message });
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Test Firebase configuration on server start
const testFirebaseConnection = async () => {
  try {
    await admin.auth().listUsers(1);
    logger.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('Error initializing Firebase Admin SDK', { error: error.message });
  }
};

testFirebaseConnection();
// Onboarding session route
app.post('/api/create-account-session', verifyFirebaseToken, async (req, res, next) => {
  console.log('Received request to create onboarding session');

  const { accountId } = req.body;
  console.log('Received request to create onboarding session for account:', accountId);

  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: 'http://localhost:3000/refresh', // Update with your actual URL
      return_url: 'http://localhost:3000/complete', // Update with your actual URL
      type: 'account_onboarding',
    });

    console.log('Created account link for account:', accountId);
    res.json({ url: accountLink.url });

  } catch (error) {
    next(error); // Pass the error to the error handling middleware
    console.error('Error creating account link:', error);
    res.status(500).json({
      error: 'Failed to create account link',
      details: error.message,
      type: error.type,
    });
  }
});

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'account.updated':
      const account = event.data.object;
      const userDocRef = doc(db, 'users', account.metadata.userId); // Assuming you store userId in metadata
      const newStatus = account.charges_enabled ? 'active' : 'pending';
      await updateDoc(userDocRef, {
        stripeAccountStatus: newStatus,
        isNew: false, // Assuming onboarding is complete
      });
      break;
    // Handle other event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});
// Example route: Create Stripe Connected Account
app.post('/api/create-connected-account', verifyFirebaseToken, async (req, res) => {
  try {
    const { email, uid } = req.body;
    let { stripeAccountId, stripeCustomerId } = req.body;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: email,
        business_profile: {
          url: 'https://cart-rabbit.com',
          mcc: '4121',
          product_description: 'We provide ride-share services',
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;
      console.log('Created new Stripe Connected Account:', stripeAccountId);
    }

    if (!stripeCustomerId) {
      console.log('No existing Stripe Customer ID found, creating a new customer.');
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          isHost: 'true',
        },
      });
      stripeCustomerId = customer.id;
      console.log('Created new Stripe Customer:', stripeCustomerId);
    }

    const userRef = admin.firestore().collection('users').doc(uid);
    await userRef.update({
      stripeAccountId,
      stripeCustomerId,
      stripeAccountStatus: 'not_onboarded',
    });

    res.json({ accountId: stripeAccountId, customerId: stripeCustomerId });
  } catch (error) {
    console.error('Error creating connected account or customer:', error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/create-payment-intent', async (req, res) => {  try {
    const { amount, currency, isGuest, email } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      capture_method: 'manual',
      metadata: {
        isGuest: isGuest ? 'true' : 'false',
        email: email,
      },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user-data', verifyFirebaseToken, async (req, res) => {
  try {
    // @ts-ignore
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userDoc.data()); 
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/link-payment-to-user', async (req, res) => {
  try {
    const { userId, paymentIntentId } = req.body;
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: { userId: userId },
    });
    // Update your database to link the payment to the user
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Helper function to handle errors
// @ts-ignore
const handleError = (error, res, message) => {
  console.error(`${message}:`, error);
  res.status(500).json({
    error: message,
    details: error.message,
    type: error.type,
  });
};

app.post('/api/create-checkout-session', async (req, res) => {
  const { amount, currency, email } = req.body;
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: currency,
          product_data: {
            name: 'Ride Booking',
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      payment_intent_data: {
        capture_method: 'manual', // For later capture
      },
      success_url: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/cancel',
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  let  { amount, email } = req.body;
    // Ensure amount is a number
    amount = Number(amount);
  // Validate and round the amount
  if (isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid amount' });
  }


  // Round the amount to the nearest integer
  const unitAmount = Math.round(amount);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd', // Correctly pass the currency
          product_data: {
            name: 'Ride Booking',
          },
          unit_amount: unitAmount, // Ensure the amount is passed in cents
        },
        quantity: 1,
      }],
      payment_intent_data: {
        capture_method: 'manual', // For later capture if required
      },
      success_url: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/cancel',
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});


// Example route: Create Stripe Account
app.post('/api/create-connected-account', verifyFirebaseToken, async (req, res) => {
  try {
    const { email } = req.body;
    let stripeAccountId = req.body.stripeAccountId;
    let stripeCustomerId = req.body.stripeCustomerId;

    // Create Stripe Connected Account if not already created
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: email,
        business_profile: {
          url: 'https://cart-rabbit.com',
          mcc: '4121',
          product_description: 'We provide ride-share services',
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;
      console.log('Created new Stripe Connected Account:', stripeAccountId);
    }

    // Create Stripe Customer if not already created
    if (!stripeCustomerId) {
      console.log('No existing Stripe Customer ID found, creating a new customer.');
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          isHost: 'true',
        },
      });
      stripeCustomerId = customer.id;
      console.log('Created new Stripe Customer:', stripeCustomerId);
    }

    // Update Firestore with Stripe Account ID and Customer ID
    const userRef = admin.firestore().collection('users').doc(req.body.uid);
    await userRef.update({
      stripeAccountId,
      stripeCustomerId,
      stripeAccountStatus: 'not_onboarded',
    });

    res.json({ accountId: 'acct_1PxVQjPxtP6CqxpM', customerId: stripeCustomerId });
  } catch (error) {
    console.error('Error creating connected account or customer:', error);
    res.status(500).json({ error: error.message });
  }
});
app.post('/api/create-account-link', verifyFirebaseToken, async (req, res) => {
  try {
    const { accountId } = req.body;
    if (!accountId) {
      return res.status(400).json({ error: 'Account ID is required' });
    }
    
    const accountLink = await stripe.accountLinks.create({
      account: 'acct_1PxVQjPxtP6CqxpM',
      refresh_url: `${process.env.FRONTEND_URL}/onboarding/refresh`,
      return_url: `${process.env.FRONTEND_URL}/onboarding/complete`,
      type: 'account_onboarding',
      collect: 'eventually_due',
    });
    
    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating account link:', error);
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/user/:email', verifyFirebaseToken, async (req, res) => {
  try {
    const userEmail = req.params.email;

    const userSnapshot = await db.collection('users').where('email', '==', userEmail).get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userSnapshot.docs[0].data();
    
    // Ensure you're returning the stripeAccountId
    res.json({
      stripeAccountId: userData.stripeAccountId,
      stripeAccountStatus: userData.stripeAccountStatus || 'not_onboarded',
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Check account status (unchanged)
app.get('/api/account-status/:accountId', verifyFirebaseToken, async (req, res) => {
  try {
    const account = await stripe.accounts.retrieve(req.params.accountId);
    const status = account.details_submitted ? 'complete' : 'incomplete';
    
    // Update Firestore with the latest status
    const userRef = admin.firestore().collection('users').doc(req.body.uid);
    await userRef.update({ stripeAccountStatus: status });
    
    res.json({ status });
  } catch (error) {
    console.error('Error fetching account status:', error);
    res.status(500).json({ error: error.message });
  }
});
// 4. Create a login link for the Stripe Express dashboard (unchanged)
app.post('/api/create-dashboard-link', verifyFirebaseToken, async (req, res) => {
  try {
    const { accountId } = req.body;
    if (!accountId) {
      return res.status(400).json({ error: 'Account ID is required' });
    }
    
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    res.json({ url: loginLink.url });
  } catch (error) {
    console.error('Error creating dashboard link:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
// @ts-ignore
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS origin set to: ${process.env.FRONTEND_URL}`);
  console.log(`Stripe API key status: ${process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not set'}`);
});
// server.js

// server.js

// server.js


// require('dotenv').config(); // Load environment variables from .env
// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');
// const stripe = require('stripe')('sk_test_51PKXFdLZTLOaKlNsdrW06M3v1QLOO1wo2EZ8MtRu0iei3io1zLdYadKIrwE6jR4L28xMq6fGnmreqo0lDF69p2AL00QArFCGwL'); // Use your secret key
// const path = require('path');
// const cors = require('cors'); // CORS middleware

// // Enable CORS
// app.use(cors({
//   origin: 'http://localhost:3000', // Adjust based on your client URL and port
//   credentials: true,
// }));

// app.use(bodyParser.json());

// // Serve static files from the 'public' directory in 'hosting'
// app.use(express.static(path.join(__dirname, '../hosting/public')));

// // Endpoint to Create a Stripe Checkout Session
// app.post('/create-checkout-session', async (req, res) => {
//   const domainURL = 'http://localhost:3000'; // Adjust as needed
//   const { userId } = req.body;

//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card', 'link'],
//       line_items: [{
//         price_data: {
//           currency: 'usd',
//           product_data: {
//             name: 'Golf Cart Ride',
//           },
//           unit_amount: 340, // Amount in cents ($3.40)
//         },
//         quantity: 1,
//       }],
//       mode: 'payment',
//       success_url: `${domainURL}/testapp.html?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${domainURL}/cancel.html`,
//       metadata: { userId },
//     });
//     res.json({ id: session.id });
//   } catch (error) {
//     console.error('Error creating checkout session:', error);
//     res.status(500).send(`Error creating checkout session: ${error.message}`);
//   }
// });

// // Endpoint to Retrieve a Stripe Checkout Session
// app.get('/retrieve-session', async (req, res) => {
//   const sessionId = req.query.session_id;
//   try {
//     const session = await stripe.checkout.sessions.retrieve(sessionId);
//     res.json(session);
//   } catch (error) {
//     console.error('Error retrieving session:', error);
//     res.status(500).send(`Error retrieving session: ${error.message}`);
//   }
// });
// app.post('/create-payment-intent', async (req, res) => {
//   const { userId, rideFee } = req.body;

//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(rideFee * 100), // Convert to cents
//       currency: 'usd',
//       capture_method: 'manual', // So the host can capture later
//       metadata: { userId },
//     });

//     res.json({
//       clientSecret: paymentIntent.client_secret,
//       paymentIntentId: paymentIntent.id,
//     });
//   } catch (error) {
//     console.error('Error creating payment intent:', error);
//     res.status(500).send(`Error creating payment intent: ${error.message}`);
//   }
// });
// // Serve the testapp.html file
// app.get('/testapp.html', (req, res) => {
//   res.sendFile(path.join(__dirname, '../hosting/public', 'testapp.html'));
// });

// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });

