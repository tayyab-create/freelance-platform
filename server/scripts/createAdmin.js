const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User } = require('../models');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit();
    }

    // Create admin
    const admin = await User.create({
      email: 'admin@freelance.com',
      password: 'admin123',
      role: 'admin',
      status: 'approved',
      isActive: true
    });

    console.log('Admin created successfully');
    console.log('Email: admin@freelance.com');
    console.log('Password: admin123');
    
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();