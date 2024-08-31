import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import LeftPanel from './components/LeftPanel.jsx';
import MapView from './components/MapView.jsx';
import RightPanel from './components/RightPanel.jsx';
import Footer from './components/Footer.jsx';
import './App.css';
import { FirebaseProvider } from './context/FirebaseContext.jsx';
import { ChakraProvider } from '@chakra-ui/react'
const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [appMode, setAppMode] = useState('driver');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showProfile, setShowProfile] = useState(false); // New state to handle profile display

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleProfileClick = () => {
    setShowProfile(true);
    setIsRightPanelOpen(true);
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setShowProfile(false); // Ensure profile is not shown when an item is selected
    setIsRightPanelOpen(true);
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
      <FirebaseProvider>
      <ChakraProvider>
        <Header 
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          appMode={appMode}
          setAppMode={setAppMode}
          setIsLeftPanelOpen={setIsLeftPanelOpen}
        />
        <div className="flex flex-1 overflow-hidden">
          <LeftPanel 
            isOpen={isLeftPanelOpen}
            setIsOpen={setIsLeftPanelOpen}
            appMode={appMode}
            onSelectItem={handleSelectItem}
            onProfileClick={handleProfileClick} // Pass the handler to open profile
          />
          <main className="flex-1 flex flex-col relative">
            {appMode === 'driver' ? (
              <RightPanel 
                isOpen={isRightPanelOpen}
                setIsOpen={setIsRightPanelOpen}
                selectedItem={selectedItem}
                appMode={appMode}
                showProfile={showProfile} // Pass the profile display state
              />
            ) : (
              <>
                <MapView
                  appMode={appMode}
                  isLeftPanelOpen={isLeftPanelOpen}
                  isRightPanelOpen={isRightPanelOpen}
                  setIsLeftPanelOpen={setIsLeftPanelOpen}
                  // Optional: Add more props if needed
                />
                <RightPanel 
                  isOpen={isRightPanelOpen}
                  setIsOpen={setIsRightPanelOpen}
                  selectedItem={selectedItem}
                  appMode={appMode}
                />
              </>
            )}
          </main>
        </div>
        <Footer />
        </ChakraProvider>

      </FirebaseProvider>
    </div>
  );
};

export default App;
