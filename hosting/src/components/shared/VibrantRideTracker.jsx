// src/components/shared/VibrantRideTracker.jsx
import React, { useState } from 'react';
import { Car, Clock, Phone, Send, ChevronLeft, ChevronRight, User, Star, Shield } from 'lucide-react';

const VibrantRideTracker = () => {
  const [chatMessages, setChatMessages] = useState([
    { sender: 'SYSTEM', message: 'Your ride is on the way!' },
    { sender: 'DRIVER', message: "I'll be there in 5 minutes." },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isDriverInfoExpanded, setIsDriverInfoExpanded] = useState(false);
  const [isETAExpanded, setIsETAExpanded] = useState(false);
  const [pickupTime, setPickupTime] = useState('NOW');
  const [bookingStep, setBookingStep] = useState(0);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      setChatMessages([...chatMessages, { sender: 'YOU', message: inputMessage }]);
      setInputMessage('');
    }
  };

  const handleBookNow = () => {
    setIsETAExpanded(false);
    setIsChatVisible(true);
    setBookingStep(3); // Assuming 3 is the final step
  };

  const mainGradient = 'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700';
  const userGradient = 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600';
  const systemGradient = 'bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600';

  const ChatPanel = () => (
    <div className={`w-full flex flex-col mb-4 rounded-lg p-4 ${mainGradient} shadow-lg`}>
      <div className="flex-grow overflow-y-auto mb-4 max-h-64">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`mb-2 p-2 rounded-lg ${msg.sender === 'YOU' ? userGradient : systemGradient}`}>
            <span className="font-bold">{msg.sender}: </span>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-grow bg-purple-800 text-white px-3 py-2 rounded-l-full focus:outline-none"
          placeholder="Type a message..."
          aria-label="Type a message"
        />
        <button
          onClick={sendMessage}
          className={`${userGradient} text-white px-4 py-2 rounded-r-full hover:opacity-90 transition-opacity duration-300`}
          aria-label="Send Message"
        >
          <Send size={20} />
        </button>
      </div>
      <div className="flex justify-between mt-4">
        <button className={`${systemGradient} text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity duration-300 text-sm`}>
          CANCEL RIDE
        </button>
        <button className={`${systemGradient} text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity duration-300 flex items-center space-x-1 text-sm`}>
          <Phone size={16} />
          <span>CONTACT</span>
        </button>
      </div>
    </div>
  );

  const ProgressStepper = () => (
    <div className="flex justify-between items-center mb-4">
      {['PICKUP', 'DESTINATION', 'SCHEDULE', 'CONFIRM'].map((step, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= bookingStep ? userGradient : 'bg-purple-800'} mb-2`}>
            {index + 1}
          </div>
          <span className="text-xs">{step}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`w-full h-full mx-auto font-['Poppins'] font-bold text-white p-4 rounded-lg flex flex-col ${mainGradient} shadow-xl`}>
      {isChatVisible && <ChatPanel />}

      <div className="flex-grow relative bg-purple-900 rounded-lg overflow-hidden">
        {/* Placeholder for Map */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <span className="text-purple-300 text-2xl">MAP VIEW</span>
        </div>
        {/* Animated Ping Indicator */}
        <div className="absolute bottom-4 right-4 w-4 h-4 bg-orange-500 rounded-full animate-ping"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 bg-orange-500 rounded-full"></div>

        {/* ETA and Booking Section */}
        <div className="absolute top-4 left-4 right-4 bg-purple-800 bg-opacity-90 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock size={20} className="text-teal-400" />
              <span className="text-lg">ETA: 7 MIN</span>
            </div>
            <button
              onClick={() => setIsETAExpanded(!isETAExpanded)}
              className={`${systemGradient} text-white px-4 py-2 rounded-full text-sm hover:opacity-90 transition-opacity duration-300`}
              aria-label={isETAExpanded ? 'Hide ETA' : 'Show ETA'}
            >
              {isETAExpanded ? 'HIDE' : 'BOOK'}
            </button>
          </div>
          {isETAExpanded && (
            <div className="mt-4 space-y-4">
              <ProgressStepper />
              <input
                type="text"
                placeholder="PICKUP LOCATION"
                className="w-full bg-purple-700 text-white px-4 py-3 rounded-full focus:outline-none text-sm"
                aria-label="Pickup Location"
              />
              <input
                type="text"
                placeholder="DESTINATION"
                className="w-full bg-purple-700 text-white px-4 py-3 rounded-full focus:outline-none text-sm"
                aria-label="Destination"
              />
              <div className="flex space-x-2">
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="flex-grow bg-purple-700 text-white px-4 py-3 rounded-full focus:outline-none text-sm"
                  aria-label="Pickup Time"
                >
                  <option value="NOW">NOW</option>
                  {[...Array(5)].map((_, i) => (
                    <option key={i} value={`${i + 1} HOUR${i > 0 ? 'S' : ''}`}>
                      {`${i + 1} HOUR${i > 0 ? 'S' : ''}`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBookNow}
                  className={`${userGradient} text-white px-4 py-3 rounded-full hover:opacity-90 transition-opacity duration-300 text-sm`}
                  aria-label="Book Now"
                >
                  BOOK NOW
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Driver Information Section */}
        {bookingStep === 3 && (
          <div className={`absolute bottom-4 left-4 right-4 bg-purple-800 bg-opacity-90 rounded-lg p-4 transition-all duration-300 ${isDriverInfoExpanded ? 'h-64' : 'h-24'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold text-teal-400">DRIVER: JOHN D.</span>
              <button
                onClick={() => setIsDriverInfoExpanded(!isDriverInfoExpanded)}
                className={`${systemGradient} text-white px-4 py-2 rounded-full text-sm hover:opacity-90 transition-opacity duration-300`}
                aria-label={isDriverInfoExpanded ? 'Show Less Info' : 'Show More Info'}
              >
                {isDriverInfoExpanded ? 'LESS INFO' : 'MORE INFO'}
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Car size={20} className="text-orange-400" />
              <span className="text-lg">NEON CRUISER - XC4 2084</span>
            </div>
            {isDriverInfoExpanded && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <User size={20} className="text-teal-400" />
                  <span className="text-lg">5 YEARS EXPERIENCE</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star size={20} className="text-orange-400" />
                  <span className="text-lg">4.9 RATING (500+ RIDES)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield size={20} className="text-teal-400" />
                  <span className="text-lg">BACKGROUND CHECK VERIFIED</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Toggle Chat Visibility */}
        <button
          onClick={() => setIsChatVisible(!isChatVisible)}
          className={`absolute top-1/2 -left-4 transform -translate-y-1/2 ${userGradient} text-white p-3 rounded-full hover:opacity-90 transition-opacity duration-300 md:flex hidden`}
          aria-label={isChatVisible ? 'Close Chat' : 'Open Chat'}
        >
          {isChatVisible ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>
      </div>
    </div>
  );
};

export default VibrantRideTracker;
