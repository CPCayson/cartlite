import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Textarea,
  Container,
  Heading,
  Spinner,
  Image,
  Progress,
  FormErrorMessage,
  Select,
  useToast,
} from '@chakra-ui/react';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { useAuth } from '@context/AuthContext'; // Path to your AuthContext
import { db, storage } from '@hooks/firebase/firebaseConfig'; // Firebase config

const UserProfileForm = () => {
  const { user } = useAuth(); // Access authenticated user
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    languagesSpoken: '',
    availableDays: '',
    availableHours: '',
    favoriteRestaurants: '',
    favoriteBars: '',
    favoriteEvents: '',
    shortBio: '',
    headshot: '',
    driverLicense: {
      licenseNumber: '',
      licenseState: '',
      licenseExpiry: '',
    },
    stripeAccountStatus: '',
  });
  const [loading, setLoading] = useState({ initialLoad: true, saving: false, uploading: false });
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const toast = useToast();

  // Fetch the profile details from Firestore
  useEffect(() => {
    if (!user) return;

    const fetchProfileDetails = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setProfileData(userDocSnap.data());
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
        setLoading((prev) => ({ ...prev, initialLoad: false }));
      }
    };

    fetchProfileDetails();
  }, [user, toast]);

  // Handle profile data change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file upload for headshot
  const handleHeadshotUpload = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a valid image format (JPG, PNG).',
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

      const storageRef = ref(storage, `users/${user.uid}/headshots/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setLoading((prev) => ({ ...prev, uploading: true }));

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
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
          setLoading((prev) => ({ ...prev, uploading: false }));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setProfileData((prevData) => ({
            ...prevData,
            headshot: downloadURL,
          }));
          setLoading((prev) => ({ ...prev, uploading: false }));
          toast({
            title: 'Image Uploaded',
            description: 'Your headshot has been successfully uploaded.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      );
    },
    [user, toast]
  );

  // Save profile to Firestore
  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setLoading((prev) => ({ ...prev, saving: true }));

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, profileData, { merge: true });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Could not save your profile. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Heading as="h1" size="xl" mb={6} textAlign="center">
        User Profile
      </Heading>
      {loading.initialLoad ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <Spinner size="xl" />
        </Box>
      ) : (
        <Box borderWidth={1} borderRadius="lg" p={6} bg="white" boxShadow="lg" w="100%">
          <VStack spacing={6} align="stretch">
            {/* Headshot Upload */}
            <FormControl isInvalid={!!errors.headshot}>
              <FormLabel>Headshot Photo</FormLabel>
              <Box position="relative" width="150px" height="150px">
                <Image
                  src={profileData.headshot || 'https://via.placeholder.com/150'}
                  alt="Headshot"
                  boxSize="150px"
                  objectFit="cover"
                  borderRadius="full"
                  fallback={<Spinner />}
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Progress size="sm" value={uploadProgress} position="absolute" bottom="0" width="100%" />
                )}
              </Box>
              <Input type="file" accept="image/*" display="none" id="headshot-upload" onChange={handleHeadshotUpload} />
              <label htmlFor="headshot-upload">
                <Button as="span" size="sm" colorScheme="teal" mt={2} isLoading={loading.uploading}>
                  Upload Headshot
                </Button>
              </label>
              {errors.headshot && <FormErrorMessage>{errors.headshot}</FormErrorMessage>}
            </FormControl>

            {/* Username */}
            <FormControl isRequired isInvalid={!!errors.username}>
              <FormLabel>Username</FormLabel>
              <Input name="username" value={profileData.username} onChange={handleProfileChange} placeholder="Enter your username" />
              {errors.username && <FormErrorMessage>{errors.username}</FormErrorMessage>}
            </FormControl>

            {/* Email */}
            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input name="email" type="email" value={profileData.email} onChange={handleProfileChange} placeholder="Enter your email" />
              {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
            </FormControl>

            {/* Other profile fields (Phone Number, Languages Spoken, etc.) */}
            {/* Add your other form fields here similar to the username and email fields */}

            {/* Save Button */}
            <Button colorScheme="teal" size="lg" onClick={handleSaveProfile} isLoading={loading.saving} loadingText="Saving">
              Save Profile
            </Button>
          </VStack>
        </Box>
      )}
    </Container>
  );
};

export default UserProfileForm;
