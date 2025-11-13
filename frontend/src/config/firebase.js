import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup,
  signOut 
} from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsrUFRSZueFEF-pMLj1fLqovrXFC4SJxo",
  authDomain: "ecommerce-1b241.firebaseapp.com",
  projectId: "ecommerce-1b241",
  storageBucket: "ecommerce-1b241.firebasestorage.app",
  messagingSenderId: "787626583007",
  appId: "1:787626583007:web:b5c681993974cb29e6da6a",
  measurementId: "G-2NVBMDV7YV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Providers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const facebookProvider = new FacebookAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const token = await user.getIdToken();
    
    return { 
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }, 
      token 
    };
  } catch (error) {
    console.error('Google sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

// Sign in with Facebook
export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;
    const token = await user.getIdToken();
    
    return { 
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }, 
      token 
    };
  } catch (error) {
    console.error('Facebook sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with Facebook');
  }
};

// Sign out
export const firebaseSignOut = () => signOut(auth);

export { auth };
export default app;
