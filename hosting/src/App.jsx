// src/App.jsx

import { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import LeftPanel from './components/LeftPanel.jsx';
import RightPanel from './components/RightPanel.jsx';
import Footer from './components/Footer.jsx';
import { FirebaseProvider } from './context/FirebaseContext.jsx';
import { ChakraProvider } from '@chakra-ui/react';
import './App.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ErrorBoundary } from './context/ErrorBoundary.jsx';
import { MapsProvider } from './context/MapsContext.jsx';
import MapView from './components/MapView';
import { StripeProvider } from './context/StripeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [appMode, setAppMode] = useState('rabbit'); // Default to 'rabbit'
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeView, setActiveView] = useState('rabbit');
  const [activeCategory, setActiveCategory] = useState('all food');
  const [viewType, setViewType] = useState('list');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setIsRightPanelOpen(true);
  };

  const handleSettingsClick = () => {
    setIsRightPanelOpen(!isRightPanelOpen);
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
      <ErrorBoundary>
        <FirebaseProvider>
          <ChakraProvider>
            <MapsProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <AuthProvider>
                <StripeProvider>
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
                      activeView={activeView}
                      setActiveView={setActiveView}
                      activeCategory={activeCategory}
                      setActiveCategory={setActiveCategory}
                      viewType={viewType}
                      setViewType={setViewType}
                      handleSelectItem={handleSelectItem}
                      appMode={appMode}
                      onSettingsClick={handleSettingsClick}
                    />
                    <main className={`flex-1 flex flex-col relative transition-all duration-300 ${isLeftPanelOpen && isRightPanelOpen ? 'hidden' : ''}`}>
                      {!isRightPanelOpen && (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <MapView isLeftPanelOpen={isLeftPanelOpen} isRightPanelOpen={isRightPanelOpen} setIsLeftPanelOpen={setIsLeftPanelOpen} />
                        </div>
                      )}
                      <button
                        onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
                        className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-r-full p-2 shadow-md"
                      >
                        {isLeftPanelOpen ? <ChevronLeft className="text-gray-600 dark:text-gray-300" /> : <ChevronRight className="text-gray-600 dark:text-gray-300" />}
                      </button>
                    </main>
                    <RightPanel 
                      isOpen={isRightPanelOpen}
                      setIsOpen={setIsRightPanelOpen}
                      selectedItem={selectedItem}
                      appMode={appMode}
                    />
                  </div>
                  <Footer />
                </StripeProvider>
              </AuthProvider>
            </MapsProvider>
          </ChakraProvider>
        </FirebaseProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
