const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: 10,
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Living Room',
        'Bedroom',
        'Dining Room',
        'Office',
        'Outdoor',
        'Storage',
        'Decor',
        'Kitchen',
      ],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    
    // Furniture-specific fields
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: {
        type: String,
        enum: ['inches', 'cm', 'feet', 'meters'],
        default: 'inches',
      },
    },
    material: {
      type: String,
      required: [true, 'Material is required'],
      trim: true,
    },
    color: [
      {
        type: String,
        trim: true,
      },
    ],
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'lbs',
      },
    },
    
    // Images - Multiple upload support (MP1 requirement)
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    
    // Inventory
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: 0,
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    
    // Ratings (MP3 requirement)
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    
    // Additional info
    assembly: {
      required: {
        type: Boolean,
        default: false,
      },
      instructions: String,
    },
    warranty: {
      duration: String,
      details: String,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Index for filtering (Quiz 1 requirement)
productSchema.index({ category: 1, price: 1, averageRating: 1 });

// Calculate average rating
productSchema.methods.calculateAverageRating = async function () {
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    { $match: { product: this._id } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    this.averageRating = stats[0].averageRating;
    this.numReviews = stats[0].numReviews;
  } else {
    this.averageRating = 0;
    this.numReviews = 0;
  }

  await this.save();
};

module.exports = mongoose.model('Product', productSchema);
