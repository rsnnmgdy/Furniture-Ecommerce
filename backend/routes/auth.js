const authController = require('../controllers/authController');

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  firebaseLogin,
  getProfile,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadUserPhoto } = require('../middleware/upload');
const {
  registerValidation,
  loginValidation,
  profileUpdateValidation,
  validate,
} = require('../middleware/validation');

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/firebase-login', firebaseLogin);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put(
  '/profile',
  protect,
  uploadUserPhoto.single('photo'),
  profileUpdateValidation,
  validate,
  updateProfile
);

// ADD THIS TEMPORARY ROUTE AT THE BOTTOM (before module.exports)
// ⚠️ REMOVE THIS IN PRODUCTION!
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
