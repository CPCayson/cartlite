import  { useEffect, useState } from 'react';
import { useFirebase } from '../context/FirebaseContext'; // Using useFirebase hook

const ViewCarts = () => {
  const { db } = useFirebase(); // Accessing Firestore from Firebase context
  const [carts, setCarts] = useState([]);

  useEffect(() => {
    console.log('ViewCarts: Fetching carts from Firestore');
    const unsubscribe = db.collection('carts').onSnapshot((snapshot) => {
      const cartsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('ViewCarts: Carts fetched successfully', cartsArray);
      setCarts(cartsArray);
    });

    return () => {
      console.log('ViewCarts: Cleaning up Firestore listener');
      unsubscribe();
    };
  }, [db]);

  return (
    <div className="view-carts">
      <h2>Your Carts</h2>
      <ul>
        {carts.map((cart) => (
          <li key={cart.id}>
            {cart.cartName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewCarts;
