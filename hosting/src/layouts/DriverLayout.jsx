import React, { useState, useEffect } from 'react';
import { Menu, ChevronLeft, ChevronRight, Settings, Moon, Sun, X } from 'lucide-react';

const DriverApp = () => {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState(null);
  const [showGuestContainer, setShowGuestContainer] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const incomingAccepts = [
    { id: 1, name: "John Doe", time: "5 mins" },
    { id: 2, name: "Jane Smith", time: "2 mins" },
    { id: 3, name: "Bob Johnson", time: "1 min" },
  ];

  const toggleSettingsPanel = () => {
    setIsSettingsPanelOpen(!isSettingsPanelOpen);
  };

  const handleAccept = (accept) => {
    setActiveView(accept);
    setShowGuestContainer(true);
  };

  const sendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { text: chatInput, sender: 'driver' }]);
      setChatInput('');
    }
  };

  const cancelAction = () => {
    setShowGuestContainer(false);
    setActiveView(null);
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''} bg-white dark:bg-gray-900`}>


      <div className="flex-1 flex overflow-hidden">
        <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${isLeftPanelOpen ? 'w-64' : 'w-0'}`}>
          <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Incoming Requests</h2>
              <button
                onClick={toggleSettingsPanel}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                <Settings size={20} />
              </button>
            </div>
            <div className="flex-grow overflow-auto">
              {incomingAccepts.map((accept) => (
                <div key={accept.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3">
                  <p className="font-semibold text-gray-800 dark:text-white">{accept.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{accept.time} ago</p>
                  <button 
                    className="mt-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                    onClick={() => handleAccept(accept)}
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          {isSettingsPanelOpen ? (
            <div className="absolute inset-0 bg-white dark:bg-gray-800 p-4 overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h2>
                <button 
                  onClick={toggleSettingsPanel}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-300">Settings content goes here</p>
            </div>
          ) : (
            <main className="container mx-auto px-4 py-8 overflow-auto h-full">
              {showGuestContainer && (
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Guest Pickup & Dropoff</h3>
                  <p className="text-gray-600 dark:text-gray-300">Pickup Location: <input type="text" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white" /></p>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">Dropoff Location: <input type="text" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white" /></p>
                  <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-white">Chat with Guest</h3>
                  <div className="bg-gray-100 dark:bg-gray-600 p-2 h-32 overflow-y-scroll mb-2 rounded">
                    {chatMessages.map((msg, index) => (
                      <p key={index} className={`${msg.sender === 'driver' ? 'text-right' : 'text-left'} mb-1`}>{msg.text}</p>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white" 
                    placeholder="Type a message..." 
                  />
                  <button className="bg-green-500 text-white py-2 px-4 rounded mt-2 mr-2" onClick={sendMessage}>Send</button>
                  <button className="bg-red-500 text-white py-2 px-4 rounded mt-2" onClick={cancelAction}>Cancel</button>
                </div>
              )}
              <section id="dashboard" className="content-section active">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Dashboard Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md aspect-square">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Total Earnings</h3>
                    <p className="text-3xl font-bold text-green-600">$<span id="totalEarnings">1,234</span></p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md aspect-square">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Active Rides</h3>
                    <p className="text-3xl font-bold text-blue-600"><span id="activeRides">3</span></p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md aspect-square">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Recent Transactions</h3>
                    <ul id="transactionsList" className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>$25 - John D.</li>
                      <li>$18 - Sarah M.</li>
                      <li>$30 - Alex W.</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md aspect-square">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Upcoming Bookings</h3>
                    <ul id="bookingsList" className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>2:30 PM - Airport Pickup</li>
                      <li>5:00 PM - Downtown Dropoff</li>
                      <li>7:15 PM - Evening Ride</li>
                    </ul>
                  </div>
                </div>
              </section>
            </main>
          )}

          <button
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-r-full p-2 shadow-md"
          >
            {isLeftPanelOpen ? <ChevronLeft className="text-gray-600 dark:text-gray-300" /> : <ChevronRight className="text-gray-600 dark:text-gray-300" />}
          </button>
        </div>
      </div>

    </div>
  );
};

export default DriverApp;