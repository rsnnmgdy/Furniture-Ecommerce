const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Total counts
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Revenue calculations
    const completedOrders = await Order.find({ 
      status: { $in: ['Delivered', 'Completed'] } 
    });
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(10);

    // Low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 10 }, isActive: true })
      .sort('stock')
      .limit(10);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today },
    });

    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalReviews,
        totalRevenue: totalRevenue.toFixed(2),
        todayOrders,
        todayRevenue: todayRevenue[0]?.total?.toFixed(2) || '0.00',
      },
      recentOrders,
      lowStockProducts,
      ordersByStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get sales data (Quiz 2 requirement - 15pts)
// @route   GET /api/admin/sales
// @access  Private/Admin
exports.getSalesData = async (req, res) => {
  try {
    const { startDate, endDate, year = new Date().getFullYear() } = req.query;

    let matchQuery = {
      status: { $in: ['Delivered', 'Completed'] },
    };

    // Date range filter (Quiz 2 - 15pts)
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      // Default to current year (Quiz 2 - 10pts - all 12 months)
      matchQuery.createdAt = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    // Monthly sales aggregation
    const monthlySales = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalSales: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Create array for all 12 months
    const allMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const salesByMonth = allMonths.map((month, index) => {
      const data = monthlySales.find((item) => item._id === index + 1);
      return {
        month,
        monthNumber: index + 1,
        totalSales: data?.totalSales || 0,
        orderCount: data?.orderCount || 0,
      };
    });

    // Category sales
    const categorySales = await Order.aggregate([
      { $match: matchQuery },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          totalSales: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          itemsSold: { $sum: '$orderItems.quantity' },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    res.json({
      success: true,
      year: Number(year),
      salesByMonth,
      categorySales,
      totalSales: salesByMonth.reduce((sum, month) => sum + month.totalSales, 0),
      totalOrders: salesByMonth.reduce((sum, month) => sum + month.orderCount, 0),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User role updated',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
exports.blockUnblockUser = async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: isBlocked ? 'User blocked successfully' : 'User unblocked successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reset user password
// @route   PUT /api/admin/users/:id/password
// @access  Private/Admin
exports.resetUserPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.password = password;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user orders
// @route   GET /api/admin/users/:id/orders
// @access  Private/Admin
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id })
      .populate('user', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all reviews for admin moderation (MP3 - 5pts)
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, rating, product, search } = req.query;

    const query = {};

    if (rating && rating !== '0') {
      query.rating = Number(rating);
    }

    if (product) {
      query.product = product;
    }

    if (search) {
      query.$or = [
        { comment: { $regex: search, $options: 'i' } },
      ];
    }

    const reviews = await Review.find(query)
      .populate('user', 'name email photo')
      .populate('product', 'name')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
