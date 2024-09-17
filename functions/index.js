const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors")({origin: true});
const {v4: uuidv4} = require("uuid");

const stripe = require("stripe")(functions.config().stripe.secret_key);

admin.initializeApp();

const db = admin.firestore();
const app = express();


const asyncHandler = (fn) => (req, res) =>
  cors(req, res, () => {
    Promise.resolve(fn(req, res)).catch((error) => {
      console.error("Error:", error);
      res.status(500).json({success: false, error: error.message});
    });
  });

exports.createStripeAccountLink = functions.https.onRequest(
    asyncHandler(async (req, res) => {
      const {email, userId, name, phone} = req.body;

      if (!email || !userId || !name || !phone) {
        return res.status(400).json(
            {success: false, error: "Missing required fields"});
      }

      try {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        let stripeAccountId =
        userDoc.exists ? userDoc.data().stripeAccountId : null;

        if (!stripeAccountId) {
          const account = await stripe.accounts.create({
            type: "express",
            email,
            business_type: "individual",
            individual: {
              email,
              phone,
              first_name: name.split(" ")[0],
              last_name: name.split(" ")[1] || "",
            },
          });

          stripeAccountId = account.id;
          await userRef.set({email, stripeAccountId, name, phone}, 
              {merge: true});
        }

        const accountLink = await stripe.accountLinks.create({
          account: stripeAccountId,
          refresh_url: "https://yourapp.com/refresh-url",
          return_url: "https://yourapp.com/return-url",
          type: "account_onboarding",
        });

        res.json({success: true, url: accountLink.url});
      } catch (error) {
        console.error("Error creating Stripe account link:", error);
        res.status(500).json({success: false, error: error.message});
      }
    }),
);

exports.checkStripeStatus = functions.https.onRequest(
    asyncHandler(async (req, res) => {
      const {email} = req.body;

      if (!email) {
        return res.status(400).json({success: false, error: "Missing email"});
      }

      try {
        const userDoc =
        await db.collection("users").where("email", "==", email).get();

        if (userDoc.empty) {
          return res.json({success: true, onboarded: false});
        }

        const userData = userDoc.docs[0].data();
        if (!userData.stripeAccountId) {
          return res.json({success: true, onboarded: false});
        }

        const account = await stripe.accounts.retrieve(
            userData.stripeAccountId);
        res.json({success: true, onboarded: account.details_submitted});
      } catch (error) {
        console.error("Error checking Stripe status:", error);
        res.status(500).json({success: false, error: error.message});
      }
    }),
);

app.post("/api/create-payment-intent", asyncHandler(async (req, res) => {
  const {amount, pickup, destination} = req.body;

  if (!amount || !pickup || !destination) {
    return res.status(400).json(
        {success: false, error: "Missing required fields"});
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],
      confirmation_method: "manual",
      capture_method: "manual",
    });

    const bookingId = uuidv4();
    const booking = {
      id: bookingId,
      amount,
      pickup,
      destination,
      status: "requires_capture",
      paymentIntentId: paymentIntent.id,
    };

    await db.collection("bookings").doc(bookingId).set(booking);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      booking,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({success: false, error: error.message});
  }
}));

app.post("/api/capture-payment-intent", asyncHandler(async (req, res) => {
  const {bookingId} = req.body;

  if (!bookingId) {
    return res.status(400).json({success: false, error: "Missing bookingId"});
  }

  try {
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({success: false, error: "Booking not found"});
    }

    const booking = bookingDoc.data();
    await stripe.paymentIntents.capture(booking.paymentIntentId);

    await bookingRef.update({status: "captured"});

    res.json({success: true, booking: {...booking, status: "captured"}});
  } catch (error) {
    console.error("Error capturing payment intent:", error);
    res.status(500).json({success: false, error: error.message});
  }
}));

app.post("/api/cancel-booking", asyncHandler(async (req, res) => {
  const {bookingId} = req.body;

  if (!bookingId) {
    return res.status(400).json({success: false, error: "Missing bookingId"});
  }

  try {
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({success: false, error: "Booking not found"});
    }

    const booking = bookingDoc.data();
    await stripe.paymentIntents.cancel(booking.paymentIntentId);

    await bookingRef.update({status: "cancelled"});

    res.json({success: true, booking: {...booking, status: "cancelled"}});
  } catch (error) {
    console.error("Error canceling booking:", error);
    res.status(500).json({success: false, error: error.message});
  }
}));

app.post("/api/refund-booking", asyncHandler(async (req, res) => {
  const {bookingId} = req.body;

  if (!bookingId) {
    return res.status(400).json({success: false, error: "Missing bookingId"});
  }

  try {
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({success: false, error: "Booking not found"});
    }

    const booking = bookingDoc.data();
    await stripe.refunds.create({
      payment_intent: booking.paymentIntentId,
    });

    await bookingRef.update({status: "refunded"});

    res.json({success: true, booking: {...booking, status: "refunded"}});
  } catch (error) {
    console.error("Error refunding booking:", error);
    res.status(500).json({success: false, error: error.message});
  }
}));

exports.api = functions.https.onRequest(app);
