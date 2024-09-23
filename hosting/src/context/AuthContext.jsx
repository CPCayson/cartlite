// // src/context/AuthContext.js
// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { auth, db } from '../hooks/firebase/firebaseConfig';
// import {
//   onAuthStateChanged,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signOut,
//   GoogleAuthProvider,
//   signInWithPopup,
//   signInAnonymously,
//   linkWithCredential,
//   EmailAuthProvider,
// } from 'firebase/auth';
// import { doc, updateDoc } from 'firebase/firestore';
// import { useToast } from '@chakra-ui/react';
// import { useUserData } from '../hooks/auth/useUserData';
// import { useStripeIntegration } from '../hooks/auth/useStripeIntegration';
// import PropTypes from 'prop-types';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const toast = useToast();
//   const { updateUserData } = useUserData();
//   const { initializeUserStripeAccount } = useStripeIntegration();

//   const handleError = useCallback(
//     (title, description) => {
//       console.error(`Error: ${title} - ${description}`);
//       toast({
//         title,
//         description,
//         status: 'error',
//         duration: 3000,
//         isClosable: true,
//       });
//     },
//     [toast]
//   );

//   const upgradeAnonymousUser = useCallback(
//     async (email, password, additionalData = {}) => {
//       console.log('Upgrading anonymous user to permanent account');
//       const credential = EmailAuthProvider.credential(email, password);
//       try {
//         const userCredential = await linkWithCredential(auth.currentUser, credential);

//         // Initialize Stripe account
//         //const stripeData = await initializeUserStripeAccount(userCredential.user.uid, email);

//         // Update user data with additional fields and Stripe information
//         await updateUserData(userCredential.user, {
//           email: email,
//           fullName: additionalData.fullName || '',
//           createdAt: new Date().toISOString(),
//           isNew: true,
//           role: 'user', // Set default role to 'user'
//         });

//         // // Update Firestore with Stripe data
//         // const userDocRef = doc(db, 'users', userCredential.user.uid);
//         // await updateDoc(userDocRef, {
//         //   stripeConnectedAccountId: stripeData.stripeConnectedAccountId,
//         //   stripeCustomerId: stripeData.stripeCustomerId,
//         //   stripeAccountStatus: stripeData.stripeAccountStatus,
//         //   stripeAccountLink: stripeData.stripeAccountLink,
//         //   stripeLastUpdated: stripeData.stripeLastUpdated,
//         // });

//         const updatedUserData = await updateUserData(userCredential.user);
//         setUser({
//           ...updatedUserData,
//           isAnonymous: userCredential.user.isAnonymous,
//           role: updatedUserData.role || 'user',
//         });

//         return userCredential;
//       } catch (error) {
//         console.error('Error upgrading anonymous user:', error);
//         handleError('Upgrade Failed', error.message);
//         throw error;
//       }
//     },
//     [ updateUserData, handleError]
//   );

//   const login = useCallback(
//     async (email, password) => {
//       console.log('Attempting login for email:', email);
//       try {
//         const result = await signInWithEmailAndPassword(auth, email, password);
//         const updatedUserData = await updateUserData(result.user);
//         setUser({
//           ...updatedUserData,
//           isAnonymous: result.user.isAnonymous,
//           role: updatedUserData.role || 'user',
//         });
//         return result;
//       } catch (error) {
//         console.error('Login error:', error);
//         handleError('Login Failed', error.message);
//         throw error;
//       }
//     },
//     [updateUserData, handleError]
//   );

//   const register = useCallback(
//     async (email, password, additionalData = {}) => {
//       try {
//         console.log('Attempting registration for email:', email);
//         const result = await createUserWithEmailAndPassword(auth, email, password);

//         // Initialize Stripe account
//         const stripeData = await initializeUserStripeAccount(result.user.uid, email);

//         // Update user data with additional fields and Stripe information
//         await updateUserData(result.user, {
//           email: email,
//           fullName: additionalData.fullName || '',
//           createdAt: new Date().toISOString(),
//           isNew: true,
//           role: 'user', // Set default role to 'user'
//         });

//         // Update Firestore with Stripe data
//         const userDocRef = doc(db, 'users', result.user.uid);
//         await updateDoc(userDocRef, {
//           stripeConnectedAccountId: stripeData.stripeConnectedAccountId,
//           stripeCustomerId: stripeData.stripeCustomerId,
//           stripeAccountStatus: stripeData.stripeAccountStatus,
//           stripeAccountLink: stripeData.stripeAccountLink,
//           stripeLastUpdated: stripeData.stripeLastUpdated,
//         });

//         const updatedUserData = await updateUserData(result.user);
//         setUser({
//           ...updatedUserData,
//           isAnonymous: result.user.isAnonymous,
//           role: updatedUserData.role || 'user',
//         });
//         return result;
//       } catch (error) {
//         console.error('Registration error:', error);
//         handleError('Registration Failed', error.message);
//         throw error;
//       }
//     },
//     [initializeUserStripeAccount, updateUserData, handleError]
//   );

//   const googleSignIn = useCallback(async () => {
//     console.log('Attempting Google sign-in');
//     try {
//       const result = await signInWithPopup(auth, new GoogleAuthProvider());
//       const updatedUserData = await updateUserData(result.user);
//       setUser({
//         ...updatedUserData,
//         isAnonymous: result.user.isAnonymous,
//         role: updatedUserData.role || 'user',
//       });
//       return result;
//     } catch (error) {
//       console.error('Google Sign-in error:', error);
//       handleError('Google Sign-in Failed', error.message);
//       throw error;
//     }
//   }, [updateUserData, handleError]);

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

//   const updateUserRole = useCallback(
//     async (newRole) => {
//       if (!user) return;

//       try {
//         const userDocRef = doc(db, 'users', user.uid);
//         await updateDoc(userDocRef, {
//           role: newRole,
//         });
//         setUser((prevUser) => ({
//           ...prevUser,
//           role: newRole,
//         }));
//       } catch (error) {
//         console.error('Error updating user role:', error);
//         handleError('Update Failed', error.message);
//       }
//     },
//     [user, handleError]
//   );

//   useEffect(() => {
//     console.log('Setting up auth state listener');
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       console.log('Auth state changed:', currentUser ? currentUser.uid : 'No user');
//       if (currentUser) {
//         try {
//           const userData = await updateUserData(currentUser);
//           setUser({
//             ...userData,
//             isAnonymous: currentUser.isAnonymous,
//             role: userData.role || (currentUser.isAnonymous ? 'guest' : 'user'),
//           });
//           console.log('User data updated:', userData);
//         } catch (err) {
//           console.error('Error fetching user data:', err);
//           handleError('Failed to load user data', err.message);
//         }
//       } else {
//         // No user is signed in, sign in anonymously
//         try {
//           console.log('No user, signing in anonymously');
//           const result = await signInAnonymously(auth);
//           const userData = await updateUserData(result.user);
//           setUser({
//             ...userData,
//             isAnonymous: result.user.isAnonymous,
//             role: 'guest', // Set role to 'guest' for anonymous users
//           });
//         } catch (error) {
//           console.error('Anonymous Sign-in error:', error);
//           handleError('Anonymous Sign-in Failed', error.message);
//         }
//       }
//     });

//     return () => {
//       console.log('Cleaning up auth state listener');
//       unsubscribe();
//     };
//   }, [updateUserData, handleError]);

//   const contextValue = {
//     user,
//     login,
//     register,
//     googleSignIn,
//     logout,
//     upgradeAnonymousUser,
//     updateUserRole, // Added to context
//     // Add other context values as needed
//   };

//   return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
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

// export default AuthContext;
// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../hooks/firebase/firebaseConfig';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  linkWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@chakra-ui/react';
import { useUserData } from '../hooks/auth/useUserData';
// import { useStripeIntegration } from '../hooks/auth/useStripeIntegration'; // Stripe integration commented out
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const toast = useToast();
  const { updateUserData } = useUserData();
  // const { initializeUserStripeAccount } = useStripeIntegration(); // Stripe integration commented out

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
  const navigateToHost = useCallback(() => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/Host');
    }
  }, []);

  const upgradeAnonymousUser = useCallback(
    async (email, password, additionalData = {}) => {
      console.log('Upgrading anonymous user to permanent account');
      const credential = EmailAuthProvider.credential(email, password);
      try {
        const userCredential = await linkWithCredential(auth.currentUser, credential);

        // Initialize Stripe account
        // const stripeData = await initializeUserStripeAccount(userCredential.user.uid, email);

        // Update user data with additional fields and Stripe information
        await updateUserData(userCredential.user, {
          email: email,
          fullName: additionalData.fullName || '',
          createdAt: new Date().toISOString(),
          isNew: true,
          role: 'user', // Set default role to 'user'
        });

        // // Update Firestore with Stripe data
        // const userDocRef = doc(db, 'users', userCredential.user.uid);
        // await updateDoc(userDocRef, {
        //   stripeConnectedAccountId: stripeData.stripeConnectedAccountId,
        //   stripeCustomerId: stripeData.stripeCustomerId,
        //   stripeAccountStatus: stripeData.stripeAccountStatus,
        //   stripeAccountLink: stripeData.stripeAccountLink,
        //   stripeLastUpdated: stripeData.stripeLastUpdated,
        // });

        const updatedUserData = await updateUserData(userCredential.user);
        setUser({
          ...updatedUserData,
          isAnonymous: userCredential.user.isAnonymous,
          role: updatedUserData.role || 'user',
        });

        navigateToHost(); // Navigate to /host after successful upgrade

        return userCredential;
      } catch (error) {
        console.error('Error upgrading anonymous user:', error);
        handleError('Upgrade Failed', error.message);
        throw error;
      }
    },
    [updateUserData, handleError, navigateToHost]
  );

  const login = useCallback(
    async (email, password) => {
      console.log('Attempting login for email:', email);
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const updatedUserData = await updateUserData(result.user);
        setUser({
          ...updatedUserData,
          isAnonymous: result.user.isAnonymous,
          role: updatedUserData.role || 'user',
        });

        navigateToHost(); // Navigate to /host after successful login

        return result;
      } catch (error) {
        console.error('Login error:', error);
        handleError('Login Failed', error.message);
        throw error;
      }
    },
    [updateUserData, handleError, navigateToHost]
  );

  const register = useCallback(
    async (email, password, additionalData = {}) => {
      try {
        console.log('Attempting registration for email:', email);
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Initialize Stripe account
        // const stripeData = await initializeUserStripeAccount(result.user.uid, email);

        // Update user data with additional fields and Stripe information
        await updateUserData(result.user, {
          email: email,
          fullName: additionalData.fullName || '',
          createdAt: new Date().toISOString(),
          isNew: true,
          role: 'user', // Set default role to 'user'
        });

        // Update Firestore with Stripe data
        // const userDocRef = doc(db, 'users', result.user.uid);
        // await updateDoc(userDocRef, {
        //   stripeConnectedAccountId: stripeData.stripeConnectedAccountId,
        //   stripeCustomerId: stripeData.stripeCustomerId,
        //   stripeAccountStatus: stripeData.stripeAccountStatus,
        //   stripeAccountLink: stripeData.stripeAccountLink,
        //   stripeLastUpdated: stripeData.stripeLastUpdated,
        // });

        const updatedUserData = await updateUserData(result.user);
        setUser({
          ...updatedUserData,
          isAnonymous: result.user.isAnonymous,
          role: updatedUserData.role || 'user',
        });

        navigateToHost(); // Navigate to /host after successful registration

        return result;
      } catch (error) {
        console.error('Registration error:', error);
        handleError('Registration Failed', error.message);
        throw error;
      }
    },
    [/* initializeUserStripeAccount, */ updateUserData, handleError, navigateToHost] // initializeUserStripeAccount commented out
  );

  const googleSignIn = useCallback(async () => {
    console.log('Attempting Google sign-in');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const updatedUserData = await updateUserData(result.user);
      setUser({
        ...updatedUserData,
        isAnonymous: result.user.isAnonymous,
        role: updatedUserData.role || 'user',
      });

      navigateToHost(); // Navigate to /host after successful Google sign-in

      return result;
    } catch (error) {
      console.error('Google Sign-in error:', error);
      handleError('Google Sign-in Failed', error.message);
      throw error;
    }
  }, [updateUserData, handleError, navigateToHost]);

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

  const updateUserRole = useCallback(
    async (newRole) => {
      if (!user) return;

      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          role: newRole,
        });
        setUser((prevUser) => ({
          ...prevUser,
          role: newRole,
        }));
      } catch (error) {
        console.error('Error updating user role:', error);
        handleError('Update Failed', error.message);
      }
    },
    [user, handleError]
  );

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser ? currentUser.uid : 'No user');
      if (currentUser) {
        try {
          const userData = await updateUserData(currentUser);
          setUser({
            ...userData,
            isAnonymous: currentUser.isAnonymous,
            role: userData.role || (currentUser.isAnonymous ? 'guest' : 'user'),
          });

          // Optionally navigate to /host if not already there
          // You can uncomment the line below if you want to navigate on auth state change
          // navigateToHost();

          console.log('User data updated:', userData);
        } catch (err) {
          console.error('Error fetching user data:', err);
          handleError('Failed to load user data', err.message);
        }
      } else {
        // No user is signed in, sign in anonymously
        try {
          console.log('No user, signing in anonymously');
          const result = await signInAnonymously(auth);
          const userData = await updateUserData(result.user);
          setUser({
            ...userData,
            isAnonymous: result.user.isAnonymous,
            role: 'guest', // Set role to 'guest' for anonymous users
          });

          // Optionally navigate to /host if needed for anonymous users
          // navigateToHost();
        } catch (error) {
          console.error('Anonymous Sign-in error:', error);
          handleError('Anonymous Sign-in Failed', error.message);
        }
      }
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, [updateUserData, handleError /*, navigateToHost */]); // navigateToHost optional

  const contextValue = {
    user,
    login,
    register,
    googleSignIn,
    logout,
    upgradeAnonymousUser,
    updateUserRole, // Added to context
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

export default AuthContext;
