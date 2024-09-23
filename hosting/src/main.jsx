import React from 'react';
import App from './App'; // Import App component (formerly AppLayout)
import './index.css'
import { createRoot } from 'react-dom/client';
import { AppStateProvider } from '@context/AppStateContext';
import { ModeProvider } from './context/ModeContext';

const root = createRoot(document.getElementById('root')); // Ensure this matches the ID in your index.html
root.render(
  <React.StrictMode>
            <AppStateProvider>
            <ModeProvider>


    <App />
      </ModeProvider>
    </AppStateProvider> 

  </React.StrictMode>
);
