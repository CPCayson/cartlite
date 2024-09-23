import React from 'react';
import { ChevronLeft, ChevronRight, Grid, List, Search } from 'lucide-react';
import ContentView from '@components/shared/ContentView'; // Adjust the import path
import { useAppState } from '@context/AppStateContext'; // Adjust the import path

const SearchBar = ({ onSearch }) => (
  <div className="relative">
    <input
      type="text"
      placeholder="Search businesses..."
      className="w-full p-2 pl-10 pr-4 rounded-full bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
    />
    <Search className="absolute left-3 top-2.5 text-white" size={20} />
  </div>
);

const RightPanel = () => {
  const { isRightPanelOpen, toggleRightPanel, viewType, toggleViewType, activeSort, setActiveSort } = useAppState();
  const sortButtons = ['All', 'Food', 'Entertainment', 'Store'];

  return (
    <aside
      className={`relative bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-300 ease-in-out shadow-xl flex flex-col
        ${isRightPanelOpen ? 'w-64 sm:w-72' : 'w-16 sm:w-24'}
        min-w-${isRightPanelOpen ? '64 sm:w-72' : '16 sm:w-24'}`}
      aria-label="Sidebar Navigation"
    >
      {/* Panel Header */}
      <div className="p-4 flex justify-between items-center">
        {isRightPanelOpen && <h2 className="text-2xl font-bold text-white">Details</h2>}
        <div className="flex space-x-2">
          <button
            onClick={toggleRightPanel}
            className="p-2 rounded-full bg-white bg-opacity-20 text-white shadow-md"
            aria-label={isRightPanelOpen ? 'Collapse Panel' : 'Expand Panel'}
          >
            {isRightPanelOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {isRightPanelOpen && (
        <div className="p-4">
          <SearchBar onSearch={() => {}} />
        </div>
      )}

      {/* Sorting Buttons */}
      <div className={`p-4 ${isRightPanelOpen ? 'flex flex-wrap gap-2' : 'flex flex-col space-y-2'}`} aria-label="Sort Categories">
        {sortButtons.map((button) => (
          <button
            key={button}
            onClick={() => setActiveSort(button.toLowerCase())}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              activeSort === button.toLowerCase() ? 'bg-white text-blue-700' : 'bg-white bg-opacity-20 text-white'
            } ${!isRightPanelOpen ? 'w-full' : ''}`}
            aria-pressed={activeSort === button.toLowerCase()}
          >
            {isRightPanelOpen ? button : button.charAt(0)}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      {isRightPanelOpen && (
        <div className="p-4">
          <button
            onClick={toggleViewType}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Switch to ${viewType === 'list' ? 'Grid' : 'List'} View`}
          >
            {viewType === 'list' ? <Grid size={20} /> : <List size={20} />}
            <span>{viewType === 'list' ? 'Grid View' : 'List View'}</span>
          </button>
        </div>
      )}

      {/* ContentView in Right Panel */}
      {isRightPanelOpen && (
        <div className="p-4 flex-grow overflow-auto">
          <ContentView viewType={viewType} activeSort={activeSort} setActiveSort={setActiveSort} />
        </div>
      )}
    </aside>
  );
};

export default RightPanel;