// src/components/app/AppProviders.jsx

import { ErrorBoundary } from '../../context/ErrorBoundary';
import { FirebaseProvider } from '../../context/FirebaseContext';
import { AuthProvider } from '../../context/AuthContext';
import { ChakraProvider } from '@chakra-ui/react';
import { MapsProvider } from '../../context/MapsContext';
import PropTypes from 'prop-types';

const AppProviders = ({ children }) => (
  <ErrorBoundary>
    <FirebaseProvider>
      <AuthProvider>
        <ChakraProvider>
          <MapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            {children}
          </MapsProvider>
        </ChakraProvider>
      </AuthProvider>
    </FirebaseProvider>
  </ErrorBoundary>
);

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProviders;
