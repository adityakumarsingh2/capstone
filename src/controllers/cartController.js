const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const items = await CartItem.find({ userId: req.user._id })
      .populate('productId', 'name price images brand isActive stockQuantity sizes colors')
      .lean();
    // Filter out deleted/inactive products
    const validItems = items.filter(i => i.productId && i.productId.isActive);
    res.json({ success: true, items: validItems });
  } catch (err) { next(err); }
};

// POST /api/cart
const addToCart = async (req, res, next) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body;
    if (!productId || !size) return res.status(400).json({ success: false, message: 'productId and size are required' });

    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
    if (product.stockQuantity <= 0) return res.status(400).json({ success: false, message: 'Product is out of stock' });

    let cartItem = await CartItem.findOne({ userId: req.user._id, productId, size, color: color || null });
    if (cartItem) {
      const newQty = cartItem.quantity + parseInt(quantity);
      if (newQty > product.stockQuantity) return res.status(400).json({ success: false, message: `Only ${product.stockQuantity} units available` });
      cartItem.quantity = newQty;
      await cartItem.save();
    } else {
      if (parseInt(quantity) > product.stockQuantity) return res.status(400).json({ success: false, message: `Only ${product.stockQuantity} units available` });
      cartItem = await CartItem.create({ userId: req.user._id, productId, size, color: color || null, quantity: parseInt(quantity) });
    }

    const items = await CartItem.find({ userId: req.user._id }).populate('productId', 'name price images brand isActive stockQuantity').lean();
    res.json({ success: true, message: 'Added to cart', items });
  } catch (err) { next(err); }
};

// PUT /api/cart/:id
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) return res.status(400).json({ success: false, message: 'quantity is required' });

    const cartItem = await CartItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cartItem) return res.status(404).json({ success: false, message: 'Cart item not found' });

    if (parseInt(quantity) <= 0) {
      await cartItem.deleteOne();
    } else {
      const product = await Product.findById(cartItem.productId);
      if (product && parseInt(quantity) > product.stockQuantity) {
        return res.status(400).json({ success: false, message: `Only ${product.stockQuantity} units available` });
      }
      cartItem.quantity = parseInt(quantity);
      await cartItem.save();
    }

    const items = await CartItem.find({ userId: req.user._id }).populate('productId', 'name price images brand isActive stockQuantity').lean();
    res.json({ success: true, items });
  } catch (err) { next(err); }
};

// DELETE /api/cart/:id
const removeCartItem = async (req, res, next) => {
  try {
    await CartItem.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    const items = await CartItem.find({ userId: req.user._id }).populate('productId', 'name price images brand isActive stockQuantity').lean();
    res.json({ success: true, message: 'Removed from cart', items });
  } catch (err) { next(err); }
};

// DELETE /api/cart (clear)
const clearCart = async (req, res, next) => {
  try {
    await CartItem.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'Cart cleared', items: [] });
  } catch (err) { next(err); }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
