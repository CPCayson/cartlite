// src/hooks/useFirestoreCollection.js
//  useFirestoreCollection(collectionName): Manage Firestore data fetching and listening
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Import Firestore instance

const useFirestoreCollection = (collectionName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(`useFirestoreCollection: Setting up listener for collection: ${collectionName}`);
    const unsubscribe = onSnapshot(collection(db, collectionName), (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log('useFirestoreCollection: Retrieved data:', docs);
      setData(docs);
      setLoading(false);
    });

    return () => {
      console.log(`useFirestoreCollection: Cleaning up listener for collection: ${collectionName}`);
      unsubscribe();
    };
  }, [collectionName]);

  return { data, loading };
};

export default useFirestoreCollection;
