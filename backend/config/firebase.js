const admin = require('firebase-admin');

const initializeFirebase = () => {
  try {
    if (admin.apps.length > 0) return;
    // Use the local JSON service account file
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.log('⚠️  Firebase initialization skipped:', error.message);
  }
};

const verifyFirebaseToken = async (token) => {
  try {
    if (admin.apps.length === 0) throw new Error('Firebase Admin not initialized');
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    throw new Error('Invalid Firebase token');
  }
};

module.exports = {
  initializeFirebase,
  verifyFirebaseToken,
  admin,
};
