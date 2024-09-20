import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import { UIProvider } from '@context/UIContext';
import { BusinessProvider } from '@context/BusinessContext';
import { RideProvider } from '@context/RideContext';
import { GeolocationProvider } from '@context/GeolocationContext';
import SimplifiedApp from './SimplifiedApp';
import StripeDashboard from './StripeDashboard';
import RiderLayout from './RiderLayout';
import CartProfileForm from '@components/FORMS/CartProfileForm';
import UserProfileForm from '@components/FORMS/UserProfileForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import '@fontsource/poppins/400.css'; // Regular
import '@fontsource/poppins/700.css'; // Bold
import './index.css'; // Ensure this is after font imports

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const App = () => {
  return (
    <AuthProvider>
      <UIProvider>
        <BusinessProvider>
          <GeolocationProvider>
            <RideProvider>
              <Router>
                <Elements stripe={stripePromise}>
                  <Routes>
                    <Route path="/" element={<SimplifiedApp />} />
                    <Route path="/stripe" element={<StripeDashboard />} />
                    <Route path="/guest" element={<RiderLayout />} />
                    <Route path="/u" element={<CartProfileForm />} />
                    <Route path="/c" element={<UserProfileForm />} />
                  </Routes>
                </Elements>
              </Router>
            </RideProvider>
          </GeolocationProvider>
        </BusinessProvider>
      </UIProvider>
    </AuthProvider>
  );
};

export default App;
