const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Facility = require('../models/Facility');
const TimeSlot = require('../models/TimeSlot');
const Booking = require('../models/Booking');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/uploads/facilities');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept only image files
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
    }
});

// Get dashboard statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Total users
        const userCount = await User.countDocuments();
        
        // Total facilities
        const facilityCount = await Facility.countDocuments({ status: 'active' });
        
        // Today's bookings
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayBookings = await Booking.countDocuments({
            createdAt: { $gte: today }
        });
        
        // Upcoming bookings
        const upcomingBookings = await Booking.countDocuments({
            booking_date: { $gte: new Date() },
            booking_status: 'confirmed'
        });
        
        // Total revenue
        const revenueResult = await Booking.aggregate([
            { $match: { booking_status: 'confirmed', payment_status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
        
        // Most booked sport
        const sportStats = await Booking.aggregate([
            {
                $lookup: {
                    from: 'facilities',
                    localField: 'facility_id',
                    foreignField: '_id',
                    as: 'facility'
                }
            },
            { $unwind: '$facility' },
            {
                $group: {
                    _id: '$facility.sport_type',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        
        // Facility usage statistics
        const facilityUsage = await Booking.aggregate([
            {
                $lookup: {
                    from: 'facilities',
                    localField: 'facility_id',
                    foreignField: '_id',
                    as: 'facility'
                }
            },
            { $unwind: '$facility' },
            {
                $group: {
                    _id: '$facility._id',
                    name: { $first: '$facility.name' },
                    booking_count: { $sum: 1 }
                }
            },
            { $sort: { booking_count: -1 } },
            { $limit: 5 }
        ]);

        res.json({
            stats: {
                total_users: userCount,
                total_facilities: facilityCount,
                today_bookings: todayBookings,
                upcoming_bookings: upcomingBookings,
                total_revenue: totalRevenue,
                most_booked_sport: sportStats.length > 0 ? sportStats[0]._id : 'N/A',
                facility_usage: facilityUsage
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Manage Facilities

// Add facility
router.post('/facilities', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, sport_type, location, description, price_per_hour } = req.body;
        let imagePath = null;

        // Handle uploaded image
        if (req.file) {
            imagePath = `/uploads/facilities/${req.file.filename}`;
        }

        if (!name || !sport_type || !location || !price_per_hour) {
            return res.status(400).json({ error: 'Name, sport type, location, and price are required' });
        }

        const facility = await Facility.create({
            name,
            sport_type,
            location,
            description: description || null,
            price_per_hour,
            image: imagePath,
            status: 'active'
        });

        res.status(201).json({
            message: 'Facility added successfully',
            facility_id: facility._id
        });
    } catch (error) {
        console.error('Add facility error:', error);
        res.status(500).json({ error: 'Failed to add facility' });
    }
});

// Update facility
router.put('/facilities/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, sport_type, location, description, price_per_hour, image, status } = req.body;

        const facility = await Facility.findByIdAndUpdate(
            id,
            { name, sport_type, location, description, price_per_hour, image, status },
            { new: true }
        );

        if (!facility) {
            return res.status(404).json({ error: 'Facility not found' });
        }

        res.json({ message: 'Facility updated successfully' });
    } catch (error) {
        console.error('Update facility error:', error);
        res.status(500).json({ error: 'Failed to update facility' });
    }
});

// Delete facility
router.delete('/facilities/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const facility = await Facility.findByIdAndDelete(id);

        if (!facility) {
            return res.status(404).json({ error: 'Facility not found' });
        }

        res.json({ message: 'Facility deleted successfully' });
    } catch (error) {
        console.error('Delete facility error:', error);
        res.status(500).json({ error: 'Failed to delete facility' });
    }
});

// Manage Time Slots

// Add time slots for a facility
router.post('/slots', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { facility_id, date, start_time, end_time } = req.body;

        if (!facility_id || !date || !start_time || !end_time) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const slot = await TimeSlot.create({
            facility_id,
            date: new Date(date),
            start_time,
            end_time,
            status: 'available'
        });

        res.status(201).json({
            message: 'Time slot added successfully',
            slot_id: slot._id
        });
    } catch (error) {
        console.error('Add slot error:', error);
        res.status(500).json({ error: 'Failed to add time slot' });
    }
});

// Update time slot status
router.put('/slots/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['available', 'booked', 'unavailable'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const slot = await TimeSlot.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!slot) {
            return res.status(404).json({ error: 'Time slot not found' });
        }

        res.json({ message: 'Time slot updated successfully' });
    } catch (error) {
        console.error('Update slot error:', error);
        res.status(500).json({ error: 'Failed to update time slot' });
    }
});

// Get daily schedule
router.get('/slots/daily', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { date, facility_id } = req.query;

        let query = {};

        if (date) {
            query.date = new Date(date);
        }

        if (facility_id) {
            query.facility_id = facility_id;
        }

        const slots = await TimeSlot.find(query)
            .populate('facility_id', 'name')
            .sort({ date: 1, start_time: 1 });

        res.json({ slots });
    } catch (error) {
        console.error('Get daily schedule error:', error);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

// Manage Bookings

// Get all bookings
router.get('/bookings', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { date, facility_id, status, search } = req.query;

        let query = {};

        if (date) {
            query.booking_date = new Date(date);
        }

        if (facility_id) {
            query.facility_id = facility_id;
        }

        if (status) {
            query.booking_status = status;
        }

        if (search) {
            query.$or = [
                { booking_id: { $regex: search, $options: 'i' } }
            ];
        }

        const bookings = await Booking.find(query)
            .populate('user_id', 'name email')
            .populate('facility_id', 'name')
            .sort({ createdAt: -1 });

        // Filter by user name/email if search is provided
        let filteredBookings = bookings;
        if (search) {
            filteredBookings = bookings.filter(booking => {
                const userName = booking.user_id?.name || '';
                const userEmail = booking.user_id?.email || '';
                return userName.toLowerCase().includes(search.toLowerCase()) ||
                       userEmail.toLowerCase().includes(search.toLowerCase());
            });
        }

        res.json({ bookings: filteredBookings });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Cancel booking (admin)
router.put('/bookings/:id/cancel', authenticateToken, requireAdmin, async (req, res) => {
    const session = await Booking.startSession();
    
    try {
        await session.startTransaction();
        
        const { id } = req.params;

        // Get booking with lock
        const booking = await Booking.findById(id).session(session);

        if (!booking) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Update booking status
        await Booking.findByIdAndUpdate(
            id,
            { booking_status: 'cancelled', payment_status: 'refunded' },
            { session }
        );

        // Make slot available again
        await TimeSlot.findByIdAndUpdate(
            booking.slot_id,
            { status: 'available' },
            { session }
        );

        await session.commitTransaction();

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        await session.abortTransaction();
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    } finally {
        session.endSession();
    }
});

// Manage Users

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { search, status } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Activate/deactivate user
router.put('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User status updated successfully' });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

module.exports = router;
