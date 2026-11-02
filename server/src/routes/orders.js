const express = require('express');
const router = express.Router();
const { getOrders, getOrder, createOrder, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getOrders);
router.post('/', protect, createOrder);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
