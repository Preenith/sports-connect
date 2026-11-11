const mongoose = require('mongoose');
const Facility = require('../models/Facility');
const TimeSlot = require('../models/TimeSlot');
require('dotenv').config();

const seedFacilities = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports_booking');
        console.log('Connected to MongoDB');

        // Clear existing facilities
        await Facility.deleteMany({});
        await TimeSlot.deleteMany({});
        console.log('Cleared existing data');

        // Sample facilities
        const facilities = [
            {
                name: 'City Sports Complex',
                sport_type: 'football',
                location: 'Downtown, Main Street',
                description: 'Professional football ground with floodlights and changing rooms',
                price_per_hour: 50,
                image: '/uploads/facilities/football1.jpg',
                status: 'active'
            },
            {
                name: 'Green Valley Cricket Ground',
                sport_type: 'cricket',
                location: 'Green Valley, Park Road',
                description: 'Full-size cricket pitch with practice nets and pavilion',
                price_per_hour: 75,
                image: '/uploads/facilities/cricket1.jpg',
                status: 'active'
            },
            {
                name: 'Metro Basketball Arena',
                sport_type: 'basketball',
                location: 'Metro Center, Sports Avenue',
                description: 'Indoor basketball court with professional flooring and seating',
                price_per_hour: 60,
                image: '/uploads/facilities/basketball1.jpg',
                status: 'active'
            },
            {
                name: 'Sunshine Badminton Hall',
                sport_type: 'badminton',
                location: 'Sunshine Park, Recreation Zone',
                description: 'Air-conditioned badminton courts with synthetic flooring',
                price_per_hour: 40,
                image: '/uploads/facilities/badminton1.jpg',
                status: 'active'
            },
            {
                name: 'Royal Tennis Club',
                sport_type: 'tennis',
                location: 'Royal Gardens, Club Road',
                description: 'Clay tennis courts with professional coaching available',
                price_per_hour: 80,
                image: '/uploads/facilities/tennis1.jpg',
                status: 'active'
            },
            {
                name: 'Multi-Sport Arena',
                sport_type: 'multi-sport',
                location: 'City Center, Sports Complex',
                description: 'Versatile arena suitable for multiple sports with adjustable equipment',
                price_per_hour: 100,
                image: '/uploads/facilities/multi1.jpg',
                status: 'active'
            }
        ];

        // Create facilities
        const createdFacilities = await Facility.insertMany(facilities);
        console.log(`Created ${createdFacilities.length} facilities`);

        // Create time slots for each facility for the next 7 days
        const timeSlots = [];
        const timeSlotIntervals = [
            { start: '06:00', end: '07:00' },
            { start: '07:00', end: '08:00' },
            { start: '08:00', end: '09:00' },
            { start: '09:00', end: '10:00' },
            { start: '10:00', end: '11:00' },
            { start: '11:00', end: '12:00' },
            { start: '14:00', end: '15:00' },
            { start: '15:00', end: '16:00' },
            { start: '16:00', end: '17:00' },
            { start: '17:00', end: '18:00' },
            { start: '18:00', end: '19:00' },
            { start: '19:00', end: '20:00' },
            { start: '20:00', end: '21:00' }
        ];

        for (const facility of createdFacilities) {
            for (let day = 0; day < 7; day++) {
                const date = new Date();
                date.setDate(date.getDate() + day);
                date.setHours(0, 0, 0, 0);

                for (const slot of timeSlotIntervals) {
                    timeSlots.push({
                        facility_id: facility._id,
                        date: new Date(date),
                        start_time: slot.start,
                        end_time: slot.end,
                        status: 'available'
                    });
                }
            }
        }

        await TimeSlot.insertMany(timeSlots);
        console.log(`Created ${timeSlots.length} time slots`);

        console.log('Facilities and time slots seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding facilities:', error);
        process.exit(1);
    }
};

seedFacilities();
