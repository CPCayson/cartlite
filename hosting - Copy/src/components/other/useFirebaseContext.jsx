import { useContext } from 'react';
import { FirebaseContext } from './FirebaseContext';

const useFirebaseContext = () => {
  console.log('useFirebaseContext: Accessing Firebase context');
  const context = useContext(FirebaseContext);

  if (!context) {
    console.error('useFirebaseContext must be used within a FirebaseProvider');
    throw new Error('useFirebaseContext must be used within a FirebaseProvider');
  }

  return context;
};

export default useFirebaseContext;


