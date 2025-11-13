const express = require('express');
const router = express.Router();

// --- 1. Import your controllers ---
// We remove 'register', 'login', and 'firebaseLogin' as they are no longer used.
const {
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

// --- 2. Import your middleware ---
const { protect } = require('../middleware/auth');
const { uploadUserPhoto } = require('../middleware/upload');
const {
  // We remove 'registerValidation' and 'loginValidation'
  profileUpdateValidation,
  validate,
} = require('../middleware/validation');

// --- 3. Import the NEW Firebase middleware ---
const { firebaseAuthCheck } = require('../middleware/firebaseAuthMiddleware');


// === 4. NEW FIREBASE-ENABLED ROUTES ===
// These match what your AuthContext is calling

// @route   POST /api/auth/verify-token
// @desc    Verify Firebase token (from any login) and get MongoDB user
// @access  Private (requires Firebase token)
router.post('/verify-token', firebaseAuthCheck, (req, res) => {
  // The middleware did all the work and attached `req.user`
  res.status(200).json({ user: req.user });
});

// @route   POST /api/auth/register
// @desc    Register new email/pass user in MongoDB *after* Firebase creation
// @access  Private (requires Firebase token)
router.post('/register', firebaseAuthCheck, (req, res) => {
  // The middleware found/created the user
  res.status(201).json({ user: req.user });
});


// === 5. YOUR EXISTING ROUTES (Unchanged) ===

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes (these use your *original* 'protect' middleware)
router.get('/profile', protect, getProfile);
router.put(
  '/profile',
  protect,
  uploadUserPhoto.single('photo'),
  profileUpdateValidation,
  validate,
  updateProfile
);

// Your temporary admin route
router.post('/create-admin', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await require('../models/User').findOne({ username });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.role = 'admin';
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'User is now admin',
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;