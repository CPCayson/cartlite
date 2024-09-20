// src/AppProviders.jsx
import { ErrorBoundary } from './ErrorBoundary';
import { FirebaseAppProvider } from 'reactfire';
import { AuthProvider } from './AuthContext';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { MapsProvider } from './MapsContext';
import PropTypes from 'prop-types';
import { firebaseConfig } from '@hooks/firebase/firebaseConfig';
import { GeolocationProvider } from './GeolocationContext';
import {ThemeProvider} from '@context/ThemeContext';
import { ModalProvider } from '@context/ModalContext';
import { AppProvider } from '@context/AppContext';
import { BusinessProvider } from './BusinessContext';
import { RideProvider } from './RideContext';
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
        <BusinessProvider>

   < GeolocationProvider>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <AuthProvider>
        
        <RideProvider>
        <ThemeProvider>
          <ModalProvider>
<AppProvider>
        
        <ChakraProvider theme={customTheme}>
          <MapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            {/* Add ThemeContext.Provider here if needed */}
            {children}
          </MapsProvider>
        </ChakraProvider>
        </AppProvider>

</ModalProvider>

</ThemeProvider>
</RideProvider>
      </AuthProvider>
    </FirebaseAppProvider>
    </GeolocationProvider>
    </BusinessProvider>

  </ErrorBoundary>
);
AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProviders;
