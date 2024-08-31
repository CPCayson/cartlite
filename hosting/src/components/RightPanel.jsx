import { ArrowLeft } from 'lucide-react';
import PropTypes from 'prop-types';
import { useStripe } from '../context/StripeContext'; // Correct path

const RightPanel = ({ isOpen, setIsOpen, selectedItem, appMode }) => {
  const { stripeAccountId } = useStripe(); // Correctly use the hook

  const handleBookRide = async () => {
    // Check if the user is connected to Stripe
    if (!stripeAccountId) {
      alert('Please connect your Stripe account to book a ride.');
      // Redirect to Stripe Connect onboarding or settings
      return;
    }

    // Proceed with booking logic
    try {
      // Example booking logic
      const response = await fetch('/api/bookRide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Provide necessary booking details here
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to book ride');
      }

      const result = await response.json();
      console.log('Booking successful:', result);
      // Handle successful booking

    } catch (error) {
      console.error('Error booking ride:', error);
      // Handle error, display a message to the user
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${isOpen ? 'w-1/2' : 'w-0'} overflow-hidden`}>
      {selectedItem && (
        <div className="p-4">
          <button onClick={() => setIsOpen(false)} className="mb-4 flex items-center text-blue-500">
            <ArrowLeft className="mr-2" /> Back to List
          </button>
          <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{selectedItem.name}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">{selectedItem.type}</p>
          {appMode === 'host' && <p className="text-blue-500 mb-2">ETA: {selectedItem.eta}</p>}
          <div className="flex mb-4">
            {Array(5).fill(0).map((_, i) => (
              <svg key={i} className={`w-4 h-4 ${i < selectedItem.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          {appMode === 'host' && (
            <button 
              onClick={handleBookRide} 
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Book Ride
            </button>
          )}
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
    type: PropTypes.string,
    eta: PropTypes.string,
    rating: PropTypes.number,
  }),
  appMode: PropTypes.oneOf(['rabbit', 'host']).isRequired,
};

export default RightPanel;
