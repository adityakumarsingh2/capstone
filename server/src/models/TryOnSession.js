const mongoose = require('mongoose');

const tryOnSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  originalPhotoUrl: { type: String, required: true },
  resultPhotoUrl: String,
  bodyAnalysis: mongoose.Schema.Types.Mixed,
  recommendedSize: String,
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
}, { timestamps: true });

tryOnSessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('TryOnSession', tryOnSessionSchema);
