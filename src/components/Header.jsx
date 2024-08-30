import React from 'react';
import { Menu, Sun, Moon, Users } from 'lucide-react';
import Button from './Button';

const Header = ({ title, viewMode, setViewMode, darkMode, setDarkMode }) => {
  return (
    <header className="bg-blue-600 dark:bg-blue-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <Menu className="mr-2" />
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center">
        <Button 
          onClick={() => setViewMode(viewMode === 'host' ? 'rider' : 'host')}
          className="flex items-center bg-blue-700 hover:bg-blue-800 text-white mr-2"
        >
          <Users size={16} className="mr-1" />
          Switch to {viewMode === 'host' ? 'Rider' : 'Host'}
        </Button>
        <Button onClick={() => setDarkMode(!darkMode)} className="text-white">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
      </div>
    </header>
  );
};

export default Header;