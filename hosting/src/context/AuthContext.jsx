// // // AuthContext.js

// // import  { createContext, useContext, useState, useEffect, useCallback } from 'react';
// // import { auth, db } from '../hooks/firebase/firebaseConfig';
// // import {
// //   onAuthStateChanged,
// //   signInWithEmailAndPassword,
// //   createUserWithEmailAndPassword,
// //   signOut,
// //   GoogleAuthProvider,
// //   signInWithPopup,
// // } from 'firebase/auth';
// // import { doc, setDoc } from 'firebase/firestore';
// // import { useToast } from '@chakra-ui/react';
// // import { useUserData } from '../../../useUserData';
// // import { useStripeIntegration } from '../hooks/auth/useStripeIntegration';
// // import { useAsync } from '../hooks/auth/useAsync';
// // import { STRIPE_STATUS } from '../hooks/auth/constants';
// // import PropTypes from 'prop-types';

// // const AuthContext = createContext();

// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);
// //   const toast = useToast();
// //   const { updateUserData } = useUserData();
// //   const { initializeUserStripeAccount, getStripeAccountLink, checkStripeAccountStatus } = useStripeIntegration();

// //   const handleError = useCallback((title, description) => {
// //     console.error(`Error: ${title} - ${description}`);
// //     toast({
// //       title,
// //       description,
// //       status: 'error',
// //       duration: 3000,
// //       isClosable: true,
// //     });
// //   }, [toast]);

// //   const { execute: executeAuth, status: authStatus, error: authError } = useAsync(async (operation, ...args) => {
// //     console.log(`Starting ${operation.name} operation`);
// //     const result = await operation(...args);
// //     console.log(`${operation.name} operation successful`);
// //     const userData = await updateUserData(result.user);
// //     setUser(userData);
// //     return result;
// //   });

// //   const login = useCallback((email, password) => {
// //     console.log('Attempting login for email:', email);
// //     return executeAuth(signInWithEmailAndPassword, auth, email, password);
// //   }, [executeAuth]);

// //   const register = useCallback(async (email, password, additionalData = {}) => {
// //     try {
// //       console.log('Attempting registration for email:', email);
// //       const result = await createUserWithEmailAndPassword(auth, email, password);
      
// //       const userDocRef = doc(db, 'users', result.user.uid);
// //       await setDoc(userDocRef, {
// //         email: result.user.email,
// //         createdAt: new Date().toISOString(),
// //         stripeAccountStatus: STRIPE_STATUS.NOT_CREATED,
// //         ...additionalData
// //       });

// //       const stripeData = await initializeUserStripeAccount(result.user.uid, email);
// //       const updatedUserData = await updateUserData(result.user);
// //       setUser({ ...updatedUserData, ...stripeData });

// //       return result;
// //     } catch (error) {
// //       console.error('Registration error:', error);
// //       handleError('Registration Failed', error.message);
// //       throw error;
// //     }
// //   }, [initializeUserStripeAccount, updateUserData, handleError]);

// //   const googleSignIn = useCallback(() => {
// //     console.log('Attempting Google sign-in');
// //     return executeAuth(signInWithPopup, auth, new GoogleAuthProvider());
// //   }, [executeAuth]);

// //   const { execute: executeLogout, status: logoutStatus, error: logoutError } = useAsync(async () => {
// //     console.log('Attempting logout');
// //     await signOut(auth);
// //     setUser(null);
// //     console.log('Logout successful');
// //     toast({
// //       title: 'Logout Successful',
// //       description: 'You have been logged out.',
// //       status: 'success',
// //       duration: 3000,
// //       isClosable: true,
// //     });
// //   });

// //   const logout = useCallback(() => {
// //     executeLogout().catch(err => {
// //       console.error('Logout failed:', err);
// //       handleError('Logout Failed', err.message);
// //     });
// //   }, [executeLogout, handleError]);

// //   useEffect(() => {
// //     console.log('Setting up auth state listener');
// //     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
// //       console.log('Auth state changed:', currentUser ? currentUser.uid : 'No user');
// //       if (currentUser) {
// //         try {
// //           const userData = await updateUserData(currentUser);
// //           setUser(userData);
// //           console.log('User data updated:', userData);
// //         } catch (err) {
// //           console.error("Error fetching user data:", err);
// //           handleError("Failed to load user data", err.message);
// //         }
// //       } else {
// //         setUser(null);
// //         console.log('User logged out');
// //       }
// //     });

// //     return () => {
// //       console.log('Cleaning up auth state listener');
// //       unsubscribe();
// //     };
// //   }, [updateUserData, handleError]);

// //   const contextValue = {
// //     user,
// //     authStatus,
// //     authError,
// //     logoutStatus,
// //     logoutError,
// //     login,
// //     register,
// //     googleSignIn,
// //     logout,
// //     getStripeAccountLink,
// //     checkStripeAccountStatus,
// //   };

// //   return (
// //     <AuthContext.Provider value={contextValue}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };


// // AuthProvider.propTypes = {
// //   children: PropTypes.node.isRequired,
// // };

// // export const useAuth = () => {
// //   const context = useContext(AuthContext);
// //   if (!context) {
// //     throw new Error('useAuth must be used within an AuthProvider');
// //   }
// //   return context;
// // };

// // export default AuthProvider

// // AuthProvider.js

// import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { auth, db } from '../hooks/firebase/firebaseConfig';
// import {
//   onAuthStateChanged,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signOut,
//   GoogleAuthProvider,
//   signInWithPopup,
// } from 'firebase/auth';
// import { doc, setDoc } from 'firebase/firestore';
// import { useToast } from '@chakra-ui/react';
// import PropTypes from 'prop-types';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const toast = useToast();

//   const handleError = useCallback((title, description) => {
//     console.error(`Error: ${title} - ${description}`);
//     toast({
//       title,
//       description,
//       status: 'error',
//       duration: 3000,
//       isClosable: true,
//     });
//   }, [toast]);

//   const login = useCallback(async (email, password) => {
//     console.log('Attempting login for email:', email);
//     try {
//       const result = await signInWithEmailAndPassword(auth, email, password);
//       setUser(result.user);
//       return result;
//     } catch (error) {
//       console.error('Login error:', error);
//       handleError('Login Failed', error.message);
//       throw error;
//     }
//   }, [handleError]);

//   const register = useCallback(async (email, password, additionalData = {}) => {
//     try {
//       console.log('Attempting registration for email:', email);
//       const result = await createUserWithEmailAndPassword(auth, email, password);
      
//       const userDocRef = doc(db, 'users', result.user.uid);
//       await setDoc(userDocRef, {
//         email: result.user.email,
//         createdAt: new Date().toISOString(),
//         ...additionalData
//       });

//       setUser(result.user);
//       return result;
//     } catch (error) {
//       console.error('Registration error:', error);
//       handleError('Registration Failed', error.message);
//       throw error;
//     }
//   }, [handleError]);

//   const googleSignIn = useCallback(async () => {
//     console.log('Attempting Google sign-in');
//     try {
//       const result = await signInWithPopup(auth, new GoogleAuthProvider());
//       setUser(result.user);
//       return result;
//     } catch (error) {
//       console.error('Google Sign-in error:', error);
//       handleError('Google Sign-in Failed', error.message);
//       throw error;
//     }
//   }, [handleError]);

//   const logout = useCallback(async () => {
//     console.log('Attempting logout');
//     try {
//       await signOut(auth);
//       setUser(null);
//       console.log('Logout successful');
//       toast({
//         title: 'Logout Successful',
//         description: 'You have been logged out.',
//         status: 'success',
//         duration: 3000,
//         isClosable: true,
//       });
//     } catch (error) {
//       console.error('Logout failed:', error);
//       handleError('Logout Failed', error.message);
//     }
//   }, [toast, handleError]);

//   useEffect(() => {
//     console.log('Setting up auth state listener');
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       console.log('Auth state changed:', currentUser ? currentUser.uid : 'No user');
//       if (currentUser) {
//         try {
//           setUser(currentUser);
//           console.log('User data updated:', currentUser);
//         } catch (err) {
//           console.error("Error fetching user data:", err);
//           handleError("Failed to load user data", err.message);
//         }
//       } else {
//         setUser(null);
//         console.log('User logged out');
//       }
//     });

//     return () => {
//       console.log('Cleaning up auth state listener');
//       unsubscribe();
//     };
//   }, [handleError]);

//   const contextValue = {
//     user,
//     login,
//     register,
//     googleSignIn,
//     logout,
//   };

//   return (
//     <AuthContext.Provider value={contextValue}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// AuthProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export default AuthProvider;
// AuthProvider.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../hooks/firebase/firebaseConfig';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@chakra-ui/react';
import { useUserData } from '../hooks/auth/useUserData';
import { useStripeIntegration } from '../hooks/auth/useStripeIntegration';
import PropTypes from 'prop-types';
import { STRIPE_STATUS } from '../hooks/auth/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const toast = useToast();
  const { updateUserData } = useUserData();
  const { initializeUserStripeAccount } = useStripeIntegration();

  const handleError = useCallback(
    (title, description) => {
      console.error(`Error: ${title} - ${description}`);
      toast({
        title,
        description,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
    [toast]
  );

  const login = useCallback(
    async (email, password) => {
      console.log('Attempting login for email:', email);
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const updatedUserData = await updateUserData(result.user);
        setUser(updatedUserData);
        return result;
      } catch (error) {
        console.error('Login error:', error);
        handleError('Login Failed', error.message);
        throw error;
      }
    },
    [updateUserData, handleError]
  );

  const register = useCallback(
    async (email, password, additionalData = {}) => {
      try {
        console.log('Attempting registration for email:', email);
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Initialize Stripe account
        const stripeData = await initializeUserStripeAccount(result.user.uid, email);

        // Update user data with additional fields and Stripe information
        await updateUserData(result.user, {
          email: email,
          fullName: additionalData.fullName || '',
          createdAt: new Date().toISOString(),
          isNew: true,
        });

        // Update Firestore with Stripe data
        const userDocRef = doc(db, 'users', result.user.uid);
        await updateDoc(userDocRef, {
          stripeConnectedAccountId: stripeData.stripeConnectedAccountId,
          stripeCustomerId: stripeData.stripeCustomerId,
          stripeAccountStatus: stripeData.stripeAccountStatus,
          stripeAccountLink: stripeData.stripeAccountLink,
          stripeLastUpdated: stripeData.stripeLastUpdated,
        });

        setUser({ ...result.user, ...stripeData });
        return result;
      } catch (error) {
        console.error('Registration error:', error);
        handleError('Registration Failed', error.message);
        throw error;
      }
    },
    [initializeUserStripeAccount, updateUserData, handleError]
  );

  const googleSignIn = useCallback(async () => {
    console.log('Attempting Google sign-in');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const updatedUserData = await updateUserData(result.user);
      setUser(updatedUserData);
      return result;
    } catch (error) {
      console.error('Google Sign-in error:', error);
      handleError('Google Sign-in Failed', error.message);
      throw error;
    }
  }, [updateUserData, handleError]);

  const logout = useCallback(async () => {
    console.log('Attempting logout');
    try {
      await signOut(auth);
      setUser(null);
      console.log('Logout successful');
      toast({
        title: 'Logout Successful',
        description: 'You have been logged out.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      handleError('Logout Failed', error.message);
    }
  }, [toast, handleError]);

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser ? currentUser.uid : 'No user');
      if (currentUser) {
        try {
          const userData = await updateUserData(currentUser);
          setUser(userData);
          console.log('User data updated:', userData);
        } catch (err) {
          console.error('Error fetching user data:', err);
          handleError('Failed to load user data', err.message);
        }
      } else {
        setUser(null);
        console.log('User logged out');
      }
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, [updateUserData, handleError]);

  const contextValue = {
    user,
    login,
    register,
    googleSignIn,
    logout,
    // Add other context values as needed
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
