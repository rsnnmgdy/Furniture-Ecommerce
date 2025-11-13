# Firebase Gmail & Facebook Login Fix - Complete Guide

## 🔴 Problem Diagnosed

The Firebase login was failing with **401 (Unauthorized)** error when trying to verify tokens:

```
POST http://localhost:5173/api/auth/verify-token 401 (Unauthorized)
Backend token verification failed AxiosError
```

## ✅ Root Causes & Solutions Applied

### **Issue 1: Wrong Firebase Import Path** ❌ → ✅
- **Problem**: AuthContext was importing from `'../firebase'` instead of `'../config/firebase'`
- **Solution**: Changed import to correct path: `import { auth } from '../config/firebase'`

### **Issue 2: Raw Axios Instead of Configured API Service** ❌ → ✅
- **Problem**: AuthContext was using `import axios from 'axios'` with hardcoded URLs
- **Solution**: Changed to use configured `api` service that:
  - Uses correct baseURL: `http://localhost:5000/api`
  - Has request/response interceptors
  - Properly handles token management

### **Issue 3: No Token Storage** ❌ → ✅
- **Problem**: Firebase token was never stored, causing subsequent requests to fail
- **Solution**: Now storing Firebase token in localStorage:
  ```javascript
  localStorage.setItem('firebaseToken', token);
  ```

### **Issue 4: Incomplete Error Logging** ❌ → ✅
- **Problem**: Backend middleware didn't log Firebase verification failures
- **Solution**: Added comprehensive error logging to firebaseAuthMiddleware:
  - Firebase verification errors logged with error code
  - User creation/update operations logged
  - Detailed error messages for debugging

### **Issue 5: Missing Photo URL Handling** ❌ → ✅
- **Problem**: Firebase photo URLs weren't being stored properly
- **Solution**: Added fallback default photo URL in middleware:
  ```javascript
  photo: {
    url: picture || 'https://res.cloudinary.com/demo/image/upload/avatar-default.png'
  }
  ```

## 📝 Changes Made

### Frontend Changes

#### **1. `src/context/AuthContext.jsx`** (155 lines)
```javascript
// BEFORE
import { auth } from '../firebase';
import axios from 'axios';

// AFTER
import { auth } from '../config/firebase';
import api from '../services/api';
```

**Key Updates:**
- Fixed Firebase import path
- Changed from axios to api service
- Added localStorage token storage:
  - `localStorage.setItem('firebaseToken', token)` - Store Firebase ID token
  - `localStorage.setItem('token', response.token)` - Store backend JWT if provided
- Added comprehensive error logging with error details
- Added finally block to ensure loading state is set

#### **2. `src/services/api.js`** (47 lines)
```javascript
// Request interceptor now prioritizes Firebase token
let token = localStorage.getItem('firebaseToken');
if (!token) {
  token = localStorage.getItem('token');
}
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

**Key Updates:**
- Try Firebase token first (for /auth routes)
- Fall back to JWT token if Firebase token not available
- Clear both tokens on 401 error
- Better error messages

### Backend Changes

#### **3. `middleware/firebaseAuthMiddleware.js`** (98 lines)
**Key Updates:**
- Better token extraction and validation
- Detailed Firebase error logging with error code
- Handles missing email validation
- Prevents duplicate user creation (handles 11000 error)
- Updates existing users with firebaseUid if missing
- Logs user creation/update operations
- Returns user in all success paths

## 🧪 Testing the Fix

### Test 1: Gmail Login
1. Open app at `http://localhost:5173`
2. Click "Sign in with Google"
3. Select your Gmail account
4. Expected: ✅ User logged in, redirected to home page
5. Check: Browser console should show no 401 errors
6. Check: localStorage should have `firebaseToken` and user info

### Test 2: Facebook Login
1. Click "Sign in with Facebook"
2. Authenticate with Facebook account
3. Expected: ✅ User logged in, redirected to home page
4. Check: Browser console should show no 401 errors
5. Check: localStorage should have `firebaseToken` and user info

### Test 3: Check Backend Logs
While testing, check backend terminal for logs like:
```
✅ Firebase auth check passed for user: user@gmail.com (ObjectId)
📝 Creating new user from Firebase: user@facebook.com
✅ New user created: ObjectId
```

### Test 4: Verify User Creation
1. Log in with Gmail
2. Open MongoDB or database tool
3. Check Users collection
4. Expected: New user with:
   - email: your@gmail.com
   - firebaseUid: populated
   - role: 'user'
   - isVerified: true

### Test 5: User Roles & Permissions
1. Test that logged-in user can access protected routes
2. Check that admin functionality works if user is admin
3. Verify cart/order operations work correctly

## 🚀 How It Works Now

### Authentication Flow (Gmail/Facebook)

```
1. User clicks "Sign in with Google/Facebook"
   ↓
2. Firebase popup opens
   ↓
3. User authenticates with Google/Facebook
   ↓
4. Firebase returns ID token to frontend
   ↓
5. onAuthStateChanged listener triggers with firebaseUser
   ↓
6. Frontend extracts ID token: await firebaseUser.getIdToken()
   ↓
7. Frontend stores in localStorage: firebaseToken
   ↓
8. Frontend calls POST /api/auth/verify-token with Bearer token
   ↓
9. Backend middleware (firebaseAuthMiddleware) receives token
   ↓
10. Backend verifies token with Firebase Admin SDK
    ↓
11. Backend finds or creates user in MongoDB
    ↓
12. Backend returns user object with role
    ↓
13. Frontend sets user in AuthContext
    ↓
14. User is now authenticated and can access protected routes
```

### Token Management

**Tokens Stored in localStorage:**
- `firebaseToken` - Firebase ID Token (sent to /auth routes)
- `token` - Backend JWT (if generated, sent to protected routes)
- `user` - User object (for display)

**Interceptor Logic:**
- Request: Adds bearer token (Firebase first, fallback to JWT)
- Response: Clears tokens on 401, redirects to login

## 🔍 Debugging Tips

### If login still fails:

1. **Check Firebase initialization:**
   ```javascript
   // In browser console
   console.log(firebase.auth().currentUser)
   ```

2. **Check stored tokens:**
   ```javascript
   // In browser console
   console.log(localStorage.getItem('firebaseToken'))
   console.log(localStorage.getItem('token'))
   ```

3. **Check backend logs:**
   ```bash
   # Watch backend terminal for Firebase verification errors
   # Look for error code like: auth/id-token-revoked, auth/id-token-expired
   ```

4. **Check network requests:**
   - Open DevTools → Network tab
   - Look for POST to `/api/auth/verify-token`
   - Check Response headers and body
   - Verify Authorization header contains Bearer token

5. **Check MongoDB:**
   ```bash
   # Verify user was created/updated
   db.users.find({ email: "your@email.com" })
   ```

## ⚠️ Common Issues & Solutions

### Issue: "Token verification failed"
- Check Firebase credentials in `frontend/src/config/firebase.js`
- Verify Firebase project ID is correct
- Check backend has serviceAccountKey.json in `backend/config/`

### Issue: "User not found after login"
- Check MongoDB is running
- Verify connection string in `.env`
- Check User collection exists

### Issue: "Photo not showing for social login"
- `firebaseAuthMiddleware` uses Firebase photo URL
- Falls back to default if no photo
- Both should work now

### Issue: "Role is not being set"
- Verify User model has role field with default: 'user'
- Check firebaseAuthMiddleware sets role: 'user' for new users

## 📋 Rollback Plan

If issues persist, revert changes:
```bash
git revert HEAD~1  # Revert these changes
```

## ✨ Files Modified Summary

| File | Changes | Type |
|------|---------|------|
| `frontend/src/context/AuthContext.jsx` | Fixed imports, added token storage, better error handling | Frontend |
| `frontend/src/services/api.js` | Added Firebase token support to interceptor | Frontend |
| `backend/middleware/firebaseAuthMiddleware.js` | Enhanced error logging, duplicate prevention | Backend |

## ✅ Verification Checklist

- [ ] Gmail login works without 401 error
- [ ] Facebook login works without 401 error  
- [ ] firebaseToken stored in localStorage
- [ ] User created in MongoDB with correct fields
- [ ] User role is 'user' by default
- [ ] Backend logs show successful authentication
- [ ] Protected routes work for logged-in users
- [ ] Logout clears tokens properly
- [ ] Re-login works correctly
- [ ] Admin functionality works if applicable

## 🎯 Next Steps

1. **Test the login flow** with both Gmail and Facebook
2. **Check browser console** for any errors
3. **Check backend logs** for verification success
4. **Verify MongoDB** user was created/updated
5. **Test protected routes** (cart, orders, profile)
6. **Test logout and re-login**

---

**Questions? Check:**
- Browser Console for error messages
- Backend Terminal for verification logs
- MongoDB for user data
- Network tab in DevTools for API requests
