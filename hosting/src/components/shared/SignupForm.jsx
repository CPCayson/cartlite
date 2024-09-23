// src/components/shared/SignupForm.jsx

import React, { useState, useCallback } from 'react';
import './AuthForm.css'
import {
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  useToast,
  FormErrorMessage,
  Progress,
  Checkbox,
  IconButton,
} from '@chakra-ui/react';
import { useAuth } from '@context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
// Remove unused icons if not needed
// import { FaFacebook, FaTwitter } from 'react-icons/fa';
// import { PhoneIcon } from '@chakra-ui/icons';
import zxcvbn from 'zxcvbn';
import { useNavigate } from 'react-router-dom';

const SignupForm = ({ onClose, isSignup, handleToggle }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    // Remove phoneNumber if not needed
    // phoneNumber: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState({});

  const { login, register, googleSignIn, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

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
        await register(formData.email, formData.password, {
          fullName: formData.fullName,
        });
        // The user will be redirected to Stripe onboarding
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
        navigate('/'); // Adjust the route as needed
      }
      // Close the modal after successful login/signup
      onClose();
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

  const handleSocialSignIn = async (provider) => {
    try {
      switch (provider) {
        case 'google':
          await googleSignIn();
          break;
        // Add cases for other social providers if implemented
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
      // Close the modal after successful social login
      onClose();
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

  const isLoading = false; // Adjust according to your auth status

  return (
    <div>
      <Heading mb={6} textAlign="center">
        {isSignup ? 'Sign Up' : 'Log In'}
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              required
              placeholder="Your Email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.password}>
            <FormLabel>Password</FormLabel>
            <Input
              name="password"
              type="password"
              required
              placeholder="Your Password"
              value={formData.password}
              onChange={handleInputChange}
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
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="fullName"
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
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
              <div className="flex justify-between w-full">
                <IconButton
                  icon={<FcGoogle />}
                  onClick={() => handleSocialSignIn('google')}
                  isLoading={isLoading}
                  aria-label="Sign in with Google"
                  variant="outline"
                />
                {/* Add other social sign-in buttons if implemented */}
              </div>
              {/* Remove phone sign-in and password reset if not used */}
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
      </form>
    </div>
  );
};

export default SignupForm;
