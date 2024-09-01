import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig'; // Ensure correct import of auth from firebaseConfig
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Import Firestore for profile management
import PropTypes from 'prop-types';

// Create a Context for Auth
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider component to provide auth state and functions to the rest of the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Function to log in a user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError(null); // Reset error on successful login
    } catch (err) {
      console.error('Error logging in:', err);
      setError(err.message);
    }
  };

  // Function to register a new user
  const register = async (email, password, additionalData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        email: newUser.email,
        ...additionalData,
      });

      setUser(newUser);
      setError(null); // Reset error on successful registration
    } catch (err) {
      console.error('Error registering user:', err);
      setError(err.message);
    }
  };

  // Function to log out a user
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Error logging out:', err);
      setError(err.message);
    }
  };

  // Function to sign in with Google
  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const newUser = result.user;

      // Merge user document in Firestore
      await setDoc(
        doc(db, 'users', newUser.uid),
        {
          email: newUser.email,
        },
        { merge: true }
      );

      setUser(newUser);
      setError(null); // Reset error on successful Google sign-in
    } catch (err) {
      console.error('Error with Google sign-in:', err);
      setError(err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, googleSignIn }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
