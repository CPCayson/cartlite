import React from 'react';
import { ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';
import ContentView from '@components/shared/ContentView'; // Adjust the import path
import { useAppState } from '@context/AppStateContext'; // Adjust the import path

const LeftPanel = () => {
  const { isPanelExpanded, togglePanelExpansion, viewType, toggleViewType, activeSort, setActiveSort } = useAppState();
  const sortButtons = ['All', 'Food', 'Entertainment', 'Store'];

  return (
    <aside
      className={`relative bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 transition-all duration-300 ease-in-out shadow-xl flex flex-col
        ${isPanelExpanded ? 'w-64 sm:w-72' : 'w-16 sm:w-24'}
        min-w-${isPanelExpanded ? '64 sm:w-72' : '16 sm:w-24'}`}
      aria-label="Sidebar Navigation"
    >
      {/* Panel Header */}
      <div className="p-4 flex justify-between items-center">
        {isPanelExpanded && <h2 className="text-2xl font-bold text-white">Explorer</h2>}
        <div className="flex space-x-2">
          <button
            onClick={togglePanelExpansion}
            className="p-2 rounded-full bg-white bg-opacity-20 text-white shadow-md"
            aria-label={isPanelExpanded ? 'Collapse Panel' : 'Expand Panel'}
          >
            {isPanelExpanded ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        </div>
      </div>

      {/* Sorting Buttons */}
      <div className={`p-4 ${isPanelExpanded ? 'flex flex-wrap gap-2' : 'flex flex-col space-y-2'}`} aria-label="Sort Categories">
        {sortButtons.map((button) => (
          <button
            key={button}
            onClick={() => setActiveSort(button.toLowerCase())}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              activeSort === button.toLowerCase() ? 'bg-white text-purple-700' : 'bg-white bg-opacity-20 text-white'
            } ${!isPanelExpanded ? 'w-full' : ''}`}
            aria-pressed={activeSort === button.toLowerCase()}
          >
            {isPanelExpanded ? button : button.charAt(0)}
          </button>
        ))}
      </div>

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

      {/* ContentView in Left Panel */}
      {isPanelExpanded && (
        <div className="p-4 flex-grow overflow-auto">
          <ContentView viewType={viewType} activeSort={activeSort} setActiveSort={setActiveSort} />
        </div>
      )}
    </aside>
  );
};

export default LeftPanel;