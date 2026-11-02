const express = require('express');
const router = express.Router();
const { getDashboardStats, getCustomers, getCustomer, toggleBlockCustomer, getInventoryOverview } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomer);
router.put('/customers/:id/block', toggleBlockCustomer);
router.get('/inventory', getInventoryOverview);

module.exports = router;
