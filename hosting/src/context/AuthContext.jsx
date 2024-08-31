import  { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig'; // Ensure correct import of auth from firebaseConfig
import { onAuthStateChanged } from 'firebase/auth';
import PropTypes from 'prop-types';

// Create a Context for Auth
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider component to provide auth state to the rest of the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing authentication listener');

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log('AuthProvider: User authenticated', currentUser);
        setUser(currentUser);
      } else {
        console.log('AuthProvider: No user authenticated');
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up authentication listener');
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};


AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
