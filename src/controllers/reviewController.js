const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Recalculate and update product rating aggregates
const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { productId: new (require('mongoose').Types.ObjectId)(productId), isVisible: true } },
    { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avg = stats[0]?.avg || 0;
  const count = stats[0]?.count || 0;
  await Product.findByIdAndUpdate(productId, { averageRating: Math.round(avg * 10) / 10, reviewCount: count });
};

// GET /api/reviews/:productId
const getProductReviews = async (req, res, next) => {
  try {
    const { sort = 'newest' } = req.query;
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'highest') sortOption = { rating: -1 };
    else if (sort === 'lowest') sortOption = { rating: 1 };

    const reviews = await Review.find({ productId: req.params.productId, isVisible: true })
      .sort(sortOption).populate('userId', 'fullName avatarUrl').lean();

    // Rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { distribution[r.rating]++; });

    res.json({ success: true, reviews, distribution });
  } catch (err) { next(err); }
};

// POST /api/reviews
const addReview = async (req, res, next) => {
  try {
    const { productId, orderId, rating, title, content } = req.body;
    if (!productId || !orderId || !rating) return res.status(400).json({ success: false, message: 'productId, orderId, and rating are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });

    // Verify the order exists, belongs to user, and is DELIVERED
    const order = await Order.findOne({ _id: orderId, userId: req.user._id, status: 'DELIVERED' });
    if (!order) return res.status(403).json({ success: false, message: 'You can only review products from delivered orders' });

    // Verify product was in the order
    const orderedItem = order.items.find(i => i.productId?.toString() === productId);
    if (!orderedItem) return res.status(403).json({ success: false, message: 'Product was not in this order' });

    try {
      const review = await Review.create({ userId: req.user._id, productId, orderId, rating: parseInt(rating), title, content, verifiedPurchase: true });
      await updateProductRating(productId);
      const populated = await Review.findById(review._id).populate('userId', 'fullName avatarUrl').lean();
      res.status(201).json({ success: true, review: populated });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ success: false, message: 'You have already reviewed this product for this order' });
      throw err;
    }
  } catch (err) { next(err); }
};

// PUT /api/reviews/:id
const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const { rating, title, content } = req.body;
    if (rating !== undefined) review.rating = parseInt(rating);
    if (title !== undefined) review.title = title;
    if (content !== undefined) review.content = content;
    await review.save();

    await updateProductRating(review.productId);
    const populated = await Review.findById(review._id).populate('userId', 'fullName avatarUrl').lean();
    res.json({ success: true, review: populated });
  } catch (err) { next(err); }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') query.userId = req.user._id;
    const review = await Review.findOne(query);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const productId = review.productId;
    await review.deleteOne();
    await updateProductRating(productId);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};

// POST /api/reviews/:id/helpful
const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.userId.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot mark your own review as helpful' });
    }

    const alreadyVoted = review.helpfulVotes.includes(req.user._id);
    if (alreadyVoted) {
      review.helpfulVotes.pull(req.user._id);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulVotes.push(req.user._id);
      review.helpfulCount++;
    }
    await review.save();
    res.json({ success: true, helpfulCount: review.helpfulCount, voted: !alreadyVoted });
  } catch (err) { next(err); }
};

// GET /api/reviews (admin: all reviews)
const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reviews, total] = await Promise.all([
      Review.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('userId', 'fullName email').populate('productId', 'name').lean(),
      Review.countDocuments(),
    ]);
    res.json({ success: true, reviews, total });
  } catch (err) { next(err); }
};

// PUT /api/reviews/:id/visibility (admin)
const toggleReviewVisibility = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    review.isVisible = !review.isVisible;
    await review.save();
    await updateProductRating(review.productId);
    res.json({ success: true, review });
  } catch (err) { next(err); }
};

module.exports = { getProductReviews, addReview, updateReview, deleteReview, markHelpful, getAllReviews, toggleReviewVisibility };
