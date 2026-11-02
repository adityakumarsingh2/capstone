const mongoose = require('mongoose');

const VALID_STATUSES = [
  'ORDER_PLACED',
  'PROCESSING',
  'SHIPPED',
  'ARRIVED_NEAR_AREA',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'DELIVERY_FAILED',
  'RETURN_REQUESTED',
  'RETURNED',
];

// Valid transitions map
const VALID_TRANSITIONS = {
  ORDER_PLACED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['ARRIVED_NEAR_AREA', 'DELIVERY_FAILED'],
  ARRIVED_NEAR_AREA: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'DELIVERY_FAILED'],
  DELIVERED: ['RETURN_REQUESTED'],
  DELIVERY_FAILED: ['SHIPPED', 'CANCELLED'],
  RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
  RETURNED: [],
  CANCELLED: [],
};

const trackingEntrySchema = new mongoose.Schema({
  status: { type: String, enum: VALID_STATUSES, required: true },
  message: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now },
});

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, required: true },
  productImage: String,
  price: { type: Number, required: true },
  size: String,
  color: String,
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  paymentMethod: { type: String, default: 'DEMO' },
  paymentStatus: { type: String, default: 'SIMULATED' },
  status: { type: String, enum: VALID_STATUSES, default: 'ORDER_PLACED' },
  trackingHistory: [trackingEntrySchema],
  stockRestored: { type: Boolean, default: false },
}, { timestamps: true });

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

orderSchema.statics.VALID_TRANSITIONS = VALID_TRANSITIONS;
orderSchema.statics.VALID_STATUSES = VALID_STATUSES;

module.exports = mongoose.model('Order', orderSchema);
