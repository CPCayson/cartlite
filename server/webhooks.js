const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

const router = express.Router();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const logger = require('./utils/logger');

// Include Socket.IO
let io;
const setSocketIO = (socketIO) => {
  io = socketIO;
};

router.post('/', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    logger.info('Stripe webhook received', { event });
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: err.message });
    return res.sendStatus(400);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentIntentSucceeded(paymentIntent);
      io.emit('payment_intent.succeeded', paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const paymentFailedIntent = event.data.object;
      await handlePaymentIntentFailed(paymentFailedIntent);
      io.emit('payment_intent.payment_failed', paymentFailedIntent);
      break;
    case 'charge.succeeded':
      const charge = event.data.object;
      await handleChargeSucceeded(charge);
      io.emit('charge.succeeded', charge);
      break;
    default:
      logger.warn(`Unhandled event type ${event.type}`, { event });
  }

  res.status(200).json({ received: true });
});

const handlePaymentIntentSucceeded = async (paymentIntent) => {
  const rideId = paymentIntent.description.replace('Ride Request: ', '');

  // 2. Use rideId to fetch ride request from your database
  const rideDocRef = admin.firestore().collection('rideRequests').doc(rideId);
  const rideDoc = await rideDocRef.get();

  try {
    await rideDocRef.update({
      paymentStatus: 'succeeded',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      capture_data: {
        captureAmount: paymentIntent.amount_received,
        captureTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        captureStatus: 'succeeded',
      },
    });

    logger.info('PaymentIntent succeeded', { paymentIntent });
  } catch (error) {
    logger.error('Error updating Firestore on payment_intent.succeeded:', error);
  }
};

const handlePaymentIntentFailed = async (paymentIntent) => {
  const cartId = paymentIntent.metadata.cartId;
  const rideDocRef = admin.firestore().collection('rideRequests').doc(cartId);

  try {
    await rideDocRef.update({
      paymentStatus: 'failed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info('PaymentIntent failed', { paymentIntent });
  } catch (error) {
    logger.error('Error updating Firestore on payment_intent.payment_failed:', error);
  }
};

const handleChargeSucceeded = async (charge) => {
  const cartId = charge.metadata.cartId;
  const rideDocRef = admin.firestore().collection('rideRequests').doc(cartId);

  try {
    await rideDocRef.update({
      chargeStatus: 'succeeded',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info('Charge succeeded', { charge });
  } catch (error) {
    logger.error('Error updating Firestore on charge.succeeded:', error);
  }
};

module.exports = { router, setSocketIO };
