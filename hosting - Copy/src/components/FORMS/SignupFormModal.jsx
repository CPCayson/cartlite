import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  useToast,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from '@chakra-ui/react';
import { useAuth } from '@context/AuthContext'; // Ensure correct path
import { useNavigate } from 'react-router-dom';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css'; // Import Firebase UI CSS
import PropTypes from 'prop-types';

const SignupFormModal = ({ isOpen, onClose }) => {
  const { user } = useAuth(); // Get the user from your context
  const toast = useToast();
  const navigate = useNavigate();

  // Function to initialize Firebase UI
  const initializeFirebaseUI = () => {
    // Check if FirebaseUI instance already exists to prevent multiple instances
    if (!firebaseui.auth.AuthUI.getInstance()) {
      const ui = new firebaseui.auth.AuthUI(firebase.auth());

      const uiConfig = {
        signInSuccessUrl: '/host', // Redirect after successful sign-in
        signInOptions: [
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          // Add other providers here if needed
        ],
        tosUrl: 'https://yourapp.com/terms', // Replace with your Terms of Service URL
        privacyPolicyUrl: 'https://yourapp.com/privacy', // Replace with your Privacy Policy URL
        // Other Firebase UI configurations can go here
      };

      ui.start('#firebaseui-auth-container', uiConfig);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initializeFirebaseUI();
    }

    // Cleanup Firebase UI instance when modal closes
    return () => {
      const ui = firebaseui.auth.AuthUI.getInstance();
      if (ui) {
        ui.reset();
      }
    };
  }, [isOpen]);

  const handleGoBack = () => {
    navigate('/');
    onClose(); // Close the modal when navigating back
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'xl' }} isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white" borderRadius="lg" overflow="hidden">
        <ModalHeader>
          <Flex justify="space-between" align="center">
            <Heading size={{ base: 'md', md: 'lg' }}>Sign Up</Heading>
            <ModalCloseButton size="lg" />
          </Flex>
        </ModalHeader>
        <ModalBody p={0}>
          <Flex
            flexDirection={{ base: 'column', md: 'row' }}
            minH={{ base: 'auto', md: '400px' }}
            maxH={{ base: '90vh', md: 'auto' }}
          >
            <Box
              flex="1"
              bgImage="url('/loading-image.png')" // Replace with your image path
              bgPosition="center"
              bgSize="cover"
              minH={{ base: '200px', md: '100%' }}
              position="relative"
            >
              <Box
                bg="blackAlpha.600"
                w="100%"
                h="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
              >
                <Heading color="white" size={{ base: 'md', md: 'lg' }}>
                  Welcome!
                </Heading>
                <Button
                  mt={4}
                  onClick={handleGoBack}
                  colorScheme="teal"
                  variant="outline"
                  size={{ base: 'md', md: 'lg' }}
                >
                  Go Back
                </Button>
              </Box>
            </Box>

            {/* Right Form (Firebase UI container) */}
            <Box flex="1" p={{ base: 4, md: 8 }} bg="gray.700">
              <div id="firebaseui-auth-container" />
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Corrected PropTypes
SignupFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,  // Boolean to control modal visibility
  onClose: PropTypes.func.isRequired, // Function to close the modal
  
};

export default SignupFormModal;
