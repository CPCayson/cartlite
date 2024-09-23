import React from 'react';
import { RideProvider } from '@context/RideContext';
import { BusinessProvider } from '@context/BusinessContext'; 

const TestComponent = () => {
  // Try to access context values here
  return <div>Test Component</div>;
};

const TestContext = () => (
  <RideProvider>
    <BusinessProvider>
      <TestComponent />
    </BusinessProvider>
  </RideProvider>
);

export default TestContext;
