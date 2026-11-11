const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');
const Review = require('../models/Review');
const TimeSlot = require('../models/TimeSlot');
const { authenticateToken } = require('../middleware/auth');

// Get all facilities with optional filters
router.get('/', async (req, res) => {
    try {
        const { sport_type, location, search } = req.query;

        let query = { status: 'active' };

        if (sport_type) {
            query.sport_type = sport_type;
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const facilities = await Facility.find(query).sort({ createdAt: -1 });

        // Add rating and review count for each facility
        const facilitiesWithStats = await Promise.all(
            facilities.map(async (facility) => {
                const reviews = await Review.find({ facility_id: facility._id });
                const avgRating = reviews.length > 0
                    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                    : 0;
                return {
                    ...facility.toObject(),
                    avg_rating: avgRating,
                    review_count: reviews.length
                };
            })
        );

        res.json({ facilities: facilitiesWithStats });
    } catch (error) {
        console.error('Get facilities error:', error);
        res.status(500).json({ error: 'Failed to fetch facilities' });
    }
});

// Get single facility by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const facility = await Facility.findOne({ _id: id, status: 'active' });
        if (!facility) {
            return res.status(404).json({ error: 'Facility not found' });
        }

        // Get reviews for this facility with user names
        const reviews = await Review.find({ facility_id: id })
            .populate('user_id', 'name')
            .sort({ createdAt: -1 });

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        const facilityWithStats = {
            ...facility.toObject(),
            avg_rating: avgRating,
            review_count: reviews.length
        };

        res.json({
            facility: facilityWithStats,
            reviews
        });
    } catch (error) {
        console.error('Get facility error:', error);
        res.status(500).json({ error: 'Failed to fetch facility' });
    }
});

// Get availability for a facility
router.get('/:id/availability', async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Date parameter is required' });
        }

        const slots = await TimeSlot.find({
            facility_id: id,
            date: new Date(date)
        }).sort({ start_time: 1 });

        res.json({ slots });
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
});

// Add review for a facility
router.post('/:id/reviews', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Check if facility exists
        const facility = await Facility.findById(id);
        if (!facility) {
            return res.status(404).json({ error: 'Facility not found' });
        }

        // Check if user already reviewed
        const existingReview = await Review.findOne({ user_id: userId, facility_id: id });
        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this facility' });
        }

        // Create review
        await Review.create({
            user_id: userId,
            facility_id: id,
            rating,
            comment: comment || null
        });

        res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

module.exports = router;
