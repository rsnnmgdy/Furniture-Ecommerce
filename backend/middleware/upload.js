const multer = require('multer');
const CloudinaryStorage = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary').cloudinary;

// Product images storage
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'furniture/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:good' }
    ],
  },
});

// User profile photo storage
const userStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'furniture/users',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'face' },
      { quality: 'auto' }
    ],
  },
});

// Create upload instances
const uploadProductImages = multer({
  storage: productStorage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // Max 10 images
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const uploadUserPhoto = multer({
  storage: userStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

module.exports = {
  uploadProductImages,
  uploadUserPhoto,
};
