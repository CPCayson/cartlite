// src/context/ModalContext.jsx

import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [activeModal, setActiveModal] = useState(null);

  const toggleModal = (modalName) => {
    setActiveModal((prev) => (prev === modalName ? null : modalName));
  };

  return (
    <ModalContext.Provider value={{ activeModal, setActiveModal, toggleModal }}>
      {children}
    </ModalContext.Provider>
  );
};

ModalProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ModalContext;
