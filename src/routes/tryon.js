const express = require('express');
const router = express.Router();
const { getSessions, createSession, updateSession } = require('../controllers/tryOnController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSessions);
router.post('/', protect, createSession);
router.put('/:id', protect, updateSession);

module.exports = router;
