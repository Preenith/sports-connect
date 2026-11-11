const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports_booking');
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@sportsbooking.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            console.log('Email: admin@sportsbooking.com');
            console.log('Password: admin123');
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@sportsbooking.com',
            phone: '1234567890',
            password: hashedPassword,
            role: 'admin',
            status: 'active'
        });

        console.log('Admin user created successfully');
        console.log('Email: admin@sportsbooking.com');
        console.log('Password: admin123');
        console.log('Please change the password after first login');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
