const multer = require('multer');
const { uploadProductImages: rawUploadProductImages, uploadUserPhoto: rawUploadUserPhoto } = require('../config/cloudinary');

// Wrapper to handle multer errors gracefully
const handleUploadError = (upload) => {
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('❌ Multer Error:', err.code, err.message);
        return res.status(400).json({
          success: false,
          message: `File upload error: ${err.message}`,
          code: err.code
        });
      } else if (err) {
        console.error('❌ Upload Error:', err.message);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      console.log('✅ Upload successful:', req.files?.length || 0, 'files');
      if (req.files && req.files.length > 0) {
        console.log('📸 Files details:', req.files.map(f => ({ 
          name: f.originalname, 
          size: f.size, 
          buffer: f.buffer ? 'yes' : 'no',
          path: f.path,
          filename: f.filename
        })));
      }
      next();
    });
  };
};

module.exports = {
  uploadProductImages: rawUploadProductImages,
  uploadUserPhoto: rawUploadUserPhoto,
  handleUploadError,
};
