const Product = require('../models/Product');
const { deleteImage, processUploadedFiles } = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');

exports.getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, category, minPrice, maxPrice, minRating, material, color, search, sort = '-createdAt' } = req.query;
  const query = { isActive: true };
  if (category) query.category = category;
  if (minPrice || maxPrice) { query.price = {}; if (minPrice) query.price.$gte = Number(minPrice); if (maxPrice) query.price.$lte = Number(maxPrice); }
  if (minRating) query.averageRating = { $gte: Number(minRating) };
  if (material) query.material = { $regex: material, $options: 'i' };
  if (color) query.color = { $in: [color] };
  if (search) query.$text = { $search: search };
  const skip = (page - 1) * limit;
  
  const products = await Product.find(query)
    .sort(sort)
    .limit(Number(limit))
    .skip(skip);

  const total = await Product.countDocuments(query);
  res.json({ success: true, count: products.length, total, totalPages: Math.ceil(total / limit), currentPage: Number(page), products });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, product });
});

exports.createProduct = asyncHandler(async (req, res) => {
  console.log('\n========== CREATE PRODUCT ==========');
  console.log('📁 Files:', req.files?.length || 0);
  if (req.files && req.files.length > 0) {
    console.log('📸 File Details:');
    req.files.forEach((f, i) => {
      // Diagnostic Log
      console.log(`  [${i}] ${f.originalname} - Buffer present: ${!!f.buffer} - Size: ${f.size} bytes`); 
    });
  }
  const productData = { name: req.body.name, description: req.body.description, price: req.body.price, category: req.body.category, material: req.body.material, stock: req.body.stock };
  if (req.body.salePrice) productData.salePrice = req.body.salePrice;
  if (req.body.subcategory) productData.subcategory = req.body.subcategory;
  if (req.body.sku) productData.sku = req.body.sku;
  if (req.body.tags) productData.tags = JSON.parse(req.body.tags);
  if (req.body.dimensions) productData.dimensions = JSON.parse(req.body.dimensions);
  if (req.body.color) productData.color = Array.isArray(req.body.color) ? req.body.color : JSON.parse(req.body.color);
  if (req.body.weight) productData.weight = JSON.parse(req.body.weight);
  if (req.body.assembly) productData.assembly = JSON.parse(req.body.assembly);
  if (req.body.warranty) productData.warranty = JSON.parse(req.body.warranty);
  
  // FIX: Process uploaded images and ensure the first one is marked primary
  if (req.files && req.files.length > 0) {
    const uploaded = await processUploadedFiles(req.files, 'furniture/products');
    // Ensure first uploaded image is set as primary
    productData.images = uploaded.map((img, index) => ({ 
      url: img.url, 
      publicId: img.publicId, 
      isPrimary: index === 0 
    }));
  }
  
  const product = await Product.create(productData);
  res.status(201).json({ success: true, message: 'Product created successfully', product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  
  // Handle images to delete
  if (req.body.imagesToDelete) {
    const publicIdsToDelete = JSON.parse(req.body.imagesToDelete);
    if (Array.isArray(publicIdsToDelete) && publicIdsToDelete.length > 0) {
      await Promise.all(publicIdsToDelete.map(publicId => deleteImage(publicId)));
      product.images = product.images.filter(img => !publicIdsToDelete.includes(img.publicId));
    }
  }
  
  // Handle new images to upload
  if (req.files && req.files.length > 0) {
    const newUploaded = await processUploadedFiles(req.files, 'furniture/products');
    const newImages = newUploaded.map(img => ({ url: img.url, publicId: img.publicId, isPrimary: false }));
    product.images.push(...newImages);
  }
  
  // FIX: Ensure there is always one primary image if the array is not empty
  if (product.images.length > 0 && !product.images.some(img => img.isPrimary)) {
      product.images[0].isPrimary = true;
  } else if (product.images.length === 0) {
      product.images = [];
  }
  
  // CRITICAL FIX: Manually mark images array as modified to ensure Mongoose saves changes
  if (req.files || req.body.imagesToDelete) {
      product.markModified('images');
  }

  const updateFields = ['name', 'description', 'price', 'salePrice', 'category', 'subcategory', 'material', 'stock', 'sku', 'isActive', 'isFeatured'];
  updateFields.forEach(field => { if (req.body[field] !== undefined) product[field] = req.body[field]; });
  
  if (req.body.dimensions) product.dimensions = JSON.parse(req.body.dimensions);
  if (req.body.color) product.color = Array.isArray(req.body.color) ? product.color : JSON.parse(req.body.color);
  if (req.body.weight) product.weight = JSON.parse(req.body.weight);
  if (req.body.tags) product.tags = JSON.parse(req.body.tags);
  if (req.body.assembly) product.assembly = JSON.parse(req.body.assembly);
  if (req.body.warranty) product.warranty = JSON.parse(req.body.warranty);
  
  const updatedProduct = await product.save();
  res.json({ success: true, message: 'Product updated successfully', product: updatedProduct });
});

exports.deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  const imageIndex = product.images.findIndex(img => img._id.toString() === req.params.imageId);
  if (imageIndex === -1) { res.status(404); throw new Error('Image not found'); }
  await deleteImage(product.images[imageIndex].publicId);
  product.images.splice(imageIndex, 1);
  
  // FIX: Re-evaluate primary image after deletion
  if (product.images.length > 0 && !product.images.some(img => img.isPrimary)) {
      product.images[0].isPrimary = true;
  }
  
  await product.save();
  res.json({ success: true, message: 'Image deleted successfully', product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  for (const image of product.images) { await deleteImage(image.publicId); }
  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted successfully' });
});

exports.bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { productIds } = req.body;
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) { res.status(400); throw new Error('Please provide an array of product IDs'); }
  const products = await Product.find({ _id: { $in: productIds } });
  for (const product of products) for (const image of product.images) await deleteImage(image.publicId);
  const result = await Product.deleteMany({ _id: { $in: productIds } });
  res.json({ success: true, message: `${result.deletedCount} products deleted successfully`, deletedCount: result.deletedCount });
});

exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true }).limit(8).sort('-averageRating');
  res.json({ success: true, count: products.length, products });
});