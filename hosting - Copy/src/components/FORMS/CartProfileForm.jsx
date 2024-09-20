

import React, { useReducer, useEffect, useCallback } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { useToast } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { useFirestore, useStorage } from 'reactfire'; // Ensures Firebase is accessed through reactfire

// Initial state for the form
const initialState = {
  cartData: {
    cartName: '',
    cancellationFee: '',
    operatingHours: '',
    capacity: 1,
    description: '',
    features: {
      wifi: false,
      chargingPorts: false,
      climateControl: false,
    },
    vehicleDetails: {
      model: '',
      year: '',
      registrationDetails: '',
    },
    images: [
      'https://via.placeholder.com/150',
      'https://via.placeholder.com/150',
      'https://via.placeholder.com/150',
    ],
    averageRating: 0,
    reviews: [],
  },
  loading: {
    initialLoad: false,
    saving: false,
    uploading: false,
  },
  errors: {},
  uploadProgress: {},
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_CART_DATA: 'SET_CART_DATA',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_UPLOAD_PROGRESS: 'SET_UPLOAD_PROGRESS',
  RESET_UPLOAD_PROGRESS: 'RESET_UPLOAD_PROGRESS',
};

// Reducer function for state management
const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, ...action.payload },
      };
    case actionTypes.SET_CART_DATA:
      return {
        ...state,
        cartData: { ...state.cartData, ...action.payload },
      };
    case actionTypes.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, ...action.payload },
      };
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        errors: {},
      };
    case actionTypes.SET_UPLOAD_PROGRESS:
      return {
        ...state,
        uploadProgress: { ...state.uploadProgress, ...action.payload },
      };
    default:
      return state;
  }
};

const CartProfileForm = () => {
  const { user } = useAuth(); // Access user data from AuthContext
  const db = useFirestore();  // Use Firestore from reactfire
  const storage = useStorage(); // Use Firebase storage from reactfire
  const toast = useToast();
  
  const [state, dispatch] = useReducer(reducer, initialState);
  const { cartData, loading, errors, uploadProgress } = state;

  // Fetch cart details
  useEffect(() => {
    if (!user) return;

    const fetchCartDetails = async () => {
      dispatch({ type: actionTypes.SET_LOADING, payload: { initialLoad: true } });

      try {
        const cartDocRef = doc(db, 'carts', user.uid);
        const cartDocSnap = await getDoc(cartDocRef);

        if (cartDocSnap.exists()) {
          dispatch({
            type: actionTypes.SET_CART_DATA,
            payload: cartDocSnap.data(),
          });
        } else {
          console.log('No cart profile found.');
        }
      } catch (error) {
        console.error('Error fetching cart profile:', error);
        toast({
          title: 'Error',
          description: 'Could not load your cart profile. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: { initialLoad: false } });
      }
    };

    fetchCartDetails();
  }, [user, db, toast]);

  // Fetch reviews and calculate average rating
  const fetchReviews = useCallback(async () => {
    if (!user) return;

    try {
      const reviewsColRef = collection(db, 'carts', user.uid, 'reviews');
      const reviewsSnap = await getDocs(reviewsColRef);
      const reviews = reviewsSnap.docs.map(doc => doc.data());

      const averageRating =
        reviews.length > 0
          ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
          : 0;

      dispatch({
        type: actionTypes.SET_CART_DATA,
        payload: { reviews, averageRating },
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Could not load reviews. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [user, db, toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Input change handler for form fields
  const handleCartChange = useCallback(
    (e) => {
      const { name, value, checked, type } = e.target;

      if (type === 'checkbox') {
        dispatch({
          type: actionTypes.SET_CART_DATA,
          payload: { features: { ...cartData.features, [name]: checked } },
        });
      } else {
        dispatch({
          type: actionTypes.SET_CART_DATA,
          payload: { [name]: value },
        });
      }
    },
    [cartData.features]
  );

  // Image upload handler
  const handleImageUpload = useCallback(
    async (e, index) => {
      const file = e.target.files[0];
      if (!file) return;

      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a valid image format (JPG, PNG, or GIF).',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB limit
      if (file.size > maxSize) {
        toast({
          title: 'File Too Large',
          description: 'Image size should not exceed 5MB.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const storageRef = ref(storage, `carts/${user.uid}/images/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          dispatch({
            type: actionTypes.SET_UPLOAD_PROGRESS,
            payload: { [index]: progress },
          });
        },
        (error) => {
          console.error('Error uploading image:', error);
          toast({
            title: 'Upload Failed',
            description: error.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const newImages = [...cartData.images];
          newImages[index] = downloadURL;
          dispatch({
            type: actionTypes.SET_CART_DATA,
            payload: { images: newImages },
          });
          toast({
            title: 'Image Uploaded',
            description: 'Your image has been successfully uploaded.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      );
    },
    [cartData.images, storage, user, toast]
  );

  // Save or update cart profile
  const handleSaveCartInfo = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Unauthorized',
        description: 'You must be logged in to update your cart profile.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const cartDocRef = doc(db, 'carts', user.uid);
      await setDoc(cartDocRef, cartData, { merge: true });
      toast({
        title: 'Cart Profile Updated',
        description: 'Your cart profile has been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating cart profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [user, db, cartData, toast]);

  return (
    <div>
      <h1>Cart Profile Form</h1>
      <form>
        {/* Cart Name */}
        <input
          type="text"
          name="cartName"
          value={cartData.cartName}
          onChange={handleCartChange}
          placeholder="Cart Name"
        />

        {/* Features */}
        <label>
          WiFi
          <input
            type="checkbox"
            name="wifi"
            checked={cartData.features.wifi}
            onChange={handleCartChange}
          />
        </label>

        <label>
          Charging Ports
          <input
            type="checkbox"
            name="chargingPorts"
            checked={cartData.features.chargingPorts}
            onChange={handleCartChange}
          />
        </label>

        {/* Image Upload */}
        <label>
          Image 1:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 0)}
          />
        </label>

        {/* Save Button */}
        <button type="button" onClick={handleSaveCartInfo}>
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default CartProfileForm;
