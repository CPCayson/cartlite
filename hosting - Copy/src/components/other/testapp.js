
// Initialize Stripe


// testapp.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp, collection, addDoc, deleteField,
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

import {
  getAuth, signInAnonymously, onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

// Initialize Firebase
const firebaseConfig = {
  // Your Firebase configuration
  apiKey: "AIzaSyCOkJd62Hu9iEVlJ_LIIrakwbkm19cg8CU",
  authDomain: "rabbit-2ba47.firebaseapp.com",
  databaseURL: "https://rabbit-2ba47-default-rtdb.firebaseio.com",
  projectId: "rabbit-2ba47",
  storageBucket: "rabbit-2ba47.appspot.com",
  messagingSenderId: "415352862345",
  appId: "1:415352862345:web:6064bb65137c0d745cf858",
  measurementId: "G-1BWB1E4BEP"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Initialize Stripe
const stripe = window.Stripe('pk_test_51PKXFdLZTLOaKlNslmwEPt9pWm5uS9ZyOsr5gXeJKCmLal5nT1gofFJm2icRtOJgxEhs5265M6LRpSGPHEHydRna00CVialgWd');

// Server URL
const serverUrl = 'http://localhost:3000';

// Variables to store user and payment info
let currentUserId = null;
let paymentIntentId = null;
let elements;
let cardElement;

// Assuming you have a function that handles ride completion (e.g., after the host captures the payment):
//Do I need to make this function?
// Function to complete the ride
async function completeRide() {
  try {
    // Update ride request status to 'completed'
    await updateDoc(doc(db, 'rideRequests', paymentIntentId), {
      status: 'completed',
    });

    // Clear the active ride request from user's document
    await updateDoc(doc(db, 'users', currentUserId), {
      activeRideRequestId: deleteField(),
    });

    // Notify the user and reset the UI
    alert('Ride completed!');
    location.reload();
  } catch (error) {
    console.error('Error completing ride:', error);
  }
}

// Example usage of completeRide function
document.getElementById('completeRideButton').addEventListener('click', completeRide);


// Function to sign in the user
function signInUser() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUserId = user.uid;
        resolve(user);
      } else {
        signInAnonymously(auth)
          .then((result) => {
            currentUserId = result.user.uid;
            resolve(result.user);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  });
}
async function checkForActiveRideRequest() {
  try {
    const userDocRef = doc(db, 'users', currentUserId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.activeRideRequestId) {
        paymentIntentId = userData.activeRideRequestId;

        // Get the ride request document
        const rideRequestDoc = await getDoc(doc(db, 'rideRequests', paymentIntentId));
        if (rideRequestDoc.exists()) {
          const rideData = rideRequestDoc.data();
          if (rideData.status === 'pending' || rideData.status === 'accepted') {
            // Start listening for updates
            waitForAcceptance(paymentIntentId);
            document.getElementById('waitingMessage').style.display = 'block';
            document.getElementById('rideDetails').style.display = 'none';
          } else {
            // Ride is completed or canceled
            // Clear the active ride request from user's document
            await updateDoc(userDocRef, {
              activeRideRequestId: deleteField(),
            });
          }
        } else {
         // document.getElementById('rideDetails').style.display = 'none';

          // Ride request document does not exist
          // Clear the active ride request from user's document
          await updateDoc(userDocRef, {
            activeRideRequestId: deleteField(),
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking for active ride request:', error);
  }
}



// Function to initialize the app after authentication
function initializeAppAfterAuth() {
  checkForActiveRideRequest();
  // Handle the Checkout Button Click
  document.getElementById('checkout-button').addEventListener('click', async () => {
    const rideFee = parseFloat(document.getElementById('rideFee').value);
    const destinationLocation = document.getElementById('destinationLocation').value;
    const pickupLocation = document.getElementById('pickupLocation').value;
    const userEmail = document.getElementById('userEmail').value;

    try {
      const response = await fetch(`${serverUrl}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, rideFee }),
      });
      const data = await response.json();
      paymentIntentId = data.paymentIntentId;

      // Confirm the card payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email: userEmail },
        },
      });

      if (result.error) {
        console.error('Payment failed:', result.error.message);
      } else {
        if (result.paymentIntent.status === 'requires_capture') {
          // Payment is successful but requires capture
          createRideRequest(
            paymentIntentId,
            currentUserId,
            userEmail,
            rideFee,
            destinationLocation,
            pickupLocation,
          );
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
}

// Sign in the user and initialize the app
signInUser()
  .then(() => {
    initializeAppAfterAuth();
  })
  .catch((error) => {
    console.error('Error during authentication:', error);
  });

// Function to create a ride request in Firebase
async function createRideRequest(
  paymentIntentId,
  userId,
  userEmail,
  rideFee,
  destinationLocation,
  pickupLocation,
) {
  try {
    const rideRequestData = {
      user_uid: userId,
      user_email: userEmail,
      status: 'pending',
      rideFee: rideFee,
      destination_location: destinationLocation,
      user_location: pickupLocation,
      is_driver_assigned: false,
      paymentIntentId: paymentIntentId,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'rideRequests', paymentIntentId), rideRequestData);

    // Also store the session ID under the user's document for easy retrieval
    await setDoc(doc(db, 'users', userId), {
      activeRideRequestId: paymentIntentId,
    }, { merge: true });

    // Start listening for host acceptance
    waitForAcceptance(paymentIntentId);
    document.getElementById('waitingMessage').style.display = 'block';
  } catch (error) {
    console.error('Error adding document: ', error);
  }
}


// Function to wait for host acceptance
function waitForAcceptance(paymentIntentId) {
  const rideRequestRef = doc(db, 'rideRequests', paymentIntentId);

  onSnapshot(rideRequestRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.is_driver_assigned) {
        document.getElementById('waitingMessage').style.display = 'none';
        showSessionView(data);
      } else {
        console.log('Finding driver...');
      }
    } else {
      console.log('Ride request document does not exist.');
    }
  });
}

// Function to show the session view
function showSessionView(data) {
  document.getElementById('sessionView').style.display = 'block';
  document.getElementById('hostInfo').innerText = `Your driver is on the way!`;

  // Start listening for messages


  listenForMessages(data.paymentIntentId);
}
// Function to listen for messages
function listenForMessages(paymentIntentId) {
  const messagesRef = collection(db, 'rideRequests', paymentIntentId, 'messages');

  onSnapshot(messagesRef, (querySnapshot) => {
    const messageBox = document.getElementById('messageBox');
    messageBox.innerHTML = ''; // Clear existing messages
    querySnapshot.forEach((doc) => {
      const messageData = doc.data();
      const newMessage = document.createElement('p');
      newMessage.innerText = `${messageData.senderId}: ${messageData.message}`;
      messageBox.appendChild(newMessage);
    });
  });
}

// Function to cancel the payment intent
async function cancelPayment() {
  try {
    const response = await fetch(`${serverUrl}/cancel-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId }),
    });
    const data = await response.json();
    console.log('Payment canceled:', data);

    // Update ride request status
    await updateDoc(doc(db, 'rideRequests', paymentIntentId), {
      status: 'canceled',
    });

    // Clear the active ride request from user's document
    await updateDoc(doc(db, 'users', currentUserId), {
      activeRideRequestId: deleteField(),
    });

    // Optionally reload the page or reset the UI
    location.reload();
  } catch (error) {
    console.error('Error canceling payment:', error);
  }
}

// Event listener for cancel button
document.getElementById('cancelButton').addEventListener('click', () => {
  cancelPayment();
});

// Function to initialize Stripe Elements
function initializeStripeElements() {
  const elementsConfig = {
    // Optionally pass in custom styles or other options
  };
  elements = stripe.elements(elementsConfig);

  // Create an instance of the card Element
  cardElement = elements.create('card');

  // Add an instance of the card Element into the `card-element` <div>
  cardElement.mount('#card-element');
}

// Initialize Stripe Elements on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeStripeElements();
});
