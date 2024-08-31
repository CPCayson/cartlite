import admin from 'firebase-admin';

// Parse the Firebase Admin SDK service account key from environment variables
const serviceAccount = JSON.parse(import.meta.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize the Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  });
}

// Export the initialized admin object as default
export default admin;
