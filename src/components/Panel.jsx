import React from 'react';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Panel = ({ isOpen, onToggle, title, onSettingsClick, children }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'}`}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h2>
          <Button
            onClick={onSettingsClick}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          >
            <Settings size={20} />
          </Button>
        </div>
        <div className="flex-grow overflow-auto">
          {children}
        </div>
      </div>
      <Button
        onClick={onToggle}
        className="absolute top-1/2 left-64 transform -translate-y-1/2 bg-white dark:bg-gray-700 rounded-r-full p-2 shadow-md"
      >
        {isOpen ? <ChevronLeft className="text-gray-600 dark:text-gray-300" /> : <ChevronRight className="text-gray-600 dark:text-gray-300" />}
      </Button>
    </div>
  );
};

export default Panel;