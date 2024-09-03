// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import PropTypes from 'prop-types';

// Create a context for the authentication
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component to provide auth state and functions to the rest of the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AuthProvider: Initializing authentication listener');

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('AuthProvider: Cleaning up authentication listener');
      unsubscribe();
    };
  }, []);

  // Function to log in a user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error during login:', err);
      setError(err.message);
    }
  };

  // Function to register a new user
  const register = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error during registration:', err);
      setError(err.message);
    }
  };

  // Function for Google sign-in
  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error during Google sign-in:', err);
      setError(err.message);
    }
  };

  // Function to log out a user
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error during logout:', err);
      setError(err.message);
    }
  };

  // Value to provide to consuming components
  const contextValue = {
    user,
    loading,
    error,
    login,
    register,
    googleSignIn,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
