// src/AppProviders.jsx

import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import { BusinessProvider } from '@context/BusinessContext';
import { GeolocationProvider } from '@context/GeolocationContext';
import { MapsProvider } from '@context/MapsContext';
import { ModalProvider } from '@context/ModalContext';
import { ThemeProvider } from '@context/ThemeContext';
import { RideProvider } from '@context/RideContext';
import { AppStateProvider } from '@context/AppStateContext'; // Import AppStateProvider
import {ErrorBoundary} from '@context/ErrorBoundary';
import PropTypes from 'prop-types';
import { firebaseConfig } from '@hooks/firebase/firebaseConfig';
import { FirebaseAppProvider } from 'reactfire';
import { extendTheme } from '@chakra-ui/react';

const customTheme = extendTheme({
  breakpoints: {
    sm: '30em',
    md: '48em',
    lg: '62em',
    xl: '80em',
    '2xl': '96em',
  },
  // Add other custom configurations here
});

const AppProviders = ({ children }) => (
  <ErrorBoundary>
    <GeolocationProvider>
      <AuthProvider>
        <BusinessProvider>
          <FirebaseAppProvider firebaseConfig={firebaseConfig}>
            <RideProvider>
              <ThemeProvider>
                <ModalProvider>
                    <AppStateProvider> {/* Wrap with AppStateProvider */}
                      <ChakraProvider theme={customTheme}>
                        <MapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                          {/* Add ThemeContext.Provider here if needed */}
                          {children}
                        </MapsProvider>
                      </ChakraProvider>
                    </AppStateProvider>
                </ModalProvider>
              </ThemeProvider>
            </RideProvider>
          </FirebaseAppProvider>
        </BusinessProvider>
      </AuthProvider>
    </GeolocationProvider>
  </ErrorBoundary>
);

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProviders;

