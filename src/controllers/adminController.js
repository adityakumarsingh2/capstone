const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const InventoryMovement = require('../models/InventoryMovement');

// GET /api/admin/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProducts, activeProducts, lowStockProducts, outOfStockProducts,
      totalUsers, totalOrders, deliveredOrders, cancelledOrders, pendingOrders,
      revenueResult, recentOrders, recentUsers,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, stockQuantity: { $gt: 0, $lte: 10 } }),
      Product.countDocuments({ isActive: true, stockQuantity: 0 }),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'DELIVERED' }),
      Order.countDocuments({ status: 'CANCELLED' }),
      Order.countDocuments({ status: { $in: ['ORDER_PLACED', 'PROCESSING', 'SHIPPED'] } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'fullName email').lean(),
      User.find({ role: 'customer' }).sort({ createdAt: -1 }).limit(5).select('fullName email createdAt').lean(),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // Orders over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ordersOverTime = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { _id: 1 } },
    ]);

    // Status distribution
    const statusDist = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Top products by sales
    const topProducts = await Product.find({ salesCount: { $gt: 0 } }).sort({ salesCount: -1 }).limit(5).select('name salesCount price images').lean();

    // Category performance
    const categoryPerf = await Product.aggregate([
      { $group: { _id: '$category', productCount: { $sum: 1 }, totalStock: { $sum: '$stockQuantity' } } },
      { $sort: { productCount: -1 } },
    ]);

    res.json({
      success: true, stats: {
        totalProducts, activeProducts, lowStockProducts, outOfStockProducts,
        totalUsers, totalOrders, deliveredOrders, cancelledOrders, pendingOrders,
        totalRevenue, recentOrders, recentUsers, ordersOverTime, statusDist, topProducts, categoryPerf,
      },
    });
  } catch (err) { next(err); }
};

// GET /api/admin/customers
const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20, isBlocked } = req.query;
    const query = { role: 'customer' };
    if (search) query.$or = [{ fullName: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true';

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).select('-password').lean(),
      User.countDocuments(query),
    ]);

    res.json({ success: true, customers: users, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) { next(err); }
};

// GET /api/admin/customers/:id
const getCustomer = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });
    const orders = await Order.find({ userId: req.params.id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, customer: user, orders });
  } catch (err) { next(err); }
};

// PUT /api/admin/customers/:id/block
const toggleBlockCustomer = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot block admin accounts' });

    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, isBlocked: user.isBlocked, message: user.isBlocked ? 'Customer blocked' : 'Customer unblocked' });
  } catch (err) { next(err); }
};

// GET /api/admin/inventory
const getInventoryOverview = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ stockQuantity: 1 }).select('name category stockQuantity isActive images price salesCount').lean();
    const movements = await InventoryMovement.find().sort({ createdAt: -1 }).limit(50).populate('productId', 'name').populate('performedBy', 'fullName email').lean();
    res.json({ success: true, products, movements });
  } catch (err) { next(err); }
};

module.exports = { getDashboardStats, getCustomers, getCustomer, toggleBlockCustomer, getInventoryOverview };
