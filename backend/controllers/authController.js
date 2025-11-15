const User = require('../models/User');
const admin = require('firebase-admin'); 
const asyncHandler = require('express-async-handler'); 
const { processUploadedFiles, deleteImage } = require('../config/cloudinary'); 
const { sendEmail } = require('../utils/email'); // NEW IMPORT
const crypto = require('crypto'); // NEW IMPORT

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

  // Create user (isVerified defaults to false)
  const user = await User.create({
    name,
    email,
    username,
    password,
  });

  // --- START EMAIL VERIFICATION LOGIC ---
  const verificationToken = user.getVerificationToken();
  // Save the token hash to the user document without re-running validation
  await user.save({ validateBeforeSave: false }); 

  // Construct verification link
  // NOTE: req.get('host') is usually localhost:5000 in dev
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Account Verification Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
          <h2 style="color: #6B5344;">Verify Your Email Address</h2>
          <p>Hi ${user.name},</p>
          <p>Thank you for registering! Please confirm your email address by clicking the link below:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" style="background-color: #6B5344; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Account</a>
          </p>
          <p>This link is valid for 24 hours.</p>
          <p style="font-size: 12px; color: #999;">If you did not create this account, please ignore this email.</p>
        </div>
      `,
    });

    // Success response should only confirm email sent, no token or user data
    res.status(200).json({
      success: true,
      message: `User created. Verification email sent to ${user.email}. Please check your inbox.`,
    });

  } catch (err) {
    console.error('❌ Email could not be sent:', err);

    // If email sending fails, clear token fields and return 500
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      success: false,
      message: 'User registered, but email service failed. Please contact support.',
    });
  }
  // --- END EMAIL VERIFICATION LOGIC ---
});

// @desc    Verify email address after user clicks the link
// @route   GET /api/auth/verify/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    // Hash the token from the URL to compare with the hash in the database
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        verificationToken: hashedToken,
    });

    if (!user) {
        res.status(400);
        return res.send('<div style="text-align: center; padding: 50px;"><h1>❌ Verification Failed</h1><p>Invalid or expired verification link.</p></div>');
    }

    // Set user as verified, clear the token fields
    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    // Redirect user to the login page with a success message flag
    const loginUrl = process.env.CLIENT_URL ? `${process.env.CLIENT_URL}/login?verified=true` : `/login?verified=true`;
    
    return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Verification Success</title>
            <meta http-equiv="refresh" content="5;url=${loginUrl}">
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
                .container { max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
                h1 { color: #2E7D32; }
                p { color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>✅ Email Verified Successfully!</h1>
                <p>Your account is now active. You will be redirected to the login page shortly.</p>
                <p><a href="${loginUrl}">Click here to log in immediately.</a></p>
            </div>
        </body>
        </html>
    `);
});

// --- (Original authController functions follow, edited for completeness) ---

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
  
  // NEW CHECK: Prevent login if not verified
  if (!user.isVerified) {
    res.status(401);
    throw new Error('Account not verified. Please check your email for the verification link.');
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
    // NEW CHECK: If user is logging in via Firebase, they are considered verified
    if (!user.isVerified) {
        user.isVerified = true;
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

  // --- START FIX FOR PHOTO UPLOAD ---
  if (req.file) {
    // 1. Delete old photo from Cloudinary if it exists
    if (user.photo && user.photo.publicId) {
      await deleteImage(user.photo.publicId); 
    }

    // 2. Process the new file buffer (Multer saves to req.file.buffer)
    // We target the 'furniture/users' folder for avatars
    const uploaded = await processUploadedFiles([req.file], 'furniture/users');
    
    // 3. Save the new Cloudinary URL/ID to the user model
    if (uploaded.length > 0) {
        user.photo = {
            url: uploaded[0].url,
            publicId: uploaded[0].publicId,
        };
    }
  }
  // --- END FIX ---

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