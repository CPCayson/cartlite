// SignUp.jsx
import  { useState } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateFields = () => {
    if (!userName) return 'Please fill in a user name';
    if (!email) return 'Please fill in a valid email address';
    if (!password || password.length < 6) return 'Please fill in a valid password (6 characters minimum)';
    return null;
  };

  const handleSignUp = async () => {
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        username: userName,
        email: email,
        uid: user.uid
      });

      createStripeAccount(user.uid);

    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const createStripeAccount = async (uid) => {
    try {
      const response = await axios.post('https://us-central1-fir-medium-622b2.cloudfunctions.net/createConnectAccount', {
        uid: uid,
        email: email
      });
  
      const accountId = response.data.body.success;
      navigate(`/stripe-onboarding/${accountId}`);
    } catch (error) {
      console.error('Error creating Stripe account:', error);
      setError('Failed to create Stripe account. Please try again later.');
      setLoading(false);
    }
  };
  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Sign Up</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full p-2 mb-2 border"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 mb-2 border"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 mb-2 border"
      />
      <button
        onClick={handleSignUp}
        className="bg-blue-500 text-white p-2 rounded w-full"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Sign Up'}
      </button>
    </div>
  );
};

export default SignupForm;
