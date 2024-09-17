import { useState, useEffect } from 'react';
import { Box, VStack, FormControl, FormLabel, Input, Button, useToast, Container, Heading } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

const UserProfileForm = () => {
  const { user, updateUserProfile } = useAuth();
  const toast = useToast();
  
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
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
      toast({
        title: "Update Failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Heading as="h1" size="xl" mb={6} textAlign="center">User Profile</Heading>
      <Box borderWidth={1} borderRadius="lg" p={6} bg="white" boxShadow="lg">
        <VStack spacing={6} align="stretch">
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input name="username" value={profileData.username} onChange={handleProfileChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input name="email" type="email" value={profileData.email} onChange={handleProfileChange} />
          </FormControl>
          <Button colorScheme="teal" size="lg" onClick={handleSaveProfile}>Save Profile</Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default UserProfileForm;
