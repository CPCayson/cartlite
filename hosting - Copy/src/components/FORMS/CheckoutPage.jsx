// import React, { useState, useEffect, useCallback } from 'react';
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
// import useAuth from '../../hooks/useAuth';
// import { db, auth } from '../../hooks/firebase/firebaseConfig';
// import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
// import PropTypes from 'prop-types';
// import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
// import firebase from 'firebase/compat/app';
// import 'firebase/compat/auth';
// import { useNavigate } from 'react-router-dom';

// const STRIPE_PUBLIC_KEY = "pk_test_51PKXFdLZTLOaKlNslmwEPt9pWm5uS9ZyOsr5gXeJKCmLal5nT1gofFJm2icRtOJgxEhs5265M6LRpSGPHEHydRna00CVialgWd";
// const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

// const uiConfig = {
//   signInFlow: 'popup',
//   signInOptions: [
//     firebase.auth.GoogleAuthProvider.PROVIDER_ID,
//     firebase.auth.EmailAuthProvider.PROVIDER_ID,
//   ],
//   callbacks: {
//     signInSuccessWithAuthResult: () => false,
//   },
// };

// const CheckoutPage = () => {
//   const [clientSecret, setClientSecret] = useState('');
//   const [isGuest, setIsGuest] = useState(true);
//   const [error, setError] = useState(null);
//   const { user } = useAuth();
//   const [bookingAmount, setBookingAmount] = useState(0);

//   useEffect(() => {
//     const amount = localStorage.getItem('bookingAmount');
//     if (amount) {
//       setBookingAmount(parseFloat(amount));
//     }
//   }, []);

//   const fetchPaymentIntent = useCallback(async () => {
//     try {
//       const response = await fetch("/api/create-payment-intent", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           amount: Math.round(bookingAmount * 100), // Convert to cents
//           currency: 'usd', 
//           isGuest,
//           email: user?.email || ''
//         }),
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       if (data.clientSecret) {
//         setClientSecret(data.clientSecret);
//       } else {
//         throw new Error("No clientSecret received from backend");
//       }
//     } catch (err) {
//       console.error("Error fetching clientSecret:", err);
//       setError(err.message);
//     }
//   }, [isGuest, user, bookingAmount]);

//   useEffect(() => {
//     if (bookingAmount > 0) {
//       fetchPaymentIntent();
//     }
//   }, [fetchPaymentIntent, bookingAmount]);

//   if (error) return <div>Error: {error}</div>;
//   if (!clientSecret) return <div>Loading...</div>;

//   return (
//     <Elements stripe={stripePromise} options={{ clientSecret }}>
//       <div className="checkout-container">
//         <h2>Checkout</h2>
//         <p>Total Amount: ${bookingAmount.toFixed(2)}</p>
//         {!user && (
//           <div className="auth-toggle">
//             <button onClick={() => setIsGuest(false)} className={!isGuest ? 'active' : ''}>
//               Sign In / Sign Up
//             </button>
//             <button onClick={() => setIsGuest(true)} className={isGuest ? 'active' : ''}>
//               Continue as Guest
//             </button>
//           </div>
//         )}
//         {!user && !isGuest ? (
//           <AuthComponent />
//         ) : (
//           <CheckoutForm clientSecret={clientSecret} user={user} isGuest={isGuest} bookingAmount={bookingAmount} />
//         )}
//       </div>
//     </Elements>
//   );
// };

// const AuthComponent = () => (
//   <div className="auth-component">
//     <h3>Sign in or Create an Account</h3>
//     <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
//   </div>
// );

// const CheckoutForm = ({ clientSecret, user, isGuest, bookingAmount }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [email, setEmail] = useState(user?.email || '');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [paymentStatus, setPaymentStatus] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!stripe || !clientSecret) return;

//     stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
//       switch (paymentIntent.status) {
//         case "succeeded":
//           setPaymentStatus("Payment succeeded!");
//           break;
//         case "processing":
//           setPaymentStatus("Your payment is processing.");
//           break;
//         case "requires_payment_method":
//           setPaymentStatus("Your payment was not successful, please try again.");
//           break;
//         default:
//           setPaymentStatus("Something went wrong.");
//           break;
//       }
//     });
//   }, [stripe, clientSecret]);

//   useEffect(() => {
//     const createRideRequestAsync = async () => {
//       if (paymentStatus === "Payment succeeded!") {
//         try {
//           await createRideRequest({
//             amount: bookingAmount,
//             userLocation: localStorage.getItem('pickupLocation') || "Pickup Address Example",
//             destinationLocation: localStorage.getItem('destinationLocation') || "Destination Address Example"
//           }, email);
          
//           // Clear localStorage
//           localStorage.removeItem('bookingAmount');
//           localStorage.removeItem('pickupLocation');
//           localStorage.removeItem('destinationLocation');
          
//           // Navigate to home page after successful payment and ride request creation
//           navigate('/');
//         } catch (error) {
//           console.error('Error creating ride request:', error);
//           setPaymentStatus('Ride request creation failed. Please contact support.');
//         }
//       }
//     };

//     createRideRequestAsync();
//   }, [paymentStatus, bookingAmount, email, navigate]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsProcessing(true);
//     setPaymentStatus('');

//     if (!stripe || !elements) {
//       setPaymentStatus('Stripe.js has not loaded. Please try again later.');
//       setIsProcessing(false);
//       return;
//     }

//     try {
//       const { error: submitError } = await elements.submit();
//       if (submitError) {
//         throw new Error(submitError.message);
//       }

//       const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
//         elements,
//         confirmParams: {
//           return_url: "http://localhost:3000/",
//           payment_method_data: {
//             billing_details: { email },
//           },
//         },
//         redirect: 'if_required',
//       });

//       if (confirmError) {
//         throw new Error(confirmError.message);
//       }

//       console.log('Payment successful!', paymentIntent);
//       setPaymentStatus('Payment successful!');
      
//       await savePaymentInfoToFirebase(paymentIntent, { email, bookingAmount });

//       // Navigation to home page is handled in the useEffect hook
//     } catch (error) {
//       console.error('Error:', error);
//       setPaymentStatus(error.message || 'An error occurred. Please try again.');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="checkout-form">
//       {isGuest && (
//         <div className="form-group">
//           <label htmlFor="email">Email</label>
//           <input
//             id="email"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>
//       )}
//       <PaymentElement />
//       <button type="submit" disabled={isProcessing || !stripe || !elements}>
//         {isProcessing ? 'Processing...' : 'Pay Now'}
//       </button>
//       {paymentStatus && <div className="payment-status">{paymentStatus}</div>}
//     </form>
//   );
// };

// CheckoutForm.propTypes = {
//   clientSecret: PropTypes.string.isRequired,
//   user: PropTypes.object,
//   isGuest: PropTypes.bool.isRequired,
//   bookingAmount: PropTypes.number.isRequired,
// };

// const savePaymentInfoToFirebase = async (paymentIntent, customer) => {
//   const paymentRef = doc(db, 'payments', paymentIntent.id);
//   await setDoc(paymentRef, {
//     amount: customer.bookingAmount,
//     status: paymentIntent.status,
//     customer,
//     userId: auth.currentUser?.uid || 'anonymous',
//     createdAt: serverTimestamp(),
//   });
// };

// const createRideRequest = async (rideDetails, customerEmail) => {
//   const rideRequestRef = doc(collection(db, 'rideRequests'));

//   try {
//     await setDoc(rideRequestRef, {
//       id: rideRequestRef.id,
//       hostId: '',
//       rideFee: rideDetails.amount,
//       user_uid: auth.currentUser?.uid || 'anonymous',
//       user_email: auth.currentUser?.email || customerEmail,
//       user_location: rideDetails.userLocation,
//       destination_location: rideDetails.destinationLocation,
//       status: 'pending',
//       is_driver_assigned: false,
//       createdAt: serverTimestamp(),
//     });
//     console.log('Ride request created successfully with ID:', rideRequestRef.id);
//   } catch (error) {
//     console.error('Error creating ride request', error);
//     throw error;
//   }
// };

// export default CheckoutPage;

// CheckoutPage.js

import React, { useState, useEffect } from 'react';
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from '../../context/AuthContext';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { useNavigate } from 'react-router-dom';

const STRIPE_PUBLIC_KEY = import.meta.env.REACT_APP_STRIPE_PUBLIC_KEY;
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false,
  },
};

const CheckoutPage = () => {
  const [isGuest, setIsGuest] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [bookingAmount, setBookingAmount] = useState(0);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const amount = localStorage.getItem('bookingAmount');
    if (amount) {
      setBookingAmount(parseFloat(amount));
    }
  }, []);

  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(bookingAmount * 100),
          currency: 'usd',
          email: email,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      setError(err.message);
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <p>Total Amount: ${bookingAmount.toFixed(2)}</p>
      {!user && !isGuest && (
        <div className="auth-toggle">
          <button onClick={() => setIsGuest(false)} className={!isGuest ? 'active' : ''}>
            Sign In / Sign Up
          </button>
          <button onClick={() => setIsGuest(true)} className={isGuest ? 'active' : ''}>
            Continue as Guest
          </button>
        </div>
      )}
      {!user && !isGuest ? (
        <AuthComponent />
      ) : (
        <div>
          {(!user || isGuest) && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          <button onClick={handleCheckout}>
            Proceed to Payment
          </button>
          {error && <div className="error">{error}</div>}
        </div>
      )}
    </div>
  );
};

const AuthComponent = () => (
  <div className="auth-component">
    <h3>Sign in or Create an Account</h3>
    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
  </div>
);

export default CheckoutPage;
