import { db, auth } from '../firebase/firebaseConfig';
import { collection, doc, setDoc, getDoc, updateDoc, addDoc, query, where, onSnapshot, GeoPoint, serverTimestamp } from 'firebase/firestore';

// Function to create a new ride request
export async function createRideRequest(paymentIntent, rideDetails) {
  console.log('firebaseAPI: Creating a new ride request with details:', rideDetails);

  const rideRequestRef = doc(collection(db, 'rideRequests'));
  try {
    await setDoc(rideRequestRef, {
      id: rideRequestRef.id,
      paymentIntentId: paymentIntent.id,
      hostId: rideDetails.hostId,
      rideFee: rideDetails.amount,
      user_uid: rideDetails.userId,
      user_name: rideDetails.userName,
      user_location: new GeoPoint(rideDetails.userLocation.latitude, rideDetails.userLocation.longitude),
      destination_location: new GeoPoint(rideDetails.destinationLocation.latitude, rideDetails.destinationLocation.longitude),
      status: 'pending',
      is_driver_assigned: false,
      createdAt: serverTimestamp(),
    });
    console.log('firebaseAPI: Ride request created successfully with ID:', rideRequestRef.id);
  } catch (error) {
    console.error('firebaseAPI: Error creating ride request', error);
    throw error;
  }
}

// Function to update a booking
export async function updateBooking(rideRequestId, bookingData) {
  console.log('firebaseAPI: Updating booking with ID:', rideRequestId, 'and data:', bookingData);

  const bookingRef = doc(db, 'bookings', rideRequestId);
  try {
    await updateDoc(bookingRef, {
      ...bookingData,
      updated_at: serverTimestamp(),
    });
    console.log('firebaseAPI: Booking updated successfully');
  } catch (error) {
    console.error('firebaseAPI: Error updating booking', error);
    throw error;
  }
}

// Function to fetch user profile data
export async function getProfileData(userId) {
  console.log('firebaseAPI: Fetching profile data for user ID:', userId);

  const userDocRef = doc(db, 'users', userId);
  try {
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      console.log('firebaseAPI: Profile data fetched successfully:', userDoc.data());
      return userDoc.data();
    } else {
      console.warn('firebaseAPI: No profile data found for user ID:', userId);
      return null;
    }
  } catch (error) {
    console.error('firebaseAPI: Error fetching profile data', error);
    throw error;
  }
}

// Function to save user profile data
export async function saveProfileData(userId, profileData) {
  console.log('firebaseAPI: Saving profile data for user ID:', userId, 'with data:', profileData);

  const userDocRef = doc(db, 'users', userId);
  try {
    await setDoc(userDocRef, profileData, { merge: true });
    console.log('firebaseAPI: Profile data saved successfully');
  } catch (error) {
    console.error('firebaseAPI: Error saving profile data', error);
    throw error;
  }
}

// Function to listen for ride requests
export function listenToRideRequests(callback) {
  console.log('firebaseAPI: Setting up listener for ride requests');

  const q = query(collection(db, 'rideRequests'), where('is_driver_assigned', '==', false));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const rideRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('firebaseAPI: Ride requests snapshot updated:', rideRequests);
    callback(rideRequests);
  }, (error) => {
    console.error('firebaseAPI: Error listening to ride requests', error);
  });

  return unsubscribe;
}

// Add more Firebase API functions as needed...

