import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '@chakra-ui/react';

export const useUserProfileForm = () => {
  const { user, updateUserProfile } = useAuth();
  const toast = useToast();
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    stripeAccountStatus: '',
    // Add other profile fields as needed
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        stripeAccountStatus: user.stripeAccountStatus || 'not_created',
        // Set other profile fields from user data
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(profileData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return {
    profileData,
    handleProfileChange,
    handleSaveProfile,
  };
};

const updateUserProfile = async (profileData) => {
  if (!user) {
    console.error('Attempted to update profile with no user logged in');
    throw new Error('No user logged in');
  }
  console.log('Updating user profile:', profileData);
  setLoading(true);
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, profileData);
    setUser((prevUser) => ({ ...prevUser, ...profileData }));
    setError(null);
    console.log('Profile update successful');
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  } catch (err) {
    console.error('Profile update failed:', err);
    handleError('Profile Update Failed', err.message);
  } finally {
    setLoading(false);
  }
};
