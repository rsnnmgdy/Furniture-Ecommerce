const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin'); // Import firebase-admin
const connectDB = require('./config/db');
// const { initializeFirebase } = require('./config/firebase'); // <-- 1. DELETED THIS LINE
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

// === 2. INITIALIZE FIREBASE ADMIN *ONCE* ===
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // This line replaces the "\n" string with actual newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  // Check if it's already initialized (for nodemon restarts)
  if (error.code !== 'app/duplicate-app') {
    console.error('CRITICAL: Error initializing Firebase Admin SDK:', error);
  }
}
// ==========================================

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// initializeFirebase(); // <-- 3. DELETED THIS LINE

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Custom middleware to skip JSON parsing for multipart requests
app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }
  express.json()(req, res, next);
});

app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/admin', require('./routes/admin'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Furniture Store API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend URL: ${process.env.CLIENT_URL}\n`);
});