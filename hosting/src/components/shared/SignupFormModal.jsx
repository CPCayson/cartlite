// // src/components/shared/SignupFormModal.jsx

// import React from 'react';
// import {
//   Box,
//   Button,
//   Heading,
//   Flex,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalHeader,
//   ModalCloseButton,
//   ModalBody,
// } from '@chakra-ui/react';
// import { useNavigate } from 'react-router-dom';
// import { auth } from '../../hooks/firebase/firebaseConfig';
// import { EmailAuthProvider, GoogleAuthProvider } from 'firebase/auth';
// import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
// import PropTypes from 'prop-types';

// const SignupFormModal = ({ isOpen, onClose }) => {
//   const navigate = useNavigate();

//   const uiConfig = {
//     signInFlow: 'popup',
//     signInOptions: [
//       EmailAuthProvider.PROVIDER_ID,
//       GoogleAuthProvider.PROVIDER_ID,
//     ],
//     callbacks: {
//       signInSuccessWithAuthResult: (authResult) => {
//         onClose();
//         navigate('/');
//         return false;
//       },
//     },
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       size={{ base: 'full', md: 'xl' }}
//       isCentered
//       motionPreset="slideInBottom"
//     >
//       <ModalOverlay />
//       <ModalContent bg="gray.800" color="white" borderRadius="lg" overflow="hidden">
//         <ModalHeader>
//           <Flex justify="space-between" align="center">
//             <Heading size={{ base: 'md', md: 'lg' }}>Sign Up</Heading>
//             <ModalCloseButton size="lg" />
//           </Flex>
//         </ModalHeader>
//         <ModalBody p={0}>
//           <Flex
//             flexDirection={{ base: 'column', md: 'row' }}
//             minH={{ base: 'auto', md: '400px' }}
//             maxH={{ base: '90vh', md: 'auto' }}
//           >
//             <Box
//               flex="1"
//               bgImage="url('/loading-image.png')" // Replace with your image path
//               bgPosition="center"
//               bgSize="cover"
//               minH={{ base: '200px', md: '100%' }}
//               position="relative"
//             >
//               <Box
//                 bg="blackAlpha.600"
//                 w="100%"
//                 h="100%"
//                 display="flex"
//                 alignItems="center"
//                 justifyContent="center"
//                 flexDirection="column"
//               >
//                 <Heading color="white" size={{ base: 'md', md: 'lg' }}>
//                   Welcome!
//                 </Heading>
//                 <Button
//                   mt={4}
//                   onClick={onClose}
//                   colorScheme="teal"
//                   variant="outline"
//                   size={{ base: 'md', md: 'lg' }}
//                 >
//                   Go Back
//                 </Button>
//               </Box>
//             </Box>

//             {/* Right Form (Firebase UI container) */}
//             <Box flex="1" p={{ base: 4, md: 8 }} bg="gray.700">
//               <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />
//             </Box>
//           </Flex>
//         </ModalBody>
//       </ModalContent>
//     </Modal>
//   );
// };

// SignupFormModal.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
// };

// export default SignupFormModal;
// src/components/shared/SignupFormModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Modal from '@components/shared/Modal';

const SignupFormModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal title="Signup" onClose={onClose}>
      <form className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-gray-700 dark:text-gray-300">Username</label>
          <input
            type="text"
            id="username"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
            placeholder="Enter your username"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-gray-700 dark:text-gray-300">Password</label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white"
            placeholder="Enter your password"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
        >
          Sign Up
        </button>
      </form>
    </Modal>
  );
};

SignupFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SignupFormModal;
