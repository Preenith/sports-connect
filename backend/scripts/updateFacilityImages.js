const mongoose = require('mongoose');
const Facility = require('../models/Facility');
require('dotenv').config();

const updateImages = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports_booking');
        console.log('Connected to MongoDB');

        // Update facility images with placeholder URLs
        const imageUpdates = [
            {
                name: 'City Sports Complex',
                image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop'
            },
            {
                name: 'Green Valley Cricket Ground',
                image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=600&fit=crop'
            },
            {
                name: 'Metro Basketball Arena',
                image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop'
            },
            {
                name: 'Sunshine Badminton Hall',
                image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop'
            },
            {
                name: 'Royal Tennis Club',
                image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop'
            },
            {
                name: 'Multi-Sport Arena',
                image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop'
            }
        ];

        for (const update of imageUpdates) {
            await Facility.findOneAndUpdate(
                { name: update.name },
                { image: update.image }
            );
            console.log(`Updated image for: ${update.name}`);
        }

        console.log('All facility images updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error updating images:', error);
        process.exit(1);
    }
};

updateImages();
