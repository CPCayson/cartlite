// src/components/shared/Modal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const Modal = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 md:w-1/3 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close Modal"
        >
          <X size={24} />
        </button>
        {title && (
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{title}</h2>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  title: PropTypes.string, // Made title optional
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Modal;
// src/components/shared/RightPanel.jsx
