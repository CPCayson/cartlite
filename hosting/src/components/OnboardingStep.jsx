import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const OnboardingStep = ({ content, onNext, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm">
      <p className="text-gray-800 dark:text-gray-200 mb-4">{content}</p>
      <div className="flex justify-between">
        <Button onClick={onNext} className="bg-blue-500 text-white">
          Next
        </Button>
        <Button onClick={onClose} className="text-gray-600 dark:text-gray-400">
          Skip
        </Button>
      </div>
    </div>
  </div>
);


OnboardingStep.propTypes = {
  content: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export { OnboardingStep };

OnboardingStep.propTypes = {
  content: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};


const Onboarding = ({ isActive, onComplete }) => {
  const [step, setStep] = React.useState(0);

  const steps = [
    { content: 'Welcome to RideShare! Let\'s walk you through the main features.' },
    { content: 'On the left panel, you can view incoming ride requests or available rides, depending on your mode.' },
    { content: 'The main area shows your dashboard with important stats and recent activity.' },
    { content: 'You can switch between Host and driver modes using the button in the top right.' },
    { content: 'That\'s it! You\'re ready to start using RideShare. Enjoy your experience!' },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  if (!isActive) return null;

  return (
    <OnboardingStep
      content={steps[step].content}
      onNext={handleNext}
      onClose={onComplete}
    />
  );
};

Onboarding.propTypes = {
  isActive: PropTypes.bool.isRequired,
  onComplete: PropTypes.func.isRequired,
};

export default Onboarding;