require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@fitkart.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '123456';

    // Find and delete the old admin
    const deleted = await User.deleteOne({ email: adminEmail });
    console.log(`Removed old admin (matched ${deleted.deletedCount})`);

    // Re-create with new password (pre-save hook will hash it)
    const admin = await User.create({
      email: adminEmail,
      password: adminPassword,
      fullName: 'Fitkart Admin',
      role: 'admin',
    });

    console.log(`✅ Admin recreated: ${admin.email} with password: ${adminPassword}`);
    console.log('You can now login with these credentials.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

resetAdmin();
