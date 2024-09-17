import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase Storage
import { useToast } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext'; // Context for user authentication
import { useFirebase } from '../../context/FirebaseContext'; // Context for Firebase services

export const useCartProfileForm = () => {
  const { user } = useAuth(); // Get the authenticated user
  const { db, storage } = useFirebase(); // Firestore DB and Firebase Storage reference
  const toast = useToast(); // Toast notifications

  const [cartData, setCartData] = useState({
    cartName: '',
    capacity: 3,
    description: '',
    features: {
      airConditioner: false,
      electric: true,
      radio: false,
      storage: true,
    },
    images: [
      'https://via.placeholder.com/150',
      'https://via.placeholder.com/150',
      'https://via.placeholder.com/150',
    ],
  });
  const [loading, setLoading] = useState(false);
  const [cartExists, setCartExists] = useState(false); // To track if the cart already exists
  const [uploading, setUploading] = useState(false); // For image uploads

  // Fetch existing cart details from Firestore and prefill the form
  useEffect(() => {
    if (user) {
      const fetchCartDetails = async () => {
        setLoading(true);
        try {
          const cartDocRef = doc(db, 'carts', user.uid); // Reference to the user's cart document
          const cartDocSnap = await getDoc(cartDocRef);

          if (cartDocSnap.exists()) {
            const cartDetails = cartDocSnap.data();
            setCartData((prevData) => ({
              ...prevData,
              ...cartDetails, // Prefill with saved data
              features: { ...prevData.features, ...cartDetails.features }, // Merge features
              images: cartDetails.images && cartDetails.images.length > 0
                ? cartDetails.images
                : [
                  'https://via.placeholder.com/150',
                  'https://via.placeholder.com/150',
                  'https://via.placeholder.com/150',
                ], // Default images if none are found
            }));
            setCartExists(true); // Mark that the cart already exists
          } else {
            console.log("No cart details found.");
            setCartExists(false); // No existing cart
          }
        } catch (error) {
          console.error('Error fetching cart details:', error);
          toast({
            title: 'Error',
            description: 'Could not load cart details.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      };

      fetchCartDetails();
    }
  }, [user, db, toast]);

  // Handle input changes for cart information
  const handleCartChange = (e) => {
    const { name, value } = e.target;
    setCartData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle cart feature switches
  const handleFeatureToggle = (feature) => {
    setCartData((prev) => ({
      ...prev,
      features: { ...prev.features, [feature]: !prev.features[feature] },
    }));
  };

  // Adjust cart capacity by increment/decrement
  const handleCapacityChange = (increment) => {
    setCartData((prev) => ({
      ...prev,
      capacity: Math.max(1, prev.capacity + increment),
    }));
  };

  // Upload image to Firebase Storage
  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `cartImages/${user.uid}/${file.name}`); // Create a storage reference
      await uploadBytes(storageRef, file); // Upload the file
      const downloadURL = await getDownloadURL(storageRef); // Get the file's download URL

      // Update cartData with the new image URL
      setCartData((prev) => {
        const newImages = [...prev.images];
        newImages[index] = downloadURL; // Replace the image at the specified index
        return { ...prev, images: newImages };
      });

      toast({
        title: 'Image Uploaded',
        description: 'Your image has been successfully uploaded.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  // Save or update cart details in Firestore
  const handleSaveCartInfo = async () => {
    if (!user) return; // Ensure the user is logged in

    try {
      const cartDocRef = doc(db, 'carts', user.uid); // Firestore document reference for the cart

      if (cartExists) {
        // If the cart already exists, update it
        await updateDoc(cartDocRef, cartData);
        toast({
          title: 'Cart Updated',
          description: 'Your cart details have been successfully updated.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // If the cart doesn't exist, create a new one and update the host ID
        await setDoc(cartDocRef, {
          ...cartData,
          hostId: user.uid, // Store host (user) ID in the cart document
        });

        // Update the user's document with the cart ID
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { cartId: user.uid });

        setCartExists(true); // Mark that the cart now exists
        toast({
          title: 'Cart Created',
          description: 'Your cart has been successfully created.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving cart:', error);
      toast({
        title: 'Save Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return {
    cartData,
    loading,
    uploading,
    handleCartChange,
    handleFeatureToggle,
    handleCapacityChange,
    handleSaveCartInfo,
    handleImageUpload, // Expose image upload handler
  };
};
