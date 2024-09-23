import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SimplifiedApp from './SimplifiedApp';
import StripeDashboard from './StripeDashboard';
import UserProfileForm from '@components/shared/UserProfileForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import '@fontsource/poppins/400.css'; // Regular
import '@fontsource/poppins/700.css'; // Bold
import './index.css'; // Ensure this is after font imports
import CartProfileForm from '@components/shared/CartProfileForm'
import BusinessRegistrationForm from '@components/shared/BusinessOnboardingForm';
import  AppProviders  from '@context/AppProviders'; // Import the context

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const App = () => {
  return (
    <AppProviders>
      <Router>
        <Elements stripe={stripePromise}>
          <Routes>
            <Route path="/" element={<SimplifiedApp />} />
             <Route path="/Host" element={<StripeDashboard />} />
            <Route path="/CartProfile" element={<CartProfileForm />} />
            <Route path="/UserProfile" element={<UserProfileForm />} />
            <Route path="/BusinessRegistration" element={<BusinessRegistrationForm />} />

          </Routes>
        </Elements>
      </Router>
    </AppProviders>
  );
};

export default App;

