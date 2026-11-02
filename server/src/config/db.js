const mongoose = require('mongoose');

const sampleProducts = [
  { name: 'Classic Linen Blazer', description: 'Elegant linen blazer perfect for summer occasions', price: 189.00, category: 'blazers', brand: 'Outfit AI Collection', sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Navy', 'Beige', 'White'], images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500'], stockQuantity: 50, isActive: true },
  { name: 'Silk Evening Dress', description: 'Stunning silk dress for special occasions', price: 299.00, category: 'dresses', brand: 'Outfit AI Collection', sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Burgundy', 'Emerald'], images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500'], stockQuantity: 40, isActive: true },
  { name: 'Tailored Wool Trousers', description: 'Premium wool trousers with a perfect fit', price: 149.00, category: 'trousers', brand: 'Outfit AI Collection', sizes: ['28', '30', '32', '34', '36'], colors: ['Charcoal', 'Navy', 'Black'], images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500'], stockQuantity: 60, isActive: true },
  { name: 'Cotton Casual Shirt', description: 'Comfortable cotton shirt for everyday wear', price: 79.00, category: 'shirts', brand: 'Outfit AI Collection', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['White', 'Light Blue', 'Pink'], images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'], stockQuantity: 80, isActive: true },
  { name: 'Cashmere Sweater', description: 'Luxurious cashmere sweater for cooler days', price: 229.00, category: 'sweaters', brand: 'Outfit AI Collection', sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Cream', 'Gray', 'Camel'], images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500'], stockQuantity: 35, isActive: true },
  { name: 'Denim Jacket', description: 'Classic denim jacket with modern fit', price: 129.00, category: 'jackets', brand: 'Outfit AI Collection', sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Light Wash', 'Dark Wash', 'Black'], images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'], stockQuantity: 45, isActive: true },
  { name: 'Floral Summer Dress', description: 'Light and breezy floral dress for warm days', price: 159.00, category: 'dresses', brand: 'Outfit AI Collection', sizes: ['XS', 'S', 'M', 'L'], colors: ['Floral Pink', 'Floral Blue'], images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'], stockQuantity: 30, isActive: true },
  { name: 'Leather Belt', description: 'Genuine leather belt with brushed metal buckle', price: 59.00, category: 'accessories', brand: 'Outfit AI Collection', sizes: ['S', 'M', 'L', 'XL'], colors: ['Brown', 'Black'], images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'], stockQuantity: 100, isActive: true },
  { name: 'Slim Fit Chinos', description: 'Versatile slim fit chinos for smart casual wear', price: 99.00, category: 'trousers', brand: 'Outfit AI Collection', sizes: ['28', '30', '32', '34', '36', '38'], colors: ['Khaki', 'Navy', 'Olive'], images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500'], stockQuantity: 55, isActive: true },
  { name: 'Wool Overcoat', description: 'Premium wool overcoat for winter elegance', price: 349.00, category: 'outerwear', brand: 'Outfit AI Collection', sizes: ['S', 'M', 'L', 'XL'], colors: ['Camel', 'Charcoal', 'Black'], images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500'], stockQuantity: 20, isActive: true },
  { name: 'Polo T-Shirt', description: 'Classic polo shirt with modern fit', price: 49.00, category: 'tops', brand: 'Outfit AI Collection', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['White', 'Navy', 'Black', 'Red'], images: ['https://images.unsplash.com/photo-1625910513413-5fc421e3e681?w=500'], stockQuantity: 120, isActive: true },
  { name: 'Formal White Shirt', description: 'Crisp formal white shirt for professional settings', price: 89.00, category: 'shirts', brand: 'Outfit AI Collection', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['White'], images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=500'], stockQuantity: 70, isActive: true },
];

const autoSeed = async () => {
  try {
    // Lazy require to avoid circular deps at module load time
    const Product = require('../models/Product');
    const User = require('../models/User');

    // Seed products if DB is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(sampleProducts);
      console.log(`[AutoSeed] ${sampleProducts.length} sample products inserted`);
    } else {
      console.log(`[AutoSeed] Products already exist (${productCount}), skipping`);
    }

    // Seed admin if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@fitkart.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '123456';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({ email: adminEmail, password: adminPassword, fullName: 'Fitkart Admin', role: 'admin' });
      console.log(`[AutoSeed] Admin created: ${adminEmail}`);
    }
  } catch (err) {
    console.error('[AutoSeed] Error during auto-seed:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Auto-seed data on first deploy / empty DB
    await autoSeed();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
