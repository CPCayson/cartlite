import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Spinner, Input, FormControl, FormLabel, Select, Box, Text } from '@chakra-ui/react';
import useAuthorization from '../hooks/useAuthorization';
import TabbedSettingsForm from './Forms/TabbedSettingsForm';

const RightPanel = ({ isOpen, setIsOpen, selectedItem, appMode, adjustHeightForBlueMoon, userData, cartData }) => {
  const {
    user,
    authLoading,
    formError,
    email,
    password,
    phoneNumber,
    isOnboarding,
    authMethod,
    handleToggleForm,
    handleAuthAction,
    handleLogout,
    setEmail,
    setPassword,
    setPhoneNumber,
    setAuthMethod,
    redirecting,
    redirectToStripeOnboarding,
  } = useAuthorization();

  const [loading, setLoading] = useState(false);

  // Ensure props are available
  if (!userData || !cartData) {
    return null; // or provide a fallback UI
  }

  if (authLoading || redirecting || loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      style={{
        width: isOpen ? '50%' : '0',
        height: adjustHeightForBlueMoon ? '70%' : '100%',
        transition: 'all 0.3s ease-in-out',
        overflow: 'hidden',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      {isOpen && (
        <div className="p-4">
          <h2 className="text-xl font-bold">{selectedItem ? selectedItem.name : 'Details'}</h2>
          {selectedItem && <p>{selectedItem.description}</p>}

          {/* Conditional rendering based on appMode */}
          {appMode === 'host' ? (
            <>
              <TabbedSettingsForm
                userData={userData}
                cartData={cartData}
                onSaveUserData={() => {/* Implement handleSaveUserData */}}
                onSaveCartData={() => {/* Implement handleSaveCartData */}}
              />
              <Button colorScheme="red" onClick={handleLogout} mt={4}>
                Logout
              </Button>
            </>
          ) : (
            <>
              {/* Onboarding and Authentication Form */}
              <Box>
                <FormControl id="auth-method">
                  <FormLabel>Authentication Method</FormLabel>
                  <Select value={authMethod} onChange={(e) => setAuthMethod(e.target.value)}>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </Select>
                </FormControl>

                {authMethod === 'email' && (
                  <>
                    <FormControl id="email" mt={4}>
                      <FormLabel>Email</FormLabel>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </FormControl>
                    <FormControl id="password" mt={4}>
                      <FormLabel>Password</FormLabel>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </FormControl>
                  </>
                )}

                {authMethod === 'phone' && (
                  <>
                    <FormControl id="phone-number" mt={4}>
                      <FormLabel>Phone Number</FormLabel>
                      <Input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                    </FormControl>
                    <div id="recaptcha-container"></div>
                  </>
                )}

                {formError && <Text color="red.500">{formError}</Text>}

                <Button mt={4} colorScheme="blue" onClick={handleAuthAction}>
                  {isOnboarding ? 'Register' : 'Login'}
                </Button>

                <Button variant="link" mt={2} onClick={handleToggleForm}>
                  {isOnboarding ? 'Already have an account? Login' : 'New user? Register here'}
                </Button>

                {/* Onboarding Button */}
                {user && (
                  <Button mt={4} colorScheme="teal" onClick={() => redirectToStripeOnboarding(user)}>
                    Start Stripe Onboarding
                  </Button>
                )}
              </Box>
            </>
          )}

          <Button onClick={() => setIsOpen(false)} mt={4}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

RightPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  selectedItem: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
  }),
  appMode: PropTypes.oneOf(['rabbit', 'host']).isRequired,
  adjustHeightForBlueMoon: PropTypes.bool,
  userData: PropTypes.object.isRequired,
  cartData: PropTypes.object.isRequired,
};

export default RightPanel;
