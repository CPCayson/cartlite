// src/SimplifiedApp.jsx

import React, { useContext } from 'react';
import Header from '@components/shared/Header';
import LeftPanel from '@components/shared/LeftPanel';
import ContentView from '@components/shared/ContentView';
import RightPanel from '@components/shared/RightPanel';
import Modal from '@components/shared/Modal';
import ThemeContext from '@context/ThemeContext';
import { AppProvider } from '@context/AppContext';
import SignupFormModal from '@components/shared/SignupFormModal';
import ModalContext from '@context/ModalContext';

const SimplifiedApp = () => {
  const { darkMode } = useContext(ThemeContext);
  const { activeModal, setActiveModal } = useContext(ModalContext);

  const allItems = [
    { id: 1, name: 'Item 1', category: 'Food' },
    { id: 2, name: 'Item 2', category: 'Entertainment' },
    { id: 3, name: 'Item 3', category: 'Store' },
    { id: 4, name: 'Item 4', category: 'Food' },
  ];

  return (
    <AppProvider>
      <div className={`${darkMode ? 'dark' : ''}`}>
        <div className="h-screen w-full flex flex-col">
          {/* Header */}
          <Header />

          <div className="flex flex-grow overflow-hidden">
            {/* Left Panel */}
            <LeftPanel />

            {/* Main Content */}
            <div className="flex flex-col flex-grow overflow-auto">
              {/* Dashboard Content */}
              <ContentView items={allItems} />

              {/* Right Panel */}
              <RightPanel />
            </div>
          </div>

          {/* Modals */}
          {activeModal === 'signup' && (
            <SignupFormModal isOpen={true} onClose={() => setActiveModal(null)} />
          )}
          {activeModal && activeModal !== 'signup' && (
            <Modal title={activeModal} onClose={() => setActiveModal(null)}>
              <p className="text-gray-600 dark:text-gray-300">
                {activeModal} content goes here.
              </p>
            </Modal>
          )}
        </div>
      </div>
    </AppProvider>
  );
};

export default SimplifiedApp;
