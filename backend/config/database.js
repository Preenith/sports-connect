const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports_booking', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');
        return conn;
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

// Export mongoose instance for use in models
module.exports = { connectDB, mongoose };
