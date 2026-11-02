const express = require('express');
const router = express.Router();
const { getProductReviews, addReview, updateReview, deleteReview, markHelpful, getAllReviews, toggleReviewVisibility } = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getAllReviews);
router.get('/product/:productId', getProductReviews);
router.post('/', protect, addReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, markHelpful);
router.put('/:id/visibility', protect, adminOnly, toggleReviewVisibility);

module.exports = router;
