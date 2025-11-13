const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for products
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'furniture/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' },
      { quality: 'auto' }
    ],
  },
});

// Configure Cloudinary storage for user profiles
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

// Create multer instances
const uploadProductImages = multer({ 
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadUserPhoto = multer({ 
  storage: userStorage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Image deleted: ${publicId}`);
  } catch (error) {
    console.error(`❌ Error deleting image: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadProductImages,
  uploadUserPhoto,
  deleteImage,
};
