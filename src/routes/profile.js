const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

module.exports = router;
