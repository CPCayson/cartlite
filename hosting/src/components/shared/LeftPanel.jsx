// src/components/shared/LeftPanel.jsx

import React, { useContext } from 'react';
import { ChevronLeft, ChevronRight, Grid, List, Settings } from 'lucide-react';
import ContentView from '@components/shared/ContentView';
import RightPanel from '@components/shared/RightPanel';
import AppContext from '@context/AppContext';

const LeftPanel = () => {
  const {
    isPanelExpanded,
    togglePanelExpansion,
    viewType,
    toggleViewType,
    activeSort,
    setActiveSort,
    isHost,
    toggleHostMode,
    toggleRightPanel,
  } = useContext(AppContext);

  const sortButtons = ['All', 'Food', 'Entertainment', 'Store'];

  const items = [
    { id: 1, name: "Gourmet Burger", category: "Food", description: "Juicy beef patty with artisanal toppings", price: "$12.99", imageUrl: "https://via.placeholder.com/300x200" },
    { id: 2, name: "VR Experience", category: "Entertainment", description: "Immersive virtual reality adventure", price: "$25.00", imageUrl: "https://via.placeholder.com/300x200" },
    { id: 3, name: "Organic Market", category: "Store", description: "Fresh, locally-sourced produce and goods", price: "Varies", imageUrl: "https://via.placeholder.com/300x200" },
    { id: 4, name: "Sushi Platter", category: "Food", description: "Assorted sushi rolls and sashimi", price: "$22.99", imageUrl: "https://via.placeholder.com/300x200" },
    { id: 5, name: "Live Concert", category: "Entertainment", description: "Energetic performance by local bands", price: "$15.00", imageUrl: "https://via.placeholder.com/300x200" },
    { id: 6, name: "Eco-friendly Shop", category: "Store", description: "Sustainable products for conscious consumers", price: "Varies", imageUrl: "https://via.placeholder.com/300x200" },
  ];

  return (
    <aside
      className={`bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 transition-all duration-300 ease-in-out shadow-xl flex flex-col
        ${isPanelExpanded ? 'w-64 sm:w-72' : 'w-16 sm:w-24'}
        min-w-${isPanelExpanded ? '64 sm:w-72' : '16 sm:w-24'} // Ensure minimal width when expanded
      `}
      aria-label="Sidebar Navigation"
    >
      {/* Panel Header */}
      <header className="p-4 flex justify-between items-center">
        {isPanelExpanded && <h2 className="text-2xl font-bold text-white">Explorer</h2>}
        <div className="flex space-x-2">
          <button
            onClick={togglePanelExpansion}
            className="p-2 rounded-full bg-white bg-opacity-20 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={isPanelExpanded ? 'Collapse Panel' : 'Expand Panel'}
          >
            {isPanelExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
          <button
            onClick={toggleRightPanel}
            className="p-2 rounded-full bg-white bg-opacity-20 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Toggle Right Panel"
          >
            <Settings size={24} />
          </button>
        </div>
      </header>

      {/* Sorting Buttons */}
      <nav className={`p-4 ${isPanelExpanded ? 'flex flex-wrap gap-2' : 'flex flex-col space-y-2'}`} aria-label="Sort Categories">
        {sortButtons.map((button) => (
          <button
            key={button}
            onClick={() => setActiveSort(button.toLowerCase())}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              activeSort === button.toLowerCase()
                ? 'bg-white text-purple-700'
                : 'bg-white bg-opacity-20 text-white'
            } ${!isPanelExpanded ? 'w-full' : ''} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            aria-pressed={activeSort === button.toLowerCase()}
          >
            {isPanelExpanded ? button : button.charAt(0)}
          </button>
        ))}
      </nav>

      {/* View Toggle */}
      {isPanelExpanded && (
        <div className="p-4">
          <button 
            onClick={toggleViewType} 
            className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label={`Switch to ${viewType === 'list' ? 'Grid' : 'List'} View`}
          >
            {viewType === 'list' ? <Grid size={20} /> : <List size={20} />}
            <span>{viewType === 'list' ? 'Grid View' : 'List View'}</span>
          </button>
        </div>
      )}

      {/* Host Toggle */}
      {isPanelExpanded && (
        <div className="p-4">
          <button
            onClick={toggleHostMode}
            className="w-full bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label={isHost ? 'Switch to User Mode' : 'Switch to Host Mode'}
          >
            {isHost ? 'Switch to User' : 'Switch to Host'}
          </button>
        </div>
      )}

      {/* ContentView in Left Panel */}
      {isPanelExpanded && (
        <div className="p-4 flex-grow overflow-auto">
          <ContentView />
        </div>
      )}
    </aside>
  );
};

export default LeftPanel;
