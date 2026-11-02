const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  size: { type: String, required: true },
  color: String,
  quantity: { type: Number, required: true, default: 1, min: 1 },
}, { timestamps: true });

cartItemSchema.index({ userId: 1, productId: 1, size: 1, color: 1 });

module.exports = mongoose.model('CartItem', cartItemSchema);
