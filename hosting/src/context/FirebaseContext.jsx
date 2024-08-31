import  { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebaseConfig';

const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  console.log('FirebaseContext: Initializing Firebase Provider');
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('FirebaseContext: Setting up Firebase Auth listener');
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        console.log('FirebaseContext: User logged in', currentUser);
        setUser(currentUser);
      } else {
        console.log('FirebaseContext: No user logged in');
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, db }}>
      {children}
    </FirebaseContext.Provider>
  );
};

import PropTypes from 'prop-types';

FirebaseProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    console.error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
