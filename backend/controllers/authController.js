const User = require('../models/User');
const admin = require('firebase-admin'); // Import the initialized admin instance
const asyncHandler = require('express-async-handler'); // Use asyncHandler for cleaner code

// @desc    Register user (Your original JWT system)
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, username, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    res.status(400);
    throw new Error(existingUser.email === email ? 'Email already registered' : 'Username already taken');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    username,
    password,
  });

  // Generate token
  const token = user.generateToken();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      photo: user.photo,
    },
  });
});

// @desc    Login user (Your original JWT system)
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ username }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = user.generateToken();

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      photo: user.photo,
    },
  });
});

// @desc    Firebase login (Google/Facebook)
// @route   POST /api/auth/firebase-login
// @access  Public
exports.firebaseLogin = asyncHandler(async (req, res) => {
  const { firebaseToken } = req.body;

  if (!firebaseToken) {
    res.status(400);
    throw new Error('Firebase token is required');
  }

  // 1. Verify Firebase token using the initialized admin SDK
  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(firebaseToken);
  } catch (error) {
    res.status(401);
    throw new Error('Invalid or expired Firebase token');
  }
  
  const { uid, email, name, picture } = decodedToken;

  if (!email) {
    res.status(400);
    throw new Error('Firebase token is missing email');
  }

  // 2. Find user in MongoDB by email
  let user = await User.findOne({ email: email });

  // 3. If user doesn't exist (first-time login), create them
  if (!user) {
    // Auto-generate a unique username
    const baseUsername = email.split('@')[0];
    let username = baseUsername;
    let counter = 1;
    while (await User.findOne({ username })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }
    
    user = await User.create({
      name: name || 'User',
      email: email,
      username: username,
      firebaseUid: uid,
      photo: {
        url: picture || 'https://res.cloudinary.com/demo/image/upload/avatar-default.png',
      },
      isVerified: true, // Firebase users are pre-verified
    });
  } else {
    // If user exists but has no Firebase UID, link them
    if (!user.firebaseUid) {
      user.firebaseUid = uid;
      await user.save();
    }
  }

  // 4. Generate *your* JWT token for the user
  const token = user.generateToken();

  res.json({
    success: true,
    message: 'Firebase login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      photo: user.photo,
    },
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      phone: user.phone,
      address: user.address,
      role: user.role,
      photo: user.photo,
      createdAt: user.createdAt,
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update fields
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;
  
  if (req.body.address) {
    user.address = typeof req.body.address === 'string' 
      ? JSON.parse(req.body.address) 
      : req.body.address;
  }

  // Update photo if uploaded
  if (req.file) {
    // You should add logic here to delete the old photo from Cloudinary
    user.photo = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      phone: updatedUser.phone,
      address: updatedUser.address,
      photo: updatedUser.photo,
      role: updatedUser.role,
    },
  });
});

// Add your other auth functions (forgotPassword, resetPassword) here
exports.forgotPassword = asyncHandler(async (req, res) => {
  // Your logic from authController
  res.status(500).json({ success: false, message: 'Forgot Password not implemented' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  // Your logic from authController
  res.status(500).json({ success: false, message: 'Reset Password not implemented' });
});