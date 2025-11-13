const cloudinaryLib = require('cloudinary');
const CloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');
const DatauriParser = require('datauri/parser');
const path = require('path');

// Configure Cloudinary using the full library
cloudinaryLib.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify Cloudinary is configured
if (!cloudinaryLib.v2.config().cloud_name) {
  console.error('❌ CRITICAL: Cloudinary is not properly configured. Check environment variables.');
} else {
  console.log(`✅ Cloudinary configured for: ${cloudinaryLib.v2.config().cloud_name}`);
}

// Use the full library object for multer-storage-cloudinary (it accesses .v2 internally)
const cloudinary = cloudinaryLib;
// Ensure .v2 is accessible for the storage adapter
cloudinary.v2 = cloudinaryLib.v2;

// File filter for images
const imageFileFilter = (req, file, cb) => {
  console.log(`📥 Image file filter - Name: ${file.originalname}, Type: ${file.mimetype}, Size: ${file.size}`);
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  
  if (mimetype) {
    console.log(`✅ File accepted: ${file.originalname}`);
    return cb(null, true);
  } else {
    console.log(`❌ File rejected: ${file.originalname} (${file.mimetype})`);
    cb(new Error('Only image files are allowed!'));
  }
};

const userPhotoFileFilter = (req, file, cb) => {
  console.log(`📥 Photo file filter - Name: ${file.originalname}, Type: ${file.mimetype}, Size: ${file.size}`);
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  
  if (mimetype) {
    console.log(`✅ Photo accepted: ${file.originalname}`);
    return cb(null, true);
  } else {
    console.log(`❌ Photo rejected: ${file.originalname} (${file.mimetype})`);
    cb(new Error('Only JPG and PNG files are allowed!'));
  }
};

// Use memory storage instead of Cloudinary storage adapter for better control
const memoryStorage = multer.memoryStorage();

// Create multer instances with file filters
const uploadProductImages = multer({ 
  storage: memoryStorage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // Max 10 images
  },
  fileFilter: (req, file, cb) => {
    console.log(`📁 File received: ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
    imageFileFilter(req, file, cb);
  }
});

const uploadUserPhoto = multer({ 
  storage: memoryStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: userPhotoFileFilter
});

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      console.warn('⚠️ Warning: No public ID provided for deletion');
      return;
    }
    await cloudinaryLib.v2.uploader.destroy(publicId);
    console.log(`✅ Image deleted: ${publicId}`);
  } catch (error) {
    console.error(`❌ Error deleting image ${publicId}: ${error.message}`);
  }
};

// Helper: process files from different multer strategies
const parser = new DatauriParser();

const processUploadedFiles = async (files = [], folder = 'furniture/products') => {
  if (!files || files.length === 0) return [];
  const results = [];
  for (const file of files) {
    try {
      if (file.path && file.filename) {
        results.push({ url: file.path, publicId: file.filename });
        continue;
      }
      if (file.buffer) {
        const file64 = parser.format(path.extname(file.originalname).toString(), file.buffer).content;
        const res = await cloudinaryLib.v2.uploader.upload(file64, { folder, resource_type: 'auto' });
        results.push({ url: res.secure_url, publicId: res.public_id });
        continue;
      }
      console.warn('⚠️ processUploadedFiles: unknown file shape', Object.keys(file));
    } catch (err) {
      console.error('❌ processUploadedFiles error for file', file.originalname || '<unknown>', err.message);
      throw err;
    }
  }
  return results;
};

module.exports = {
  cloudinary: cloudinaryLib.v2,
  uploadProductImages,
  uploadUserPhoto,
  deleteImage,
  processUploadedFiles,
};
