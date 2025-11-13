const admin = require('firebase-admin');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const firebaseAuthCheck = asyncHandler(async (req, res, next) => {
  try {
    // Extract token from Authorization header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token provided' 
      });
    }

    // 1. Verify token with Firebase Admin SDK
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (firebaseError) {
      console.error('❌ Firebase token verification failed:', {
        errorCode: firebaseError.code,
        errorMessage: firebaseError.message,
        token: token.substring(0, 20) + '...' // Log first 20 chars only
      });
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired Firebase token',
        code: firebaseError.code
      });
    }

    const { email, name, uid, picture } = decodedToken;

    if (!email) {
      console.error('❌ Firebase token missing email');
      return res.status(401).json({ 
        success: false, 
        message: 'Token missing email information' 
      });
    }

    // 2. Find user in MongoDB by email
    let user = await User.findOne({ email });

    // 3. If user doesn't exist (first-time login), create them
    if (!user) {
      console.log(`📝 Creating new user from Firebase: ${email}`);
      
      try {
        // Generate unique username from email
        const baseUsername = email.split('@')[0];
        let username = baseUsername;
        let counter = 1;
        
        // Check if username already exists
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter}`;
          counter++;
        }
        
        user = await User.create({
          name: name || 'User',
          email: email,
          username: username, // Auto-generated unique username
          firebaseUid: uid,
          photo: {
            url: picture || 'https://res.cloudinary.com/demo/image/upload/avatar-default.png'
          },
          isVerified: true, // Firebase users are pre-verified
          role: 'user' // Default role
        });
        
        console.log(`✅ New user created: ${user._id} (username: ${username})`);
      } catch (createError) {
        console.error('❌ Error creating user:', createError.message);
        
        // If email already exists, fetch it again
        if (createError.code === 11000 && createError.keyValue?.email) {
          user = await User.findOne({ email });
          if (user) {
            console.log(`📝 User already exists, continuing: ${user._id}`);
          } else {
            return res.status(500).json({ 
              success: false, 
              message: 'Error handling user account' 
            });
          }
        } else {
          throw createError;
        }
      }
    } else {
      // Update firebaseUid if not already set
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        await user.save();
        console.log(`📝 Updated existing user with firebaseUid: ${user._id}`);
      }
    }

    // 4. Attach MongoDB user to request (includes role, other fields)
    req.user = user;
    req.firebaseUid = uid;
    
    console.log(`✅ Firebase auth check passed for user: ${user.email} (${user._id})`);
    next();

  } catch (error) {
    console.error('❌ Unexpected error in firebaseAuthCheck:', {
      message: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication server error' 
    });
  }
});

module.exports = { firebaseAuthCheck };