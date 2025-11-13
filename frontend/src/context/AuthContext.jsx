import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../config/firebase'; 
import Loading from '../components/common/Loading';
import api from '../services/api'; 

const AuthContext = createContext();
AuthContext.displayName = 'AuthContext';

export const useAuth = () => useContext(AuthContext);

function AuthProviderComponent({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    let isProcessing = false; // Prevent concurrent calls

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        // If already processing, skip to prevent duplicate calls
        if (isProcessing) {
          return;
        }

        if (firebaseUser) {
          // Check if user is already set in state (avoid re-verification)
          if (user && user.firebaseUid === firebaseUser.uid) {
            console.log(`⏭️ User already verified: ${firebaseUser.uid}`);
            setLoading(false);
            return;
          }

          isProcessing = true;

          // User is logged in with Firebase - get ID token
          const token = await firebaseUser.getIdToken();
          
          // Store Firebase token in localStorage for API requests
          localStorage.setItem('firebaseToken', token);
          
          // Verify token with backend and get MongoDB user with role
          try {
            const response = await api.post('/auth/verify-token', {}, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (isMounted) {
              setUser(response.user); // Set user from backend (includes role)
              
              // Also store backend JWT if provided
              if (response.token) {
                localStorage.setItem('token', response.token);
              }
              console.log(`✅ User verified and set: ${response.user.email}`);
            }
          } catch (backendError) {
            if (isMounted) {
              console.error("Backend token verification failed:", backendError);
              await signOut(auth);
              setUser(null);
              localStorage.removeItem('firebaseToken');
              localStorage.removeItem('token');
            }
          } finally {
            isProcessing = false;
          }
        } else {
          // User is logged out
          if (isMounted) {
            setUser(null);
            localStorage.removeItem('firebaseToken');
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Auth state change error:", error);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Register with Email/Password
  const register = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      const token = await userCredential.user.getIdToken();
      
      // Store Firebase token in localStorage
      localStorage.setItem('firebaseToken', token);
      
      // Register in backend (firebaseAuthMiddleware will handle user creation/update)
      const response = await api.post('/auth/register', 
        {}, // Body is empty - middleware extracts from token
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUser(response.user);
      
      // Store backend JWT if provided
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Sign out from Firebase if backend registration fails
      await signOut(auth);
      throw error;
    }
  };

  // Login with Email/Password
  const login = async (email, password) => {
    // Just sign in. onAuthStateChanged will handle the rest.
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google or Facebook
  const handlePopupSignIn = async (provider) => {
    // Just sign in. onAuthStateChanged will handle the rest.
    await signInWithPopup(auth, provider);
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return handlePopupSignIn(provider);
  };

  const signInWithFacebook = () => {
    const provider = new FacebookAuthProvider();
    return handlePopupSignIn(provider);
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const isAuthenticated = () => !!user;
  const isAdmin = () => user?.role === 'admin';

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    signInWithGoogle,
    signInWithFacebook
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProviderComponent.displayName = 'AuthProvider';
export const AuthProvider = AuthProviderComponent;