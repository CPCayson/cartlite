import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, LockIcon, X } from 'lucide-react';
import UserProfileForm from './UserProfileForm.jsx';
import CartProfileForm from './CartProfileForm.jsx';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const DocumentCard = ({ document, onOpenModal }) => {
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm transition-all duration-300 ease-in-out cursor-pointer"
      onClick={() => document.status !== 'disabled' && onOpenModal(document.id)}
    >
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">{document.name}</h2>
          <div className="flex items-center">
            {document.status === 'completed' && <CheckCircle className="text-green-500" size={20} />}
            {document.status === 'pending' && <AlertCircle className="text-yellow-500" size={20} />}
            {document.status === 'disabled' && <LockIcon className="text-gray-400" size={20} />}
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-1">{document.description}</p>
        {document.status !== 'disabled' && (
          <button 
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300 mt-2"
            onClick={(e) => { e.stopPropagation(); onOpenModal(document.id); }}
          >
            {document.action}
          </button>
        )}
      </div>
    </div>
  );
};

const Host = () => {
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [activeModalId, setActiveModalId] = useState(null);

  const togglePanelExpansion = () => {
    setIsPanelExpanded(!isPanelExpanded);
  };

  const openModal = (id) => {
    setActiveModalId(id);
  };

  const closeModal = () => {
    setActiveModalId(null);
  };

  const requiredDocuments = [
    { 
      id: 'userProfile', 
      name: "User Profile", 
      status: "pending", 
      description: "Complete your host profile information",
      action: "Edit Profile",
      component: UserProfileForm
    },
    { 
      id: 'cartProfile', 
      name: "Cart Profile", 
      status: "pending", 
      description: "Set up your cart details",
      action: "Edit Cart",
      component: CartProfileForm
    },
    { 
      id: 'stripeConnect', 
      name: "Stripe Connect", 
      status: "disabled", 
      description: "Set up your payment method (coming soon)",
      action: "Connect Stripe"
    }
  ];

  return (
    <div className="h-screen w-full overflow-hidden flex bg-gray-100">
      {/* Left Panel */}
      <div 
        className={`bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 transition-all duration-300 ease-in-out shadow-xl flex flex-col
          ${isPanelExpanded ? 'w-64' : 'w-16'}`}
      >
        {/* Panel Header */}
        <div className="p-4 flex justify-between items-center">
          {isPanelExpanded && <h2 className="text-lg font-bold text-white">Host Dashboard</h2>}
          <button
            onClick={togglePanelExpansion}
            className="p-1 rounded-full bg-white bg-opacity-20 text-white shadow-md"
          >
            {isPanelExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Panel Content */}
        {isPanelExpanded && (
          <div className="flex-grow p-4">
            <h3 className="text-white font-semibold mb-2">Required Documents</h3>
            <ul className="space-y-2">
              {requiredDocuments.map((doc) => (
                <li key={doc.id} className="flex items-center text-white">
                  {doc.status === 'completed' && <CheckCircle className="text-green-300 mr-2" size={16} />}
                  {doc.status === 'pending' && <AlertCircle className="text-yellow-300 mr-2" size={16} />}
                  {doc.status === 'disabled' && <LockIcon className="text-gray-400 mr-2" size={16} />}
                  {doc.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main Dashboard */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Dashboard Content */}
        <div className="p-6 flex-grow overflow-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome to Your Host Dashboard</h1>
          <p className="text-gray-600 mb-6">Complete the following documents to set up your hosting account. We'll be fully operational in a couple of days!</p>
          <div className="space-y-4">
            {requiredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onOpenModal={openModal}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {requiredDocuments.map((doc) => (
        doc.component && (
          <Modal
            key={doc.id}
            isOpen={activeModalId === doc.id}
            onClose={closeModal}
            title={doc.name}
          >
            <doc.component />
          </Modal>
        )
      ))}
    </div>
  );
};

export default Host;