// src/api/auth.js

import admin from '../firebase/adminConfig';
import logger from '../utils/logger'; // Import the custom logger

// Middleware function to verify Firebase token and attach user information to the request
const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  
  if (!idToken) {
    logger.warn('No token found, proceeding as anonymous user');
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    logger.info('Token verified successfully', { uid: decodedToken.uid, email: decodedToken.email });
    req.user = decodedToken; // Attach decoded user information to request object
    next();
  } catch (error) {
    logger.error('Token verification failed', { message: error.message, stack: error.stack });
    res.status(403).json({ error: 'Invalid token' });
  }
};

export default verifyToken;
