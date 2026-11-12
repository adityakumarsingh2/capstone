const User = require('../models/User');

// GET /api/profile
const getProfile = async (req, res) => {
  res.json({ success: true, profile: req.user.toSafeObject ? req.user.toSafeObject() : req.user });
};

// PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, avatarUrl, bodyMeasurements, stylePreferences, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (bodyMeasurements !== undefined) {
      user.bodyMeasurements = {
        ...(user.bodyMeasurements?.toObject ? user.bodyMeasurements.toObject() : user.bodyMeasurements || {}),
        ...bodyMeasurements,
      };
    }
    if (stylePreferences !== undefined) user.stylePreferences = stylePreferences;
    if (preferences !== undefined) {
      user.preferences = {
        ...(user.preferences?.toObject ? user.preferences.toObject() : user.preferences || {}),
        ...preferences,
      };
    }

    await user.save();
    res.json({ success: true, profile: user.toSafeObject() });
  } catch (err) { next(err); }
};

// POST /api/profile/avatar
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    const user = await User.findById(req.user._id);
    user.avatarUrl = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ success: true, avatarUrl: user.avatarUrl, profile: user.toSafeObject() });
  } catch (err) { next(err); }
};

// GET /api/profile/addresses
const getAddresses = async (req, res) => {
  res.json({ success: true, addresses: req.user.addresses });
};

// POST /api/profile/addresses
const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, label, isDefault } = req.body;

    if (!fullName || !addressLine1 || !city || !state || !postalCode) {
      return res.status(400).json({ success: false, message: 'Required address fields are missing' });
    }

    const newAddress = { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country: country || 'India', label, isDefault: isDefault || false };

    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }
    if (user.addresses.length === 0) newAddress.isDefault = true;

    user.addresses.push(newAddress);
    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (err) { next(err); }
};

// PUT /api/profile/addresses/:id
const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, label, isDefault } = req.body;
    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (addressLine1 !== undefined) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (country !== undefined) address.country = country;
    if (label !== undefined) address.label = label;
    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
      address.isDefault = true;
    }

    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) { next(err); }
};

// DELETE /api/profile/addresses/:id
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    const wasDefault = address.isDefault;
    address.deleteOne();
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, uploadAvatar, getAddresses, addAddress, updateAddress, deleteAddress };
