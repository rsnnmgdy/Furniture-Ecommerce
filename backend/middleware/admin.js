const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSalesData,
  getAllUsers,
  updateUserRole,
  getAllReviews,
  getUserOrders,
  blockUnblockUser,
  resetUserPassword,
  deleteUser, // NEW IMPORT
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin authorization
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesData);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/block', blockUnblockUser);
router.put('/users/:id/password', resetUserPassword);
router.get('/users/:id/orders', getUserOrders);
router.get('/reviews', getAllReviews);

// NEW: Delete User route
router.delete('/users/:id', deleteUser);

module.exports = router;