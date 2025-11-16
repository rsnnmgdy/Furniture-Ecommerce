require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order'); // Import Order
const Cart = require('../models/Cart'); // Import Cart
const connectDB = require('../config/db');

// --- NEW ACCURATE IMAGE URLs ---
const sampleProducts = [
  // Living Room
  {
    name: 'Modern Leather Sofa',
    description: 'Luxurious 3-seater leather sofa with premium Italian leather. Features solid wood frame and high-density foam cushions for maximum comfort.',
    price: 1299.99,
    category: 'Living Room',
    material: 'Genuine Leather',
    color: ['Brown', 'Black', 'White'],
    dimensions: { length: 84, width: 36, height: 33, unit: 'inches' },
    weight: { value: 150, unit: 'lbs' },
    stock: 15,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800',
        publicId: 'sample_leather_sofa_1',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1512212678077-384b65675b3d?w=800',
        publicId: 'sample_leather_sofa_2',
      },
    ],
    tags: ['sofa', 'leather', 'modern'],
    isFeatured: true,
  },
  {
    name: 'Sectional Sofa L-Shape',
    description: 'Spacious L-shaped sectional sofa perfect for large living rooms. Includes soft cushions and sturdy wooden frame.',
    price: 1599.99,
    salePrice: 1399.99,
    category: 'Living Room',
    material: 'Fabric and Wood',
    color: ['Gray', 'Blue', 'Beige'],
    dimensions: { length: 110, width: 85, height: 36, unit: 'inches' },
    weight: { value: 200, unit: 'lbs' },
    stock: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1616627781431-d218d6669653?w=800',
        publicId: 'sample_sectional_1',
        isPrimary: true,
      },
    ],
    tags: ['sectional', 'sofa', 'large'],
    isFeatured: true,
  },
  {
    name: 'Lift-Top Coffee Table',
    description: 'Modern lift-top coffee table with hidden storage compartment. Perfect for small living spaces.',
    price: 349.99,
    category: 'Living Room',
    material: 'Engineered Wood',
    color: ['Walnut', 'White', 'Gray'],
    dimensions: { length: 47, width: 24, height: 19, unit: 'inches' },
    stock: 18,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800',
        publicId: 'sample_coffee_table_1',
        isPrimary: true,
      },
    ],
    tags: ['coffee table', 'storage', 'lift-top'],
  },
  {
    name: 'Reclining Accent Chair',
    description: 'Comfortable reclining chair with ottoman. Premium fabric upholstery and smooth reclining mechanism.',
    price: 449.99,
    salePrice: 399.99,
    category: 'Living Room',
    material: 'Fabric and Steel',
    color: ['Gray', 'Blue', 'Burgundy'],
    dimensions: { length: 32, width: 35, height: 40, unit: 'inches' },
    stock: 20,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800',
        publicId: 'sample_chair_1',
        isPrimary: true,
      },
    ],
    tags: ['chair', 'recliner', 'accent'],
  },
  {
    name: 'Velvet Armchair',
    description: 'Elegant velvet armchair with mid-century modern design. Perfect accent piece for any living room.',
    price: 399.99,
    category: 'Living Room',
    material: 'Velvet Fabric',
    color: ['Emerald Green', 'Blush Pink', 'Navy Blue'],
    dimensions: { length: 28, width: 32, height: 36, unit: 'inches' },
    stock: 12,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596162352222-f4136f591140?w=800',
        publicId: 'sample_armchair_1',
        isPrimary: true,
      },
    ],
    tags: ['armchair', 'velvet', 'mid-century'],
  },
  {
    name: 'Side Table Marble Top',
    description: 'Elegant side table with white marble top and metal base. Minimal contemporary design.',
    price: 199.99,
    category: 'Living Room',
    material: 'Marble and Metal',
    color: ['White', 'Black Marble'],
    dimensions: { length: 18, width: 18, height: 24, unit: 'inches' },
    stock: 22,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800',
        publicId: 'sample_side_table_1',
        isPrimary: true,
      },
    ],
    tags: ['side table', 'marble', 'contemporary'],
  },

  // Dining Room
  {
    name: 'Wooden Dining Table Set',
    description: 'Elegant 6-seater solid oak dining table with matching chairs. Perfect for family gatherings and dinner parties.',
    price: 899.99,
    category: 'Dining Room',
    material: 'Solid Oak Wood',
    color: ['Natural Wood', 'Dark Walnut'],
    dimensions: { length: 72, width: 40, height: 30, unit: 'inches' },
    stock: 8,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800',
        publicId: 'sample_dining_1',
        isPrimary: true,
      },
    ],
    tags: ['dining table', 'wood', 'chairs'],
    isFeatured: true,
  },
  {
    name: 'Modern Glass Dining Table',
    description: 'Contemporary glass top dining table with stainless steel legs. Seats 4-6 people comfortably.',
    price: 649.99,
    category: 'Dining Room',
    material: 'Tempered Glass and Steel',
    color: ['Clear', 'Smoked Gray'],
    dimensions: { length: 60, width: 36, height: 30, unit: 'inches' },
    stock: 14,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
        publicId: 'sample_glass_table_1',
        isPrimary: true,
      },
    ],
    tags: ['glass table', 'modern', 'dining'],
  },
  {
    name: 'Upholstered Dining Chairs (Set of 4)',
    description: 'Set of 4 upholstered dining chairs with ergonomic design. Available in multiple colors.',
    price: 299.99,
    category: 'Dining Room',
    material: 'Fabric and Wood',
    color: ['Gray', 'Beige', 'Dark Brown'],
    dimensions: { length: 18, width: 20, height: 36, unit: 'inches' },
    stock: 16,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1590089060011-53b7b8071811?w=800',
        publicId: 'sample_dining_chairs_1',
        isPrimary: true,
      },
    ],
    tags: ['dining chairs', 'upholstered', 'set'],
  },
  {
    name: 'Dining Buffet Cabinet',
    description: 'Spacious buffet cabinet with shelving and drawers. Perfect for dining room storage.',
    price: 599.99,
    category: 'Dining Room',
    material: 'Solid Wood',
    color: ['Espresso', 'Natural Oak'],
    dimensions: { length: 48, width: 18, height: 36, unit: 'inches' },
    stock: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1633513221943-4e636603417f?w=800',
        publicId: 'sample_buffet_1',
        isPrimary: true,
      },
    ],
    tags: ['buffet', 'cabinet', 'storage'],
  },

  // Bedroom
  {
    name: 'King Size Platform Bed',
    description: 'Contemporary platform bed with upholstered headboard. Solid wood construction with modern minimalist design.',
    price: 749.99,
    category: 'Bedroom',
    material: 'Wood and Fabric',
    color: ['Gray', 'Beige', 'Navy Blue'],
    dimensions: { length: 83, width: 78, height: 52, unit: 'inches' },
    stock: 12,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
        publicId: 'sample_bed_1',
        isPrimary: true,
      },
    ],
    tags: ['bed', 'king size', 'platform'],
    isFeatured: true,
  },
  {
    name: 'Queen Storage Bed',
    description: 'Queen size bed with built-in drawers for storage. Great space-saving solution.',
    price: 649.99,
    category: 'Bedroom',
    material: 'Wood',
    color: ['White', 'Espresso'],
    dimensions: { length: 80, width: 63, height: 48, unit: 'inches' },
    stock: 14,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1615967361877-c6b1a86b3f7f?w=800',
        publicId: 'sample_queen_bed_1',
        isPrimary: true,
      },
    ],
    tags: ['bed', 'queen', 'storage'],
  },
  {
    name: 'Modern Nightstand',
    description: 'Sleek nightstand with 2 drawers and minimalist design. Perfect complement to any bedroom.',
    price: 199.99,
    category: 'Bedroom',
    material: 'Wood',
    color: ['White', 'Gray', 'Black'],
    dimensions: { length: 20, width: 16, height: 24, unit: 'inches' },
    stock: 20,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1594225301036-c058359400e2?w=800',
        publicId: 'sample_nightstand_1',
        isPrimary: true,
      },
    ],
    tags: ['nightstand', 'bedroom', 'modern'],
  },
  {
    name: '5-Drawer Dresser Chest',
    description: 'Spacious 5-drawer dresser with ample storage. Elegant contemporary styling.',
    price: 499.99,
    salePrice: 449.99,
    category: 'Bedroom',
    material: 'Wood Veneer',
    color: ['Walnut', 'Espresso', 'Natural Wood'],
    dimensions: { length: 50, width: 18, height: 36, unit: 'inches' },
    stock: 11,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1616627685458-883a4176c134?w=800',
        publicId: 'sample_dresser_1',
        isPrimary: true,
      },
    ],
    tags: ['dresser', 'chest', 'storage'],
  },
  {
    name: 'Canopy Bed Frame',
    description: 'Elegant canopy bed with sturdy construction. Creates a luxurious bedroom focal point.',
    price: 899.99,
    category: 'Bedroom',
    material: 'Wood',
    color: ['Natural Wood', 'Black Finish'],
    dimensions: { length: 83, width: 63, height: 84, unit: 'inches' },
    stock: 6,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1595526114032-1f09c6469c58?w=800',
        publicId: 'sample_canopy_1',
        isPrimary: true,
      },
    ],
    tags: ['canopy bed', 'luxurious', 'bedroom'],
  },

  // Office
  {
    name: 'Executive Office Desk',
    description: 'Spacious L-shaped executive desk with built-in storage drawers. Perfect for home office or corporate setting.',
    price: 649.99,
    category: 'Office',
    material: 'MDF with Wood Veneer',
    color: ['Espresso', 'White', 'Gray'],
    dimensions: { length: 60, width: 48, height: 30, unit: 'inches' },
    stock: 10,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800',
        publicId: 'sample_desk_1',
        isPrimary: true,
      },
    ],
    tags: ['desk', 'office', 'l-shaped'],
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Premium ergonomic office chair with lumbar support and adjustable height. Perfect for long working hours.',
    price: 399.99,
    salePrice: 349.99,
    category: 'Office',
    material: 'Mesh and Steel',
    color: ['Black', 'Gray', 'Blue'],
    dimensions: { length: 26, width: 28, height: 42, unit: 'inches' },
    stock: 16,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1580480072023-ceb0c9f16831?w=800',
        publicId: 'sample_office_chair_1',
        isPrimary: true,
      },
    ],
    tags: ['office chair', 'ergonomic', 'desk chair'],
  },
  {
    name: 'Adjustable Standing Desk',
    description: 'Motorized standing desk with memory presets. Switch between sitting and standing positions easily.',
    price: 799.99,
    category: 'Office',
    material: 'Laminate and Steel',
    color: ['White', 'Black', 'Walnut'],
    dimensions: { length: 55, width: 30, height: 29, unit: 'inches' },
    stock: 8,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1593642632823-8f42051b0993?w=800',
        publicId: 'sample_standing_desk_1',
        isPrimary: true,
      },
    ],
    tags: ['standing desk', 'adjustable', 'office'],
  },
  {
    name: 'Office Bookcase',
    description: 'Tall office bookcase with 5 shelves. Great for organizing files and decorative items.',
    price: 349.99,
    category: 'Office',
    material: 'MDF Wood',
    color: ['White', 'Walnut', 'Black'],
    dimensions: { length: 28, width: 14, height: 72, unit: 'inches' },
    stock: 13,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=800',
        publicId: 'sample_office_bookcase_1',
        isPrimary: true,
      },
    ],
    tags: ['bookcase', 'office', 'storage'],
  },
  {
    name: '4-Drawer Filing Cabinet',
    description: '4-drawer filing cabinet with lock. Secure storage for important documents.',
    price: 299.99,
    category: 'Office',
    material: 'Steel',
    color: ['Black', 'Gray'],
    dimensions: { length: 18, width: 18, height: 52, unit: 'inches' },
    stock: 14,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        publicId: 'sample_filing_cabinet_1',
        isPrimary: true,
      },
    ],
    tags: ['filing cabinet', 'storage', 'office'],
  },

  // Storage
  {
    name: 'Ladder Bookshelf Unit',
    description: '5-tier open bookshelf with ladder design. Industrial style with metal frame and wooden shelves.',
    price: 299.99,
    category: 'Storage',
    material: 'Metal and Wood',
    color: ['Black', 'White', 'Rustic Brown'],
    dimensions: { length: 26, width: 14, height: 71, unit: 'inches' },
    stock: 25,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800',
        publicId: 'sample_bookshelf_1',
        isPrimary: true,
      },
    ],
    tags: ['bookshelf', 'storage', 'industrial'],
  },
  {
    name: 'Wardrobe Armoire',
    description: 'Spacious armoire with hanging rods and shelves. Elegant bedroom furniture piece.',
    price: 749.99,
    category: 'Storage',
    material: 'Solid Wood',
    color: ['Espresso', 'Natural Wood', 'White'],
    dimensions: { length: 36, width: 22, height: 78, unit: 'inches' },
    stock: 9,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1631049362529-f23a492f6d0f?w=800',
        publicId: 'sample_armoire_1',
        isPrimary: true,
      },
    ],
    tags: ['armoire', 'wardrobe', 'bedroom'],
  },
  {
    name: 'Industrial Shelving Unit',
    description: 'Heavy-duty industrial shelving unit with 4 shelves. Great for garage or storage room.',
    price: 199.99,
    category: 'Storage',
    material: 'Steel and Metal',
    color: ['Black', 'Gray'],
    dimensions: { length: 48, width: 24, height: 72, unit: 'inches' },
    stock: 15,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1585128719076-3c2adc67bbb2?w=800',
        publicId: 'sample_industrial_shelf_1',
        isPrimary: true,
      },
    ],
    tags: ['shelving', 'industrial', 'storage'],
  },
  {
    name: 'Storage Ottoman Bench',
    description: 'Stylish ottoman bench with hidden storage. Perfect as footrest or extra seating.',
    price: 179.99,
    category: 'Storage',
    material: 'Fabric and Wood',
    color: ['Gray', 'Blue', 'Beige'],
    dimensions: { length: 36, width: 18, height: 18, unit: 'inches' },
    stock: 18,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1580480113221-50f09b973b06?w=800',
        publicId: 'sample_ottoman_1',
        isPrimary: true,
      },
    ],
    tags: ['ottoman', 'storage', 'footrest'],
  },

  // Outdoor
  {
    name: 'Outdoor Patio Set',
    description: '4-piece wicker patio furniture set including loveseat, 2 chairs, and coffee table. Weather-resistant cushions.',
    price: 999.99,
    category: 'Outdoor',
    material: 'PE Wicker and Aluminum',
    color: ['Brown', 'Gray'],
    dimensions: { length: 60, width: 30, height: 35, unit: 'inches' },
    stock: 6,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
        publicId: 'sample_patio_1',
        isPrimary: true,
      },
    ],
    tags: ['outdoor', 'patio', 'wicker'],
    isFeatured: true,
  },
  {
    name: 'Wooden Garden Bench',
    description: 'Classic wooden garden bench. Durable and weather-resistant construction.',
    price: 249.99,
    category: 'Outdoor',
    material: 'Solid Wood',
    color: ['Natural Wood', 'Dark Stain'],
    dimensions: { length: 48, width: 24, height: 36, unit: 'inches' },
    stock: 12,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596488335655-cc2fc3ebc9f8?w=800',
        publicId: 'sample_bench_1',
        isPrimary: true,
      },
    ],
    tags: ['bench', 'garden', 'outdoor'],
  },
  {
    name: 'Outdoor Dining Set',
    description: '6-seater outdoor dining table with chairs. Rust-proof metal frame.',
    price: 799.99,
    salePrice: 699.99,
    category: 'Outdoor',
    material: 'Metal and Tempered Glass',
    color: ['Silver', 'Black'],
    dimensions: { length: 72, width: 42, height: 30, unit: 'inches' },
    stock: 8,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1617802362824-9b88f343c1eb?w=800',
        publicId: 'sample_outdoor_dining_1',
        isPrimary: true,
      },
    ],
    tags: ['outdoor dining', 'table', 'chairs'],
  },
  {
    name: 'Outdoor Lounge Chair',
    description: 'Comfortable outdoor lounge chair with adjustable backrest. Perfect for pool or patio.',
    price: 349.99,
    category: 'Outdoor',
    material: 'Aluminum and Fabric',
    color: ['Tan', 'Gray', 'Navy'],
    dimensions: { length: 27, width: 31, height: 35, unit: 'inches' },
    stock: 16,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=800',
        publicId: 'sample_lounge_1',
        isPrimary: true,
      },
    ],
    tags: ['lounge chair', 'outdoor', 'pool'],
  },
  {
    name: 'Outdoor Storage Box',
    description: 'Waterproof storage box for patio cushions and accessories. Lockable design.',
    price: 199.99,
    category: 'Outdoor',
    material: 'Resin Plastic',
    color: ['Brown', 'Gray', 'Black'],
    dimensions: { length: 48, width: 28, height: 28, unit: 'inches' },
    stock: 13,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1587588373304-1b76404d7f57?w=800',
        publicId: 'sample_storage_box_1',
        isPrimary: true,
      },
    ],
    tags: ['storage box', 'outdoor', 'waterproof'],
  },

  // Decor
  {
    name: 'Floating Wall Shelves',
    description: 'Modern floating wall shelves for minimalist decor. Supports up to 25 lbs per shelf.',
    price: 89.99,
    category: 'Decor',
    material: 'Wood and Metal Brackets',
    color: ['White', 'Black', 'Walnut'],
    dimensions: { length: 36, width: 10, height: 8, unit: 'inches' },
    stock: 30,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1577720643272-265f434b3c53?w=800',
        publicId: 'sample_floating_shelf_1',
        isPrimary: true,
      },
    ],
    tags: ['shelving', 'wall decor', 'floating'],
  },
  {
    name: 'Decorative Wall Mirror',
    description: 'Large decorative wall mirror with elegant frame. Adds space and light to any room.',
    price: 149.99,
    category: 'Decor',
    material: 'Glass and Metal',
    color: ['Gold', 'Silver', 'Black'],
    dimensions: { length: 36, width: 48, height: 2, unit: 'inches' },
    stock: 14,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503652601-557d07733ddc?w=800',
        publicId: 'sample_mirror_1',
        isPrimary: true,
      },
    ],
    tags: ['mirror', 'wall decor', 'decorative'],
  },

  // Kitchen
  {
    name: 'Kitchen Island Cart',
    description: 'Mobile kitchen island with storage shelves and butcher block top. Great for extra workspace.',
    price: 299.99,
    category: 'Kitchen',
    material: 'Wood and Metal',
    color: ['Natural Wood', 'Black', 'White'],
    dimensions: { length: 36, width: 24, height: 36, unit: 'inches' },
    stock: 11,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
        publicId: 'sample_island_cart_1',
        isPrimary: true,
      },
    ],
    tags: ['kitchen island', 'cart', 'storage'],
  },
  {
    name: 'Kitchen Bar Stools (Set of 2)',
    description: 'Set of 2 contemporary bar stools with adjustable height. Perfect for kitchen island.',
    price: 199.99,
    category: 'Kitchen',
    material: 'Metal and Leatherette',
    color: ['Black', 'Gray', 'Brown'],
    dimensions: { length: 18, width: 18, height: 24, unit: 'inches' },
    stock: 16,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800',
        publicId: 'sample_bar_stools_1',
        isPrimary: true,
      },
    ],
    tags: ['bar stools', 'kitchen', 'seating'],
  },
];

// Sample users
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@furniture.com',
    username: 'admin',
    password: 'Admin123',
    role: 'admin',
    isVerified: true, // Admin is pre-verified
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    username: 'sarah_j',
    password: 'Test123',
    role: 'user',
    isVerified: true,
  },
  {
    name: 'Mike Chen',
    email: 'mike@example.com',
    username: 'mike_chen',
    password: 'Test123',
    role: 'user',
    isVerified: true,
  },
  {
    name: 'Emma Wilson',
    email: 'emma@example.com',
    username: 'emma_w',
    password: 'Test123',
    role: 'user',
    isVerified: true,
  },
  {
    name: 'David Martinez',
    email: 'david@example.com',
    username: 'david_m',
    password: 'Test123',
    role: 'user',
    isVerified: true,
  },
  {
    name: 'Jessica Lee',
    email: 'jessica@example.com',
    username: 'jessica_l',
    password: 'Test123',
    role: 'user',
    isVerified: true,
  },
  {
    name: 'Robert Brown',
    email: 'robert@example.com',
    username: 'robert_b',
    password: 'Test123',
    role: 'user',
    isVerified: true,
  },
  {
    name: 'Amanda Taylor',
    email: 'amanda@example.com',
    username: 'amanda_t',
    password: 'Test123',
    role: 'user',
    isVerified: true,
  },
  {
    name: 'John Garcia',
    email: 'john@example.com',
    username: 'john_g',
    password: 'Test123',
    role: 'user',
    isVerified: true,
  },
  {
    name: 'Test User',
    email: 'test@furniture.com',
    username: 'testuser',
    password: 'Test123',
    role: 'user',
    isVerified: true,
  },
];

// Sample reviews data (will be created after products and users are inserted)
const generateReviews = (productIds, userIds) => {
  const reviewComments = [
    'Excellent quality! Very comfortable and looks amazing in my living room.',
    'Great value for the price. Delivery was fast and professional.',
    'Love this piece! It fits perfectly with my decor and is very durable.',
    'Highly recommend! The craftsmanship is outstanding.',
    'Perfect furniture for our new home. Very satisfied with the purchase.',
    'Comfortable and stylish. Better than I expected!',
    'Amazing product! Will definitely buy more from this store.',
    'Very well made. The color and design match the photos perfectly.',
    'Exceptional quality. Worth every penny!',
    'This is by far the best furniture I have ever owned.',
    'Great customer service and quality product. Very happy!',
    'The materials are premium and the design is beautiful.',
    'Installed easily and looks exactly like the pictures.',
    'My family loves this furniture. Very comfortable!',
    'Outstanding quality and design. Highly satisfied.',
    'Great addition to my home. Very pleased with my purchase.',
    'The furniture is sturdy and looks elegant. Highly recommend!',
    'Perfect for my needs. Great quality at a good price.',
    'Absolutely beautiful! Everyone who sees it loves it.',
    'Very durable and well-constructed. Happy customer!',
  ];

  const reviews = [];
  
  // Create multiple reviews for each product
  productIds.forEach((productId, productIndex) => {
    const reviewCount = Math.floor(Math.random() * 4) + 3; // 3-6 reviews per product
    
    // Ensure we don't use more users than available
    const userPool = [...userIds].sort(() => 0.5 - Math.random());

    for (let i = 0; i < reviewCount; i++) {
      // Pick a user for this review, ensuring one review per user per product
      const userId = userPool.pop();
      if (!userId) break; // Stop if we run out of users

      const randomCommentIndex = Math.floor(Math.random() * reviewComments.length);
      const randomRating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
      
      reviews.push({
        user: userId,
        product: productId,
        rating: randomRating,
        comment: reviewComments[randomCommentIndex],
      });
    }
  });

  return reviews;
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Order.deleteMany({}); // Clear orders
    await Cart.deleteMany({}); // Clear carts
    // Only delete non-admin users
    await User.deleteMany({ role: { $ne: 'admin' } }); 
    console.log('   ✅ Cleared products, reviews, orders, carts, and non-admin users.');


    // Create or verify users
    console.log('\n👤 Setting up users...');
    const users = [];
    
    // Check for admin, create if it doesn't exist
    let adminUser = await User.findOne({ email: 'admin@furniture.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@furniture.com',
        username: 'admin',
        password: 'Admin123',
        role: 'admin',
        isVerified: true,
      });
      console.log(`   ✅ Created: Admin User (admin@furniture.com)`);
    } else {
      console.log(`   ⏭️  Admin User (admin@furniture.com) already exists.`);
    }
    users.push(adminUser._id); // Add admin ID to user list

    // Create other users
    for (const userData of sampleUsers) {
      if (userData.email === 'admin@furniture.com') continue; // Skip admin
      
      let user = await User.findOne({ email: userData.email });
      
      if (!user) {
        user = await User.create(userData);
        console.log(`   ✅ Created: ${userData.name} (${userData.email})`);
      } else {
        console.log(`   ⏭️  Already exists: ${userData.name} (${userData.email})`);
      }
      
      users.push(user._id);
    }

    // Insert products
    console.log('\n🛋️  Creating sample products...');
    const products = await Product.insertMany(sampleProducts);
    console.log(`   ✅ Created ${products.length} products`);

    // Generate and insert reviews
    console.log('\n⭐ Creating reviews...');
    const productIds = products.map(p => p._id);
    const nonAdminUserIds = users.slice(1); // Exclude admin from writing reviews
    const reviews = generateReviews(productIds, nonAdminUserIds);
    
    await Review.insertMany(reviews);
    console.log(`   ✅ Created ${reviews.length} reviews`);

    // --- NEW FIX: Update Product Ratings ---
    console.log('\n🔄 Calculating product ratings...');
    let updatedCount = 0;
    for (const productId of productIds) {
      const product = await Product.findById(productId);
      if (product) {
        await product.calculateAverageRating(); // This method is in your Product.js model
        updatedCount++;
      }
    }
    console.log(`   ✅ Updated ratings for ${updatedCount} products.`);
    // --- END OF NEW FIX ---

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Database seeded successfully!');
    console.log('='.repeat(50) + '\n');

    console.log('📊 Summary:');
    console.log(`   📦 Products: ${products.length}`);
    console.log(`   👥 Users: ${users.length - 1} (plus 1 admin)`);
    console.log(`   ⭐ Reviews: ${reviews.length}`);
    console.log('\n🔐 Test Credentials:');
    console.log('   Admin:');
    console.log('      Username: admin');
    console.log('      Password: Admin123');
    console.log('   Customer:');
    console.log('      Username: sarah_j');
    console.log('      Password: Test123');
    console.log('\n✅ You can now test the application!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();