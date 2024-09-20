// SignupForm.jsx
import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Container,
  Heading,
  useToast,
  Flex,
  FormErrorMessage,
  Progress,
  Checkbox,
  IconButton,
  Image,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import { PhoneIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import zxcvbn from 'zxcvbn';
import { useNavigate } from 'react-router-dom';
import { useStripeIntegration } from '../../hooks/auth/useStripeIntegration';
import { useUserData } from '../../hooks/auth/useUserData';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../hooks/firebase/firebaseConfig'; // Ensure correct import path

const MotionInput = motion(Input);

const SignupForm = () => {
  const [isSignup, setIsSignup] = useState(true); // Show Register form first
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});

  const {
    login,
    register,
    googleSignIn,
    facebookSignIn,
    twitterSignIn,
    phoneSignIn,
    resetPassword,
    authStatus,
    authError,
    user,
  } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { initializeUserStripeAccount } = useStripeIntegration();
  const { updateUserData } = useUserData();

  const handleToggle = () => setIsSignup((prev) => !prev);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') {
      const result = zxcvbn(value);
      setPasswordStrength(result.score);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (isSignup && !formData.fullName) newErrors.fullName = 'Full name is required';
    if (isSignup && passwordStrength < 3) newErrors.password = 'Password is too weak';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: 'Form Error',
        description: 'Please correct the errors in the form.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      if (isSignup) {
        // Register the user
        const userCredential = await register(formData.email, formData.password, {
          fullName: formData.fullName,
        });
        toast({
          title: 'Account Created',
          description: "You've successfully signed up!",
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        const newUser = userCredential.user;

        // Step 1: Save user details to Firebase Firestore with 'isNew: true'
        await updateUserData(newUser, {
          email: formData.email,
          fullName: formData.fullName,
          createdAt: new Date().toISOString(),
          isNew: true,
        });

        // Step 2: Initialize Stripe customer and Express Connect account
        const stripeData = await initializeUserStripeAccount(newUser.uid, formData.email);

        // Step 3: Update Firebase user document with Stripe information
        const userDocRef = doc(db, 'users', newUser.uid);
        await updateDoc(userDocRef, {
          stripeConnectedAccountId: stripeData.stripeConnectedAccountId,
          stripeCustomerId: stripeData.stripeCustomerId,
          stripeAccountStatus: stripeData.stripeAccountStatus,
          stripeAccountLink: stripeData.stripeAccountLink,
          stripeLastUpdated: stripeData.stripeLastUpdated,
        });

        // Step 4: Navigate to Stripe Connect Onboarding since 'isNew' is true
        navigateToStripeOnboarding(stripeData.stripeAccountLink);
      } else {
        // Handle Login
        await login(formData.email, formData.password);
        toast({
          title: 'Login Successful',
          description: "You've been logged in.",
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Navigate to home page after successful login
        navigate('/host'); // Adjust the route as needed
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'Authentication Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  /**
   * Navigates the user to the Stripe onboarding session.
   * @param {string} stripeAccountLink - The URL for Stripe onboarding.
   */
  const navigateToStripeOnboarding = (stripeAccountLink) => {
    if (stripeAccountLink) {
      window.location.href = stripeAccountLink;
    } else {
      toast({
        title: 'Stripe Onboarding Error',
        description: 'Unable to navigate to Stripe onboarding session.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSocialSignIn = async (provider) => {
    try {
      switch (provider) {
        case 'google':
          await googleSignIn();
          break;
        case 'facebook':
          await facebookSignIn();
          break;
        case 'twitter':
          await twitterSignIn();
          break;
        default:
          throw new Error('Invalid provider');
      }
      toast({
        title: 'Login Successful',
        description: `You've been logged in with ${provider}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/'); // Redirect after social sign-in
    } catch (error) {
      console.error(`${provider} sign-in error:`, error);
      toast({
        title: 'Authentication Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePhoneSignIn = async () => {
    try {
      await phoneSignIn(formData.phoneNumber);
      toast({
        title: 'Phone Verification Sent',
        description: 'Please check your phone for the verification code.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      navigate('/'); // Redirect after phone sign-in initiation
    } catch (error) {
      console.error('Phone sign-in error:', error);
      toast({
        title: 'Phone Sign-In Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setErrors({ email: 'Email is required for password reset' });
      toast({
        title: 'Error',
        description: 'Email is required for password reset',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await resetPassword(formData.email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for password reset instructions.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Password Reset Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const isLoading = authStatus === 'pending';

  // Determine image visibility based on screen size
  const showImage = useBreakpointValue({ base: false, md: true });
  const handleGoBack = () => {
    navigate('/');
  };
  return (
    <Flex
      justify="center"
      align="center"
      minH="100vh"
      bg="gray.900"
      p={4}
      w="100vw"
      overflow="hidden"
    >
      <Container maxW="6xl" centerContent>
        <Flex
          bg="whiteAlpha.100"
          boxShadow="lg"
          rounded="lg"
          overflow="hidden"
          maxW="800px"
          w="100%"
          h="auto"
          flexDirection={{ base: 'column', md: 'row' }}
        >
          {/* Left Image - Visible on medium and larger screens */}
          {showImage && (
            <Box
              flex="1"
              bgImage="url('/loading-image.png')" // Replace with your image path
              bgPosition="center"
              bgSize="cover"
              minH={{ base: '200px', md: '100%' }}
            >
              {/* Optional: Add an overlay or content on the image */}
              <Box
                bg="blackAlpha.600"
                w="100%"
                h="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Heading color="white" size="md">
                  Welcome!
                </Heading>
                <button onClick={handleGoBack}>Go Back</button>
                </Box>
            </Box>
          )}

          {/* Right Form */}
          <Box flex="1" p={8} position="relative" bg="gray.800">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignup ? 'signup' : 'login'}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <Box as="form" onSubmit={handleSubmit} w="100%">
                  <Heading mb={6} textAlign="center" color="white">
                    {isSignup ? 'Sign Up' : 'Log In'}
                  </Heading>
                  <VStack spacing={4} align="stretch">
                    <FormControl isInvalid={errors.email || authError}>
                      <FormLabel color="white">Email</FormLabel>
                      <MotionInput
                        name="email"
                        type="email"
                        required
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        whileFocus={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                      />
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.password || authError}>
                      <FormLabel color="white">Password</FormLabel>
                      <MotionInput
                        name="password"
                        type="password"
                        required
                        placeholder="Your Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        whileFocus={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: 'gray.400' }}
                      />
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    </FormControl>

                    {isSignup && (
                      <>
                        <Progress
                          value={(passwordStrength + 1) * 20} // zxcvbn score: 0-4
                          colorScheme={passwordStrength > 2 ? 'green' : 'red'}
                          size="sm"
                          mb={4}
                        />
                        <FormControl isInvalid={errors.fullName}>
                          <FormLabel color="white">Full Name</FormLabel>
                          <MotionInput
                            name="fullName"
                            type="text"
                            required
                            placeholder="Your Full Name"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            whileFocus={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: 'gray.400' }}
                          />
                          <FormErrorMessage>{errors.fullName}</FormErrorMessage>
                        </FormControl>
                      </>
                    )}

                    {!isSignup && (
                      <Checkbox
                        colorScheme="yellow"
                        isChecked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        color="white"
                      >
                        Remember me
                      </Checkbox>
                    )}

                    <Button
                      type="submit"
                      colorScheme="yellow"
                      w="full"
                      isLoading={isLoading}
                      mt={4}
                    >
                      {isSignup ? 'Sign Up' : 'Log In'}
                    </Button>

                    {!isSignup && (
                      <>
                        <Flex justify="space-between" w="full">
                          <IconButton
                            icon={<FcGoogle />}
                            onClick={() => handleSocialSignIn('google')}
                            isLoading={isLoading}
                            aria-label="Sign in with Google"
                            variant="outline"
                            color="white"
                          />
                          <IconButton
                            icon={<FaFacebook />}
                            onClick={() => handleSocialSignIn('facebook')}
                            isLoading={isLoading}
                            aria-label="Sign in with Facebook"
                            variant="outline"
                            color="white"
                          />
                          <IconButton
                            icon={<FaTwitter />}
                            onClick={() => handleSocialSignIn('twitter')}
                            isLoading={isLoading}
                            aria-label="Sign in with Twitter"
                            variant="outline"
                            color="white"
                          />
                        </Flex>
                        <FormControl>
                          <FormLabel color="white">Phone Number</FormLabel>
                          <MotionInput
                            name="phoneNumber"
                            type="tel"
                            placeholder="Your Phone Number"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            whileFocus={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: 'gray.400' }}
                          />
                        </FormControl>
                        <Button
                          leftIcon={<PhoneIcon />}
                          onClick={handlePhoneSignIn}
                          w="full"
                          isLoading={isLoading}
                          colorScheme="blue"
                          variant="outline"
                        >
                          Sign in with Phone
                        </Button>
                        <Button
                          variant="link"
                          colorScheme="yellow"
                          onClick={handlePasswordReset}
                        >
                          Forgot Password?
                        </Button>
                      </>
                    )}

                    <Button
                      variant="link"
                      colorScheme="yellow"
                      onClick={handleToggle}
                      mt={4}
                      alignSelf="center"
                    >
                      {isSignup
                        ? 'Already have an account? Log In'
                        : "Don't have an account? Sign Up"}
                    </Button>
                  </VStack>
                </Box>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Flex>
      </Container>
    </Flex>
  );
};

export default SignupForm;


