const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true },
  content: { type: String, trim: true },
  helpfulCount: { type: Number, default: 0 },
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  verifiedPurchase: { type: Boolean, default: true },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

// One review per user per product per order
reviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
