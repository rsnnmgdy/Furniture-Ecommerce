import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithPopup,
  signOut 
} from 'firebase/auth';

// Your Firebase configuration - MATCHES BACKEND SERVICE ACCOUNT
const firebaseConfig = {
  apiKey: "AIzaSyDHKaLL4jsJOXW-IRRruCBKXjyLZftwci0",
  authDomain: "furniture-ecommerce-58c19.firebaseapp.com",
  projectId: "furniture-ecommerce-58c19",
  storageBucket: "furniture-ecommerce-58c19.firebasestorage.app",
  messagingSenderId: "704464963020",
  appId: "1:704464963020:web:3cc5d7d4b53a447ed8c969",
  measurementId: "G-KFR1SQ67ZV"
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
