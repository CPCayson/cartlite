// src/hooks/useFirestoreCollection.js
//  useFirestoreCollection(collectionName): Manage Firestore data fetching and listening
// hosting/src/hooks/useFirestoreCollection.jsx

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const useFirestoreCollection = (collectionName, conditions = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let q = collection(db, collectionName);

    // Apply conditions if provided
    if (conditions.length > 0) {
      q = query(q, ...conditions);
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, conditions]);

  return { data, loading, error };
};

export default useFirestoreCollection;
