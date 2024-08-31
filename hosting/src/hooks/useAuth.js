// src/hooks/useAuth.js

import { useState, useEffect } from 'react';
import firebase from '../firebase/firebaseConfig'; // Import Firebase services
import { onAuthStateChanged } from 'firebase/auth';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuth: Initializing authentication listener');

    const unsubscribe = onAuthStateChanged(firebase.auth, (currentUser) => {
      if (currentUser) {
        console.log('useAuth: User authenticated', currentUser);
        setUser(currentUser);
      } else {
        console.log('useAuth: No user authenticated');
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      console.log('useAuth: Cleaning up authentication listener');
      unsubscribe();
    };
  }, []);

  return { user, loading };
};

export default useAuth;
