// src/hooks/cart/useCartProfileForm.js

import { useReducer, useEffect, useCallback } from 'react';
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
import { useAuth } from '@context/AuthContext';
import { db as useFirestore, storage as useStorage } from '../firebase/firebaseConfig'; // Ensure reactfire hooks are used


// Initial state for the reducer
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
    estimatedPickupTime: '',
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

// Reducer function
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
    case actionTypes.RESET_UPLOAD_PROGRESS:
      return {
        ...state,
        uploadProgress: { ...state.uploadProgress, ...action.payload },
      };
    default:
      return state;
  }
};

export const useCartProfileForm = () => {
  const { user } = useAuth(); // Access user data from AuthContext
  const db = useFirestore();  // Access Firestore from reactfire
  const storage = useStorage(); // Access Firebase storage from reactfire
  const toast = useToast();

  const [state, dispatch] = useReducer(reducer, initialState);
  const { cartData, loading, errors, uploadProgress } = state;

  // Fetch existing cart details
  useEffect(() => {
    if (!user) return;

    const fetchCartDetails = async () => {
      dispatch({ type: actionTypes.SET_LOADING, payload: { initialLoad: true } });
      try {
        const cartDocRef = doc(db, 'carts', user.uid);
        const cartDocSnap = await getDoc(cartDocRef);

        if (cartDocSnap.exists()) {
          const userCartData = cartDocSnap.data();
          dispatch({
            type: actionTypes.SET_CART_DATA,
            payload: userCartData,
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

  // Input change handler
  const handleCartChange = useCallback((e) => {
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
  }, [cartData.features]);

  // Image upload handler
  const handleImageUpload = useCallback(async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a JPG, PNG, or GIF image.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      toast({
        title: 'File Too Large',
        description: 'Image size should not exceed 5MB.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate image dimensions
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      const { width, height } = img;
      URL.revokeObjectURL(img.src);
      if (width < 300 || height < 300) {
        toast({
          title: 'Invalid Image Dimensions',
          description: 'Image should be at least 300x300 pixels.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Proceed with upload
      const storageRef = ref(storage, `carts/${user.uid}/images/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      dispatch({
        type: actionTypes.SET_LOADING,
        payload: { uploading: true },
      });

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
            description: error.message || 'Failed to upload image.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          dispatch({
            type: actionTypes.RESET_UPLOAD_PROGRESS,
            payload: { [index]: 0 },
          });
          dispatch({
            type: actionTypes.SET_LOADING,
            payload: { uploading: false },
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
          dispatch({
            type: actionTypes.RESET_UPLOAD_PROGRESS,
            payload: { [index]: 100 },
          });
          dispatch({
            type: actionTypes.SET_LOADING,
            payload: { uploading: false },
          });
        }
      );
    };
  }, [cartData.images, storage, user, toast]);

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

  return {
    cartData,
    loading,
    errors,
    uploadProgress,
    handleCartChange,
    handleImageUpload,
    handleSaveCartInfo,
    fetchReviews,
  };
};
