const express = require('express');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { useState, useEffect } = require('react');
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, GoogleAuthProvider } = require('firebase/auth');
const { doc, getDoc, setDoc } = require('firebase/firestore');
const { auth, db } = require('./firebaseConfig');  // Replace with your actual Firebase configuration file
const { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalFooter, 
  ModalBody, 
  ModalCloseButton, 
  Button, 
  Input, 
  VStack, 
  Text, 
  useToast, 
  Box, 
  Image 
} = require('@chakra-ui/react');
const { useNavigate } = require('react-router-dom');
const axios = require('axios');
const app = express();

// Create an Axios instance with base URL and interceptors for authentication
const createApi = () => {
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  });

  api.interceptors.request.use(async (config) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(true);
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    } catch (error) {
      console.error('Error setting up request interceptor:', error);
      return Promise.reject(error);
    }
  });

  return api;
};

const api = createApi();

const Auth = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [stripeAccountStatus, setStripeAccountStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);
        await checkUserTypeAndStripeAccount(user);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          userType: 'host',
          stripeAccountId: '',
          stripeAccountStatus: 'not_created',
          stripeId: '',
          stripeLink: '',
          address: address,
          name: name,
        });

        const stripeAccount = await createStripeConnectedAccount(userCredential.user.email);

        await setDoc(
          doc(db, 'users', userCredential.user.uid),
          {
            stripeAccountId: stripeAccount.accountId,
            stripeAccountStatus: 'not_created',
          },
          { merge: true }
        );

        const accountLink = await createAccountLink(stripeAccount.accountId);

        window.location.href = accountLink.url;
      }
      setEmail('');
      setPassword('');
      setIsAuthOpen(false);
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await setDoc(
        doc(db, 'users', result.user.uid),
        {
          email: result.user.email,
          userType: 'host',
          stripeAccountId: '',
          stripeAccountStatus: 'not_created',
          stripeId: '',
          stripeLink: '',
          address: '',
          name: '',
        },
        { merge: true }
      );
      await checkUserTypeAndStripeAccount(result.user);
      setIsAuthOpen(false);
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Authentication Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setIsAuthenticated(false);
      navigate('/');
    } catch (error) {
      toast({
        title: 'Logout Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const checkUserTypeAndStripeAccount = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.userType === 'host') {
          if (!userData.stripeAccountId) {
            const stripeAccount = await createStripeConnectedAccount(user.email);
            await setDoc(
              doc(db, 'users', user.uid),
              {
                stripeAccountId: stripeAccount.accountId,
                stripeAccountStatus: 'not_created',
              },
              { merge: true }
            );
          }
          const status = await getStripeAccountStatus(userData.stripeAccountId);
          setStripeAccountStatus(status);

          if (status === 'not_created' || status === 'incomplete') {
            const accountLink = await createAccountLink(userData.stripeAccountId);
            window.location.href = accountLink.url;
          }
        }
      }
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return React.createElement(
    'div',
    { className: 'relative min-h-screen' },
    React.createElement(
      Button,
      { onClick: () => (isAuthenticated ? handleLogout() : setIsAuthOpen(true)), colorScheme: 'teal', size: 'lg', mt: 8 },
      isAuthenticated ? 'Logout' : 'Login / Sign Up'
    ),
    React.createElement(
      Modal,
      { isOpen: isAuthOpen, onClose: () => setIsAuthOpen(false) },
      React.createElement(ModalOverlay),
      React.createElement(
        ModalContent,
        null,
        React.createElement(
          ModalHeader,
          null,
          React.createElement(
            Box,
            { display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 },
            React.createElement(Image, { src: '/api/placeholder/100/100', alt: 'cartRABBIT logo', boxSize: '100px' })
          ),
          isLogin ? 'Login' : 'Sign Up'
        ),
        React.createElement(ModalCloseButton),
        React.createElement(
          ModalBody,
          null,
          error && React.createElement(Text, { color: 'red.500' }, error),
          React.createElement(
            'form',
            { onSubmit: handleSubmit },
            React.createElement(
              VStack,
              { spacing: 4 },
              React.createElement(Input, { type: 'email', placeholder: 'Email', value: email, onChange: (e) => setEmail(e.target.value) }),
              React.createElement(Input, { type: 'password', placeholder: 'Password', value: password, onChange: (e) => setPassword(e.target.value) }),
              !isLogin &&
                React.createElement(
                  React.Fragment,
                  null,
                  React.createElement(Input, { type: 'text', placeholder: 'Name', value: name, onChange: (e) => setName(e.target.value) }),
                  React.createElement(Input, { type: 'text', placeholder: 'Address', value: address, onChange: (e) => setAddress(e.target.value) })
                ),
              React.createElement(Button, { type: 'submit', colorScheme: 'blue', width: 'full', bg: '#FF7F50', _hover: { bg: '#e7663c' }, borderRadius: '8px' }, isLogin ? 'Login' : 'Sign Up')
            )
          ),
          React.createElement(Button, { onClick: signInWithGoogle, colorScheme: 'red', width: 'full', mt: 4, borderRadius: '8px' }, 'Sign in with Google')
        ),
        React.createElement(
          ModalFooter,
          null,
          React.createElement(Button, { variant: 'link', onClick: () => setIsLogin(!isLogin) }, isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login')
        )
      )
    )
  );
};

// Server setup
app.get('/', (req, res) => {
  const reactComponent = ReactDOMServer.renderToString(React.createElement(Auth));
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Auth</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@chakra-ui/react@1.8.5/dist/chakra-ui.min.css" />
      </head>
      <body>
        <div id="root">${reactComponent}</div>
        <script src="/bundle.js"></script>
      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
