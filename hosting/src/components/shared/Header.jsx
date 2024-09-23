// src/components/shared/Header.jsx
import React, { useContext } from 'react';
import { useAppState } from '@context/AppStateContext';
import ThemeContext from '@context/ThemeContext';
import { Moon, Sun, LogIn } from 'lucide-react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure } from '@chakra-ui/react';
import SignupForm from '@components/shared/SignupForm';
import SearchBar from '@components/shared/SearchBar';
import { useMode } from '@context/ModeContext';

const Header = ({ onDestinationSelect, onPickupSelect, onBookRide, initialLatLng, autoPopulateDestination }) => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const { isGuestMode, toggleMode } = useMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const headerClass = isGuestMode
    ? 'bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600'
    : 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600';

  return (
    <>
      <header className={`flex flex-col p-2 sm:p-4 ${headerClass} shadow-md`}>
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-white">cartRabbit</h1>
          <div className="flex items-center mt-2 sm:mt-0">
            <button onClick={toggleDarkMode} className="mr-2 sm:mr-4 text-white">
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button onClick={onOpen} className="ml-2 sm:ml-4 text-white">
              <LogIn size={24} />
            </button>
          </div>
        </div>
        <div className="mt-2 sm:mt-4">
          <SearchBar
            onDestinationSelect={onDestinationSelect}
            onPickupSelect={onPickupSelect}
            onBookRide={onBookRide}
            initialLatLng={initialLatLng}
            autoPopulateDestination={autoPopulateDestination}
          />
        </div>
      </header>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isGuestMode ? 'Log In' : 'Sign Up'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SignupForm onClose={onClose} isSignup={!isGuestMode} handleToggle={toggleMode} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Header;