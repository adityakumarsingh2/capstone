const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, uploadImage, getInventory } = require('../controllers/productController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', optionalAuth, getProducts);
router.get('/:id', getProduct);
router.get('/:id/inventory', protect, adminOnly, getInventory);
router.post('/', protect, adminOnly, upload.array('images', 10), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 10), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.post('/upload/image', protect, adminOnly, upload.single('image'), uploadImage);

module.exports = router;
