const stylistService = require('../services/stylistService');

// POST /api/stylist/recommend
const getRecommendations = async (req, res, next) => {
  try {
    const { occasion, budget, preferredStyle, preferredColors, instructions } = req.body;

    if (!budget || Number(budget) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid positive budget is required.'
      });
    }

    // Extract user profile preferences if user is authenticated
    const userPreferences = req.user ? {
      stylePreferences: req.user.stylePreferences || [],
      fitPreference: req.user.bodyMeasurements?.fitPreference || 'regular',
      bodyMeasurements: req.user.bodyMeasurements || {}
    } : null;

    const result = await stylistService.generateRecommendations({
      occasion: occasion || 'Casual Outing',
      budget: Number(budget),
      preferredStyle: preferredStyle || (userPreferences?.stylePreferences?.[0] || 'Minimal'),
      preferredColors: preferredColors || [],
      instructions: instructions || '',
      userPreferences
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/stylist/replace-item
const replaceOutfitItem = async (req, res, next) => {
  try {
    const { currentItem, remainingItems, budget, occasion, preferredStyle } = req.body;

    if (!currentItem || !currentItem._id) {
      return res.status(400).json({
        success: false,
        message: 'Current item to replace is required.'
      });
    }

    if (!Array.isArray(remainingItems)) {
      return res.status(400).json({
        success: false,
        message: 'remainingItems array is required.'
      });
    }

    if (!budget || Number(budget) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid budget is required.'
      });
    }

    const result = await stylistService.replaceItem({
      currentItem,
      remainingItems,
      budget: Number(budget),
      occasion,
      preferredStyle
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  replaceOutfitItem
};
