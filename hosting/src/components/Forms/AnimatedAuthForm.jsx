import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, IconButton } from '@chakra-ui/react';
import { ChevronUpIcon } from '@chakra-ui/icons';
import SignupForm from './SignupForm';

const AnimatedAuthForm = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Delay to allow animation to complete
  };

  const handleLoginSuccess = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      onLoginSuccess();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <Box bg="gray.900" borderTopRadius="lg" p={4} position="relative">
            <IconButton
              icon={<ChevronUpIcon />}
              onClick={handleClose}
              position="absolute"
              top={2}
              right={2}
              zIndex={1}
            />
            <SignupForm onLoginSuccess={handleLoginSuccess} />
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import PropTypes from 'prop-types';

AnimatedAuthForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired,
};

export default AnimatedAuthForm;