import { ErrorBoundary } from './ErrorBoundary';
import { FirebaseAppProvider } from 'reactfire';
import { AuthProvider } from './AuthContext';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { MapsProvider } from './MapsContext';
import PropTypes from 'prop-types';
import { firebaseConfig } from '../hooks/firebase/firebaseConfig'; // Import the Firebase config

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
    {/* Pass firebaseConfig to FirebaseAppProvider */}
    <FirebaseAppProvider firebaseConfig={firebaseConfig}> 
      <AuthProvider>
        <ChakraProvider theme={customTheme}>
          <MapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            {children}
          </MapsProvider>
        </ChakraProvider>
      </AuthProvider>
    </FirebaseAppProvider>
  </ErrorBoundary>
);

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProviders;
