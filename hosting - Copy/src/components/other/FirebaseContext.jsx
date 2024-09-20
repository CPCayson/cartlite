import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { auth, db } from '../../hooks/firebase/firebaseConfig'; 

// Create a Firebase Context
const FirebaseContext = createContext(null);

// Firebase Provider Component
export const FirebaseProvider = ({ children }) => {
  console.log('FirebaseContext: Initializing Firebase Provider');
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('FirebaseContext: Setting up Firebase Auth listener');
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        console.log('FirebaseContext: User logged in', currentUser);
        setUser(currentUser);
      } else {
        console.log('FirebaseContext: No user logged in');
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Use useMemo to memoize the context value
  const firebaseContextValue = useMemo(() => ({ user, db }), [user, db]);

  return (
    <FirebaseContext.Provider value={firebaseContextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Define PropTypes for FirebaseProvider
FirebaseProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use Firebase Context
const useFirebase = () => {
  const context = useContext(FirebaseContext);
  
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  
  return context;
};

export {useFirebase} ;
