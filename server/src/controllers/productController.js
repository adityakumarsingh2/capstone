const Product = require('../models/Product');
const InventoryMovement = require('../models/InventoryMovement');
const path = require('path');

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { category, brand, search, minPrice, maxPrice, size, color, sort, page = 1, limit = 20, includeInactive } = req.query;
    const query = {};

    // Only admins can see inactive products
    if (!includeInactive || req.user?.role !== 'admin') {
      query.isActive = true;
    }

    if (category && category !== 'All') query.category = category.toLowerCase();
    if (brand) query.brand = new RegExp(brand, 'i');
    if (search) query.$text = { $search: search };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (size) query.sizes = size;
    if (color) query.colors = color;

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { averageRating: -1 };
    else if (sort === 'popular') sortOption = { salesCount: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ]);

    res.json({ success: true, products, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) { next(err); }
};

// GET /api/products/:id
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

// POST /api/products (admin)
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, brand, sizes, colors, stockQuantity } = req.body;
    if (!name || !price || !category || !sizes) {
      return res.status(400).json({ success: false, message: 'Name, price, category, sizes are required' });
    }

    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : (req.body.images ? (Array.isArray(req.body.images) ? req.body.images : [req.body.images]) : []);
    const sizesArr = Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim());
    const colorsArr = colors ? (Array.isArray(colors) ? colors : colors.split(',').map(c => c.trim())) : [];

    const product = await Product.create({
      name, description, price: parseFloat(price), category, brand, sizes: sizesArr, colors: colorsArr, images,
      stockQuantity: parseInt(stockQuantity) || 0, isActive: true, sellerId: req.user._id,
    });

    if (product.stockQuantity > 0) {
      await InventoryMovement.create({ productId: product._id, type: 'addition', quantity: product.stockQuantity, previousStock: 0, newStock: product.stockQuantity, reason: 'Initial stock', performedBy: req.user._id });
    }

    res.status(201).json({ success: true, product });
  } catch (err) { next(err); }
};

// PUT /api/products/:id (admin)
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const { name, description, price, category, brand, sizes, colors, stockQuantity, isActive } = req.body;
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (category !== undefined) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (sizes !== undefined) product.sizes = Array.isArray(sizes) ? sizes : sizes.split(',').map(s => s.trim());
    if (colors !== undefined) product.colors = Array.isArray(colors) ? colors : colors.split(',').map(c => c.trim());
    if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;

    // Handle stock update with inventory tracking
    if (stockQuantity !== undefined) {
      const newQty = parseInt(stockQuantity);
      const diff = newQty - product.stockQuantity;
      const prevStock = product.stockQuantity;
      product.stockQuantity = newQty;
      await InventoryMovement.create({
        productId: product._id, type: 'adjustment', quantity: Math.abs(diff), previousStock: prevStock,
        newStock: newQty, reason: 'Admin manual adjustment', performedBy: req.user._id,
      });
    }

    // Handle new image files
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => `/uploads/${f.filename}`);
      const existingImages = req.body.keepImages ? (Array.isArray(req.body.keepImages) ? req.body.keepImages : [req.body.keepImages]) : product.images;
      product.images = [...existingImages, ...newImages];
    }

    await product.save();
    res.json({ success: true, product });
  } catch (err) { next(err); }
};

// DELETE /api/products/:id (admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { next(err); }
};

// POST /api/products/upload-image (admin)
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ success: true, url });
  } catch (err) { next(err); }
};

// GET /api/products/:id/inventory
const getInventory = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const movements = await InventoryMovement.find({ productId: req.params.id }).sort({ createdAt: -1 }).limit(50).populate('performedBy', 'fullName email').lean();
    res.json({ success: true, stockQuantity: product.stockQuantity, movements });
  } catch (err) { next(err); }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, uploadImage, getInventory };
