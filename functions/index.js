/* eslint-disable max-len */
// @ts-nocheck
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const bodyParser = require("body-parser");
// const Stripe = require("stripe"); // Correct initialization
const {v4: uuidv4} = require("uuid");

// const stripe = Stripe(functions.config().stripe.secret_key);
const stripe = require("stripe")(
    "sk_test_51PKXFdLZTLOaKlNsdrW06M3v1QLOO1wo2EZ8MtRu0iei3io1zLdYadKIrwE6jR4L28xMq6fGnmreqo0lDF69p2AL00QArFCGwL",
);

const adminConfig = functions.config().admin;

// eslint-disable-next-line max-len
if (
  !adminConfig ||
  !adminConfig.project_id ||
  !adminConfig.client_email ||
  !adminConfig.private_key
) {
  console.error("Fir configuration is missing or incomplete:", adminConfig);
  throw new Error("Firebase Admin configuration is missing or incomplete.");
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: adminConfig.project_id,
    clientEmail: adminConfig.client_email,
    privateKey: adminConfig.private_key.replace(/\\n/g, "\n"),
  }),
  databaseURL: `https://${adminConfig.project_id}.firebaseio.com`,
});

const app = express();
app.use(bodyParser.json());

const bookings = new Map();

const db = admin.firestore();

// index.js (Firebase Cloud Functions)

exports.createConnectAccount = functions.https.onRequest(async (req, res) => {
  const {email, uid} = req.body; // Destructure email and uid from the request body

  try {
    // Create a custom Stripe Connect account
    const account = await stripe.accounts.create({
      type: "custom",
      country: "US",
      email: email,
      requested_capabilities: ["transfers"],
      business_type: "individual",
    });

    // Save the Stripe account ID to Firestore under the user's document
    await db.collection("users").doc(uid).set({stripeAccountId: account.id}, {merge: true});

    res.status(200).send({body: {success: account.id}});
  } catch (error) {
    console.error("Error creating Stripe account:", error);
    res.status(500).send({body: {failure: error.message}});
  }
});

exports.createStripeAccountLink_test = functions.https.onRequest(async (req, res) => {
  const {accountID} = req.body; // Destructure accountID from the request body

  try {
    // Create an account link for the Stripe Connect account
    const accountLink = await stripe.accountLinks.create({
      account: accountID,
      failure_url: "https://example.com/failure",
      success_url: "https://example.com/success",
      type: "custom_account_verification",
      collect: "eventually_due",
    });

    res.status(200).send({body: {success: accountLink.url}});
  } catch (error) {
    console.error("Error creating Stripe account link:", error);
    res.status(500).send({body: {failure: error.message}});
  }
});

exports.createStripeAccountLink = functions.https.onRequest(
    async (req, res) => {
      const {email, userId, name, phone} = req.body;

      try {
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();

        let stripeAccountId = userDoc.exists ?
        userDoc.data().stripeAccountId :
        null;

        if (!stripeAccountId) {
        // Create a new Stripe account using mostly hardcoded data
          const account = await stripe.accounts.create({
            type: "express",
            business_type: "individual",
            individual: {
              email, // Dynamic email from request
              phone, // Dynamic phone from request
              first_name: name.split(" ")[0], // Extract first name
              last_name: name.split(" ")[1] || "",
            },
            business_profile: {
              url: "https://cart-rabbit.com", // Hardcoded business website
              mcc: "4121", // Hardcoded MCC for ride-sharing services
              product_description:
              "We provide high-quality software products " /
              +"for ride-share delivery services.",
            },
            company: {
              name: "CaysonPoint STUDIO LLC: CartRabbit", // Hardcoded company name
              address: {
                line1: "117 Demontluzen Ave", // Hardcoded address
                city: "Bay Saint Louis",
                state: "MS",
                postal_code: "39520",
                country: "US",
              },
            },
          });

          stripeAccountId = account.id;
          await userRef.set({email, stripeAccountId, name, phone});
        }

        // Create a Stripe account link for onboarding
        const accountLink = await stripe.accountLinks.create({
          account: stripeAccountId,
          refresh_url: "https://yourapp.com/refresh-url", // URL to return if user refreshes or exits onboarding
          return_url: "https://yourapp.com/return-url", // URL to return after successful onboarding
          type: "account_onboarding",
        });

        res.json({url: accountLink.url});
      } catch (error) {
        console.error("Error creating Stripe account link:", error);
        res.status(500).json({message: "Error creating Stripe account link"});
      }
    },
);

exports.checkStripeStatus = functions.https.onRequest(async (req, res) => {
  const {email} = req.body;

  try {
    const userDoc = await db.collection("users").doc(email).get();

    if (!userDoc.exists || !userDoc.data().stripeAccountId) {
      return res.json({onboarded: false});
    }

    const user = userDoc.data();
    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    if (account.details_submitted) {
      res.json({onboarded: true});
    } else {
      res.json({onboarded: false});
    }
  } catch (error) {
    console.error("Error checking Stripe status:", error);
    res.status(500).json({message: "Error checking Stripe status"});
  }
});

app.post("/api/create-payment-intent", async (req, res) => {
  const {amount, pickup, destination} = req.body;

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

    bookings.set(bookingId, booking);

    res.json({
      clientSecret: paymentIntent.client_secret,
      booking,
    });
  } catch (error) {
    console.error("Stripe API Error:", error);
    res.status(500).json({error: error.message});
  }
});

app.post("/api/capture-payment-intent", async (req, res) => {
  const {bookingId} = req.body;

  try {
    const booking = bookings.get(bookingId);
    if (!booking) {
      return res
          .status(404)
          .json({success: false, error: "Booking not found"});
    }

    await stripe.paymentIntents.capture(booking.paymentIntentId);
    booking.status = "captured";
    bookings.set(bookingId, booking);

    res.json({success: true, booking});
  } catch (error) {
    console.error("Stripe API Error:", error);
    res.status(500).json({success: false, error: error.message});
  }
});

app.post("/api/cancel-booking", async (req, res) => {
  const {bookingId} = req.body;

  try {
    const booking = bookings.get(bookingId);
    if (!booking) {
      return res
          .status(404)
          .json({success: false, error: "Booking not found"});
    }

    await stripe.paymentIntents.cancel(booking.paymentIntentId);
    booking.status = "cancelled";
    bookings.set(bookingId, booking);

    res.json({success: true, booking});
  } catch (error) {
    console.error("Stripe API Error:", error);
    res.status(500).json({success: false, error: error.message});
  }
});

app.post("/api/refund-booking", async (req, res) => {
  const {bookingId} = req.body;

  try {
    const booking = bookings.get(bookingId);
    if (!booking) {
      return res
          .status(404)
          .json({success: false, error: "Booking not found"});
    }

    await stripe.refunds.create({
      payment_intent: booking.paymentIntentId,
    });

    booking.status = "refunded";
    bookings.set(bookingId, booking);

    res.json({success: true, booking});
  } catch (error) {
    console.error("Stripe API Error:", error);
    res.status(500).json({success: false, error: error.message});
  }
});

app.get("/api/hello", (req, res) => {
  console.log("Received request for /api/hello");
  res.send("Hello from Express on Firebase!");
});

app.post("/stripeApi/create-connected-account", async (req, res) => {
  const {email} = req.body;

  try {
    const account = await stripe.accounts.create({
      type: "express",
      email,
    });
    res.status(200).send({accountId: account.id});
  } catch (error) {
    console.error("Error creating Stripe connected account:", error);
    res.status(500).send({error: error.message});
  }
});

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected via Socket.IO");

  socket.on("message", (data) => {
    console.log("Received message via Socket.IO", data);
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

exports.api = functions.https.onRequest(app);

exports.socket = functions.https.onRequest((req, res) => {
  console.log("Handling Socket.IO connection request");
  server.emit("request", req, res);
});
