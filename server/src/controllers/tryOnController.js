const TryOnSession = require('../models/TryOnSession');

// GET /api/tryon
const getSessions = async (req, res, next) => {
  try {
    const sessions = await TryOnSession.find({ userId: req.user._id }).sort({ createdAt: -1 }).populate('productId', 'name images').lean();
    res.json({ success: true, sessions });
  } catch (err) { next(err); }
};

// POST /api/tryon
const createSession = async (req, res, next) => {
  try {
    const { productId, originalPhotoUrl, bodyAnalysis, recommendedSize, resultPhotoUrl, status } = req.body;
    if (!originalPhotoUrl) return res.status(400).json({ success: false, message: 'originalPhotoUrl is required' });

    const session = await TryOnSession.create({
      userId: req.user._id, productId: productId || null,
      originalPhotoUrl, resultPhotoUrl, bodyAnalysis, recommendedSize,
      status: status || 'processing',
    });

    const populated = await TryOnSession.findById(session._id).populate('productId', 'name images').lean();
    res.status(201).json({ success: true, session: populated });
  } catch (err) { next(err); }
};

// PUT /api/tryon/:id
const updateSession = async (req, res, next) => {
  try {
    const session = await TryOnSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const { resultPhotoUrl, bodyAnalysis, recommendedSize, status, productId } = req.body;
    if (resultPhotoUrl !== undefined) session.resultPhotoUrl = resultPhotoUrl;
    if (bodyAnalysis !== undefined) session.bodyAnalysis = bodyAnalysis;
    if (recommendedSize !== undefined) session.recommendedSize = recommendedSize;
    if (status !== undefined) session.status = status;
    if (productId !== undefined) session.productId = productId;

    await session.save();
    const populated = await TryOnSession.findById(session._id).populate('productId', 'name images').lean();
    res.json({ success: true, session: populated });
  } catch (err) { next(err); }
};

module.exports = { getSessions, createSession, updateSession };
