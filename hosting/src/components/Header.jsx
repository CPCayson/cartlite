// src/components/Header.jsx
import React from 'react';
import { Menu, Users, Sun, Moon } from 'lucide-react';

// Function to handle onboarding
const handleOnboarding = () => {
  alert('Onboarding steps activated!');
};

const Header = ({ darkMode, setDarkMode, appMode, setAppMode, setIsLeftPanelOpen }) => (
  <header className="bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 text-white py-6 px-8 flex justify-between items-center">
    {/* Left side: Menu button and Title */}
    <div className="flex items-center">
      <button onClick={() => setIsLeftPanelOpen(prev => !prev)} className="mr-4">
        <Menu />
      </button>
      <h1 className="text-2xl font-bold">cartRABBIT</h1>
    </div>

   

    {/* Right side: Navigation and Buttons */}
    <nav className="flex items-center">
      <button 
        onClick={() => setAppMode(appMode === 'rider' ? 'driver' : 'rider')} 
        className="px-3 py-2 text-sm mr-4 flex items-center bg-blue-700 dark:bg-blue-600 rounded"
      >
        <Users className="mr-1" />
        {appMode === 'rider' ? 'Switch to driver' : 'Switch to rider'}
      </button>
      <button 
        onClick={() => setDarkMode(!darkMode)} 
        className="p-3 bg-blue-700 dark:bg-blue-600 rounded mr-4"
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
      {/* Onboarding Button */}
      <button 
        onClick={handleOnboarding} 
        className="px-4 py-2 text-sm bg-blue-700 dark:bg-blue-600 rounded"
      >
        Start Onboarding
      </button>
    </nav>
  </header>
);

export default Header;
