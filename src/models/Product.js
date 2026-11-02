const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, lowercase: true, trim: true },
  brand: { type: String, trim: true },
  sizes: { type: [String], required: true },
  colors: [String],
  images: [String],
  stockQuantity: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Rating aggregates (updated when reviews change)
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  // Sales counter for popularity sorting
  salesCount: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ name: 'text', brand: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ salesCount: -1 });

module.exports = mongoose.model('Product', productSchema);
