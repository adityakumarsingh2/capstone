const WishlistItem = require('../models/WishlistItem');

// GET /api/wishlist
const getWishlist = async (req, res, next) => {
  try {
    const items = await WishlistItem.find({ userId: req.user._id })
      .populate('productId', 'name price images brand sizes colors isActive stockQuantity averageRating reviewCount')
      .lean();
    res.json({ success: true, items });
  } catch (err) { next(err); }
};

// POST /api/wishlist
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });

    try {
      await WishlistItem.create({ userId: req.user._id, productId });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ success: false, message: 'Already in wishlist' });
      throw err;
    }

    const items = await WishlistItem.find({ userId: req.user._id }).populate('productId', 'name price images brand sizes colors isActive stockQuantity').lean();
    res.status(201).json({ success: true, message: 'Added to wishlist', items });
  } catch (err) { next(err); }
};

// DELETE /api/wishlist/:productId
const removeFromWishlist = async (req, res, next) => {
  try {
    await WishlistItem.findOneAndDelete({ userId: req.user._id, productId: req.params.productId });
    const items = await WishlistItem.find({ userId: req.user._id }).populate('productId', 'name price images brand sizes colors isActive stockQuantity').lean();
    res.json({ success: true, message: 'Removed from wishlist', items });
  } catch (err) { next(err); }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
