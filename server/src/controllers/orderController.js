const mongoose = require('mongoose');
const Order = require('../models/Order');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');

const generateOrderNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FK-${ts}-${rand}`;
};

// GET /api/orders (customer: own orders; admin: all orders)
const getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search, startDate, endDate } = req.query;
    const query = {};

    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    if (status) query.status = status;
    if (search) query.orderNumber = new RegExp(search, 'i');
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).populate('userId', 'fullName email').lean(),
      Order.countDocuments(query),
    ]);

    res.json({ success: true, orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) { next(err); }
};

// GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'fullName email').populate('trackingHistory.updatedBy', 'fullName email').lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (req.user.role !== 'admin' && order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// POST /api/orders (create order from cart)
const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { shippingAddress } = req.body;
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }

    const cartItems = await CartItem.find({ userId: req.user._id }).populate('productId').session(session);
    if (!cartItems.length) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate and deduct stock
    const orderItems = [];
    let totalAmount = 0;
    const inventoryOps = [];

    for (const item of cartItems) {
      const product = item.productId;
      if (!product || !product.isActive) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: `Product "${item.productId?.name || 'Unknown'}" is no longer available` });
      }
      if (product.stockQuantity < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({ success: false, message: `Only ${product.stockQuantity} units of "${product.name}" are available` });
      }

      const prevStock = product.stockQuantity;
      product.stockQuantity -= item.quantity;
      product.salesCount = (product.salesCount || 0) + item.quantity;
      await product.save({ session });

      inventoryOps.push({ productId: product._id, type: 'deduction', quantity: item.quantity, previousStock: prevStock, newStock: product.stockQuantity, reason: 'Order placed', performedBy: req.user._id });

      orderItems.push({
        productId: product._id, productName: product.name, productImage: product.images?.[0] || '',
        price: product.price, size: item.size, color: item.color, quantity: item.quantity,
      });
      totalAmount += product.price * item.quantity;
    }

    const orderNumber = generateOrderNumber();
    const [order] = await Order.create([{
      orderNumber, userId: req.user._id, items: orderItems, totalAmount,
      shippingAddress, paymentMethod: 'DEMO', paymentStatus: 'SIMULATED', status: 'ORDER_PLACED',
      trackingHistory: [{ status: 'ORDER_PLACED', message: 'Your order has been placed successfully', updatedBy: req.user._id }],
    }], { session });

    // Save inventory movements
    for (const op of inventoryOps) {
      op.orderId = order._id;
      await InventoryMovement.create([op], { session });
    }

    // Clear cart
    await CartItem.deleteMany({ userId: req.user._id }, { session });

    await session.commitTransaction();
    res.status(201).json({ success: true, order });
  } catch (err) {
    await session.abortTransaction();
    // If transaction fails due to no replica set, fall back to non-transactional
    if (err.message && err.message.includes('Transaction')) {
      return createOrderFallback(req, res, next);
    }
    next(err);
  } finally {
    session.endSession();
  }
};

// Non-transactional fallback for single-node MongoDB
const createOrderFallback = async (req, res, next) => {
  try {
    const { shippingAddress } = req.body;
    const cartItems = await CartItem.find({ userId: req.user._id }).populate('productId');
    if (!cartItems.length) return res.status(400).json({ success: false, message: 'Cart is empty' });

    const orderItems = [];
    let totalAmount = 0;

    for (const item of cartItems) {
      const product = await Product.findById(item.productId._id);
      if (!product || !product.isActive) return res.status(400).json({ success: false, message: `Product unavailable` });
      if (product.stockQuantity < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for "${product.name}"` });

      const prevStock = product.stockQuantity;
      product.stockQuantity -= item.quantity;
      product.salesCount = (product.salesCount || 0) + item.quantity;
      await product.save();

      await InventoryMovement.create({ productId: product._id, type: 'deduction', quantity: item.quantity, previousStock: prevStock, newStock: product.stockQuantity, reason: 'Order placed', performedBy: req.user._id });

      orderItems.push({ productId: product._id, productName: product.name, productImage: product.images?.[0] || '', price: product.price, size: item.size, color: item.color, quantity: item.quantity });
      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      orderNumber: generateOrderNumber(), userId: req.user._id, items: orderItems, totalAmount, shippingAddress,
      paymentMethod: 'DEMO', paymentStatus: 'SIMULATED', status: 'ORDER_PLACED',
      trackingHistory: [{ status: 'ORDER_PLACED', message: 'Your order has been placed successfully', updatedBy: req.user._id }],
    });

    await CartItem.deleteMany({ userId: req.user._id });
    res.status(201).json({ success: true, order });
  } catch (err) { next(err); }
};

// PUT /api/orders/:id/status (admin only)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, message } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const validTransitions = Order.VALID_TRANSITIONS[order.status] || [];
    if (!validTransitions.includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot transition from ${order.status} to ${status}` });
    }

    // Restore stock on cancellation (only once)
    if (status === 'CANCELLED' && !order.stockRestored) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const prev = product.stockQuantity;
          product.stockQuantity += item.quantity;
          await product.save();
          await InventoryMovement.create({
            productId: product._id, type: 'restoration', quantity: item.quantity,
            previousStock: prev, newStock: product.stockQuantity, reason: 'Order cancelled', orderId: order._id, performedBy: req.user._id,
          });
        }
      }
      order.stockRestored = true;
    }

    order.status = status;
    order.trackingHistory.push({ status, message: message || getDefaultMessage(status), updatedBy: req.user._id });
    await order.save();

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// PUT /api/orders/:id/cancel (customer self-cancel)
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const cancelableStatuses = ['ORDER_PLACED', 'PROCESSING'];
    if (!cancelableStatuses.includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    if (!order.stockRestored) {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const prev = product.stockQuantity;
          product.stockQuantity += item.quantity;
          await product.save();
          await InventoryMovement.create({ productId: product._id, type: 'restoration', quantity: item.quantity, previousStock: prev, newStock: product.stockQuantity, reason: 'Order cancelled by customer', orderId: order._id, performedBy: req.user._id });
        }
      }
      order.stockRestored = true;
    }

    order.status = 'CANCELLED';
    order.trackingHistory.push({ status: 'CANCELLED', message: 'Order cancelled by customer', updatedBy: req.user._id });
    await order.save();

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

const getDefaultMessage = (status) => {
  const messages = {
    ORDER_PLACED: 'Your order has been placed', PROCESSING: 'Your order is being processed',
    SHIPPED: 'Your order has been shipped', ARRIVED_NEAR_AREA: 'Your order has arrived near your area',
    OUT_FOR_DELIVERY: 'Your order is out for delivery', DELIVERED: 'Your order has been delivered',
    CANCELLED: 'Order has been cancelled', DELIVERY_FAILED: 'Delivery attempt failed',
    RETURN_REQUESTED: 'Return requested', RETURNED: 'Order returned',
  };
  return messages[status] || status;
};

module.exports = { getOrders, getOrder, createOrder, updateOrderStatus, cancelOrder };
