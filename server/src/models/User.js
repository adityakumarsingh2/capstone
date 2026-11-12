const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  fullName: { type: String, required: true },
  phone: String,
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 4 },
  fullName: { type: String, trim: true },
  phone: { type: String, trim: true },
  avatarUrl: String,
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isBlocked: { type: Boolean, default: false },
  bodyMeasurements: {
    weight: Number,
    height: Number,
    chest: Number,
    waist: Number,
    hips: Number,
    shoulders: Number,
    inseam: Number,
    fitPreference: { type: String, enum: ['slim', 'regular', 'relaxed', 'oversized'], default: 'regular' },
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    promotionalEmails: { type: Boolean, default: false },
    measurementUnit: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
  },
  stylePreferences: [String],
  addresses: [addressSchema],
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
