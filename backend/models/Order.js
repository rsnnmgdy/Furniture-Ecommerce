const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        image: String,
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true, default: 'USA' },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Credit Card', 'PayPal', 'Cash on Delivery'],
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    
    // Term Test Lab requirement - Transaction status
    status: {
      type: String,
      required: true,
      enum: [
        'Pending',
        'Processing',
        'Shipped',
        'Delivered',
        'Cancelled',
        'Refunded',
      ],
      default: 'Pending',
    },
    
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: Date,
    
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: Date,
    
    trackingNumber: String,
    
    // Email sent tracking
    emailSent: {
      confirmation: { type: Boolean, default: false },
      shipped: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
    },
    
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Calculate totals before saving
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    const itemsTotal = this.orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    this.taxPrice = itemsTotal * 0.08; // 8% tax
    this.shippingPrice = itemsTotal > 500 ? 0 : 50; // Free shipping over $500
    this.totalPrice = itemsTotal + this.taxPrice + this.shippingPrice;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
