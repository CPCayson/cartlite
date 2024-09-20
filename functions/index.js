// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const stripe = require("stripe")(functions.config().stripe.secret_key);
const nodemailer = require("nodemailer");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Express App
const app = express();

// Middleware Setup
app.use(cors({ origin: true })); // Enable CORS for all origins
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger Setup (Using console for simplicity; consider using a logging library)
const logger = (message, data) => {
  console.log(message, data || "");
};

// Authentication Middleware
const verifyFirebaseToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  if (!idToken) {
    logger("No Firebase token provided");
    return res.status(403).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    logger("Firebase token verified successfully", { uid: decodedToken.uid });
    next();
  } catch (error) {
    logger("Invalid Firebase token", { error: error.message });
    res.status(403).json({ error: "Invalid token" });
  }
};

// Email Transporter Setup (Implement if needed)
const transporter = nodemailer.createTransport({
  service: functions.config().email.service,
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.pass,
  },
});

// Helper Function: Send Confirmation Email (Implement if needed)
const sendConfirmationEmail = async (to, subject, text) => {
  const mailOptions = {
    from: functions.config().email.user,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger(`Confirmation email sent to ${to}`);
  } catch (error) {
    logger("Error sending confirmation email:", error);
  }
};

// 1. Create Stripe Account Link
app.post(
  "/api/create-stripe-account-link",
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const { email, name, phone } = req.body;

      if (!email || !name || !phone) {
        return res
          .status(400)
          .json({ success: false, error: "Missing required fields" });
      }

      const userId = req.user.uid;
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      let stripeAccountId = userDoc.exists
        ? userDoc.data().stripeAccountId
        : null;

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
        await userRef.set(
          { email, stripeAccountId, name, phone },
          { merge: true }
        );
      }

      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: functions.config().stripe.refresh_url || "https://yourapp.com/refresh-url",
        return_url: functions.config().stripe.return_url || "https://yourapp.com/return-url",
        type: "account_onboarding",
      });

      res.json({ success: true, url: accountLink.url });
    } catch (error) {
      logger("Error creating Stripe account link:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// 2. Check Stripe Status
app.post("/api/check-stripe-status", verifyFirebaseToken, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Missing email" });
    }

    const userSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userSnapshot.empty) {
      return res.json({ success: true, onboarded: false });
    }

    const userData = userSnapshot.docs[0].data();
    if (!userData.stripeAccountId) {
      return res.json({ success: true, onboarded: false });
    }

    const account = await stripe.accounts.retrieve(userData.stripeAccountId);
    res.json({ success: true, onboarded: account.details_submitted });
  } catch (error) {
    logger("Error checking Stripe status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Create Payment Intent
app.post(
  "/api/create-payment-intent",
  verifyFirebaseToken,
  async (req, res) => {
    const { amount, pickup, destination } = req.body;

    if (!amount || !pickup || !destination) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
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
        email: req.user.email, // Assuming you store email in the token
      };

      await db.collection("bookings").doc(bookingId).set(booking);

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        booking,
      });
    } catch (error) {
      logger("Error creating payment intent:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// 4. Capture Payment Intent
app.post(
  "/api/capture-payment-intent",
  verifyFirebaseToken,
  async (req, res) => {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, error: "Missing bookingId" });
    }

    try {
      const bookingRef = db.collection("bookings").doc(bookingId);
      const bookingDoc = await bookingRef.get();

      if (!bookingDoc.exists) {
        return res
          .status(404)
          .json({ success: false, error: "Booking not found" });
      }

      const booking = bookingDoc.data();
      await stripe.paymentIntents.capture(booking.paymentIntentId);

      await bookingRef.update({ status: "captured" });

      // Optionally, send confirmation email
      if (booking.email) {
        await sendConfirmationEmail(
          booking.email,
          "Payment Captured",
          "Your payment has been successfully captured."
        );
      }

      res.json({ success: true, booking: { ...booking, status: "captured" } });
    } catch (error) {
      logger("Error capturing payment intent:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// 5. Cancel Booking
app.post("/api/cancel-booking", verifyFirebaseToken, async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ success: false, error: "Missing bookingId" });
  }

  try {
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    const booking = bookingDoc.data();
    await stripe.paymentIntents.cancel(booking.paymentIntentId);

    await bookingRef.update({ status: "cancelled" });

    // Optionally, send cancellation email
    if (booking.email) {
      await sendConfirmationEmail(
        booking.email,
        "Booking Cancelled",
        "Your booking has been successfully cancelled."
      );
    }

    res.json({ success: true, booking: { ...booking, status: "cancelled" } });
  } catch (error) {
    logger("Error canceling booking:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Refund Booking
app.post("/api/refund-booking", verifyFirebaseToken, async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ success: false, error: "Missing bookingId" });
  }

  try {
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    const booking = bookingDoc.data();
    await stripe.refunds.create({
      payment_intent: booking.paymentIntentId,
    });

    await bookingRef.update({ status: "refunded" });

    // Optionally, send refund email
    if (booking.email) {
      await sendConfirmationEmail(
        booking.email,
        "Payment Refunded",
        "Your payment has been successfully refunded."
      );
    }

    res.json({ success: true, booking: { ...booking, status: "refunded" } });
  } catch (error) {
    logger("Error refunding booking:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Webhook Handling
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        functions.config().stripe.webhook_secret
      );
    } catch (err) {
      logger("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        logger("PaymentIntent was successful!", paymentIntent);
        // Update booking status or perform other actions
        break;
      case "payment_intent.payment_failed":
        const paymentError = event.data.object;
        logger("Payment failed:", paymentError.last_payment_error);
        // Update booking status or notify the user
        break;
      // Handle other event types as needed
      default:
        logger(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  }
);

// 8. Error Handling Middleware
app.use((err, req, res, next) => {
  logger("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Export the Express app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);
