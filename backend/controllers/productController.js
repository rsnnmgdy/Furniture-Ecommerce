const Product = require('../models/Product');
const { deleteImage } = require('../config/cloudinary');

// @desc    Get all products with filters (Quiz 1 requirement)
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      minRating,
      material,
      color,
      search,
      sort = '-createdAt',
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Category filter (Quiz 1 - 5pts)
    if (category) {
      query.category = category;
    }

    // Price filter (Quiz 1 - 5pts)
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter (Quiz 1 - 5pts)
    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // Material filter
    if (material) {
      query.material = { $regex: material, $options: 'i' };
    }

    // Color filter
    if (color) {
      query.color = { $in: [color] };
    }

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination (Quiz 3 - 10pts)
    const skip = (page - 1) * limit;

    // Execute query
    const products = await Product.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip(skip)
      .select('-__v');

    // Get total count
    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total: total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create product (MP1 - 12pts with multiple images)
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    // Get product data from request body
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      material: req.body.material,
      stock: req.body.stock,
    };

    // Optional fields
    if (req.body.salePrice) productData.salePrice = req.body.salePrice;
    if (req.body.subcategory) productData.subcategory = req.body.subcategory;
    if (req.body.sku) productData.sku = req.body.sku;
    if (req.body.tags) productData.tags = JSON.parse(req.body.tags);
    
    // Dimensions
    if (req.body.dimensions) {
      productData.dimensions = JSON.parse(req.body.dimensions);
    }
    
    // Colors
    if (req.body.color) {
      productData.color = Array.isArray(req.body.color) 
        ? req.body.color 
        : JSON.parse(req.body.color);
    }

    // Weight
    if (req.body.weight) {
      productData.weight = JSON.parse(req.body.weight);
    }

    // Assembly
    if (req.body.assembly) {
      productData.assembly = JSON.parse(req.body.assembly);
    }

    // Warranty
    if (req.body.warranty) {
      productData.warranty = JSON.parse(req.body.warranty);
    }

    // Handle multiple image uploads (MP1 requirement - multiple photos)
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename,
        isPrimary: index === 0, // First image is primary
      }));
    }

    // Create product
    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    // Delete uploaded images if product creation fails
    if (req.files) {
      req.files.forEach(file => {
        deleteImage(file.filename);
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update product (MP1 - 15pts)
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Update fields
    const updateFields = [
      'name', 'description', 'price', 'salePrice', 'category', 
      'subcategory', 'material', 'stock', 'sku', 'isActive', 'isFeatured'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // Update complex fields
    if (req.body.dimensions) {
      product.dimensions = JSON.parse(req.body.dimensions);
    }
    if (req.body.color) {
      product.color = Array.isArray(req.body.color) 
        ? req.body.color 
        : JSON.parse(req.body.color);
    }
    if (req.body.weight) {
      product.weight = JSON.parse(req.body.weight);
    }
    if (req.body.tags) {
      product.tags = JSON.parse(req.body.tags);
    }
    if (req.body.assembly) {
      product.assembly = JSON.parse(req.body.assembly);
    }
    if (req.body.warranty) {
      product.warranty = JSON.parse(req.body.warranty);
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename,
        isPrimary: product.images.length === 0 && index === 0,
      }));
      product.images = [...product.images, ...newImages];
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private/Admin
exports.deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const imageIndex = product.images.findIndex(
      img => img._id.toString() === req.params.imageId
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    // Delete from Cloudinary
    await deleteImage(product.images[imageIndex].publicId);

    // Remove from array
    product.images.splice(imageIndex, 1);

    // If deleted image was primary, make first image primary
    if (product.images.length > 0 && !product.images.some(img => img.isPrimary)) {
      product.images[0].isPrimary = true;
    }

    await product.save();

    res.json({
      success: true,
      message: 'Image deleted successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Delete all images from Cloudinary
    for (const image of product.images) {
      await deleteImage(image.publicId);
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Bulk delete products (MP1 - 20pts)
// @route   POST /api/products/bulk-delete
// @access  Private/Admin
exports.bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of product IDs',
      });
    }

    // Get all products to delete their images
    const products = await Product.find({ _id: { $in: productIds } });

    // Delete all images from Cloudinary
    for (const product of products) {
      for (const image of product.images) {
        await deleteImage(image.publicId);
      }
    }

    // Delete all products
    const result = await Product.deleteMany({ _id: { $in: productIds } });

    res.json({
      success: true,
      message: `${result.deletedCount} products deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .limit(8)
      .sort('-averageRating');

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
