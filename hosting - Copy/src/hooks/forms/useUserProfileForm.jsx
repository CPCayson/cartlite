// src/hooks/forms/useUserProfileForm.js

import { useReducer, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useToast } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { useFirebase } from '../../components/other/FirebaseContext';

// Initial state for the reducer
const initialState = {
  profileData: {
    username: '',
    email: '',
    phoneNumber: '',
    languagesSpoken: '',
    availableDays: [],
    availableHours: '',
    headshot: '', // URL of the uploaded headshot
    favoriteRestaurants: '',
    favoriteBars: '',
    favoriteEvents: '',
    shortBio: '',
    driverLicense: {
      licenseNumber: '',
      licenseState: '',
      licenseExpiry: '',
    },
    stripeAccountStatus: 'not_created',
  },
  loading: {
    initialLoad: false,
    saving: false,
    uploading: false,
  },
  errors: {},
  uploadProgress: 0, // Track progress for headshot
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_PROFILE_DATA: 'SET_PROFILE_DATA',
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
    case actionTypes.SET_PROFILE_DATA:
      return {
        ...state,
        profileData: { ...state.profileData, ...action.payload },
      };
    case actionTypes.SET_ERROR:
      return {
        ...state,
        errors: { ...state.errors, ...action.payload },
      };
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        errors: { ...state.errors, ...action.payload },
      };
    case actionTypes.SET_UPLOAD_PROGRESS:
      return {
        ...state,
        uploadProgress: action.payload,
      };
    case actionTypes.RESET_UPLOAD_PROGRESS:
      return {
        ...state,
        uploadProgress: 0,
      };
    default:
      return state;
  }
};

export const useUserProfileForm = () => {
  const { user } = useAuth();
  const { db, storage } = useFirebase();
  const toast = useToast();

  const [state, dispatch] = useReducer(reducer, initialState);
  const { profileData, loading, errors, uploadProgress } = state;

  // Fetch existing user profile data
  useEffect(() => {
    if (!user) return;

    const fetchUserProfile = async () => {
      dispatch({ type: actionTypes.SET_LOADING, payload: { initialLoad: true } });
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          dispatch({
            type: actionTypes.SET_PROFILE_DATA,
            payload: {
              username: userData.username || '',
              email: userData.email || '',
              phoneNumber: userData.phoneNumber || '',
              languagesSpoken: userData.languagesSpoken || '',
              availableDays: userData.availableDays || [],
              availableHours: userData.availableHours || '',
              headshot: userData.headshot || '',
              favoriteRestaurants: userData.favoriteRestaurants || '',
              favoriteBars: userData.favoriteBars || '',
              favoriteEvents: userData.favoriteEvents || '',
              shortBio: userData.shortBio || '',
              driverLicense: {
                licenseNumber: userData.driverLicense?.licenseNumber || '',
                licenseState: userData.driverLicense?.licenseState || '',
                licenseExpiry: userData.driverLicense?.licenseExpiry || '',
              },
              stripeAccountStatus: userData.stripeAccountStatus || 'not_created',
            },
          });
        } else {
          console.log('No user profile found.');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: 'Error',
          description: 'Could not load your profile. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: { initialLoad: false } });
      }
    };

    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, db]);

  // Form validation
  const validate = useCallback(() => {
    const newErrors = {};
    if (!profileData.username.trim()) newErrors.username = 'Username is required.';
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else {
      // Simple email regex for validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        newErrors.email = 'Invalid email format.';
      }
    }
    if (!profileData.headshot) newErrors.headshot = 'Headshot photo is required.';
    if (profileData.driverLicense.licenseNumber && profileData.driverLicense.licenseNumber.trim().length === 0) {
      newErrors.licenseNumber = 'License Number is required.';
    }
    if (profileData.driverLicense.licenseState && profileData.driverLicense.licenseState.trim().length === 0) {
      newErrors.licenseState = 'License State is required.';
    }
    if (profileData.driverLicense.licenseExpiry && !profileData.driverLicense.licenseExpiry.trim()) {
      newErrors.licenseExpiry = 'License Expiry Date is required.';
    }
    // Add more validations as needed

    if (Object.keys(newErrors).length > 0) {
      dispatch({ type: actionTypes.SET_ERROR, payload: newErrors });
      return false;
    }

    dispatch({ type: actionTypes.CLEAR_ERROR, payload: newErrors });
    return true;
  }, [profileData]);

  // Handler for input changes
  const handleProfileChange = useCallback((e) => {
    const { name, value } = e.target;
    // Handle nested fields (e.g., driverLicense.licenseNumber)
    const keys = name.split('.');
    if (keys.length === 2) {
      dispatch({
        type: actionTypes.SET_PROFILE_DATA,
        payload: {
          [keys[0]]: {
            ...profileData[keys[0]],
            [keys[1]]: value,
          },
        },
      });
    } else if (name === 'availableDays') {
      // Handle multiple selection for availableDays
      const options = e.target.options;
      const selected = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selected.push(options[i].value);
        }
      }
      dispatch({
        type: actionTypes.SET_PROFILE_DATA,
        payload: { availableDays: selected },
      });
    } else {
      dispatch({
        type: actionTypes.SET_PROFILE_DATA,
        payload: { [name]: value },
      });
    }
  }, [profileData]);

  // Handler for headshot upload with progress
  const handleHeadshotUpload = useCallback(
    (e) => {
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
          description: 'Headshot size should not exceed 5MB.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Validate image dimensions (min 300x300 pixels)
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const { width, height } = img;
        URL.revokeObjectURL(img.src);
        if (width < 300 || height < 300) {
          toast({
            title: 'Invalid Image Dimensions',
            description: 'Headshot should be at least 300x300 pixels.',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        // Proceed with upload
        uploadHeadshot(file);
      };
    },
    [toast]
  );

  const uploadHeadshot = useCallback(
    (file) => {
      if (!user) return;

      const storageRef = ref(storage, `headshots/${user.uid}/${Date.now()}_${file.name}`);
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
            payload: progress,
          });
        },
        (error) => {
          console.error('Error uploading headshot:', error);
          toast({
            title: 'Upload Failed',
            description: error.message || 'Failed to upload headshot.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          dispatch({
            type: actionTypes.RESET_UPLOAD_PROGRESS,
          });
          dispatch({
            type: actionTypes.SET_LOADING,
            payload: { uploading: false },
          });
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            dispatch({
              type: actionTypes.SET_PROFILE_DATA,
              payload: { headshot: downloadURL },
            });
            toast({
              title: 'Headshot Uploaded',
              description: 'Your headshot has been successfully uploaded.',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            dispatch({
              type: actionTypes.SET_UPLOAD_PROGRESS,
              payload: 100,
            });
            dispatch({
              type: actionTypes.SET_LOADING,
              payload: { uploading: false },
            });
          });
        }
      );
    },
    [user, storage, toast]
  );

  // Handler to save or update profile info
  const handleSaveProfile = useCallback(async () => {
    if (!user) {
      toast({
        title: 'Unauthorized',
        description: 'You must be logged in to update your profile.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate form before saving
    if (!validate()) return;

    dispatch({ type: actionTypes.SET_LOADING, payload: { saving: true } });

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, profileData);

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not update your profile.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: { saving: false } });
    }
  }, [user, db, profileData, toast, validate]);

  return {
    profileData,
    loading,
    errors,
    uploadProgress,
    handleProfileChange,
    handleHeadshotUpload,
    handleSaveProfile,
  };
};
