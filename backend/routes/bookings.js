const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const TimeSlot = require('../models/TimeSlot');
const Facility = require('../models/Facility');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const smsService = require('../services/smsService');

// Create a new booking with double-booking prevention
router.post('/', authenticateToken, async (req, res) => {
    const session = await Booking.startSession();
    
    try {
        await session.startTransaction();
        
        const { facility_id, slot_id, date } = req.body;
        const userId = req.user.id;

        // Validation
        if (!facility_id || !slot_id || !date) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Facility ID, slot ID, and date are required' });
        }

        // Get slot details with lock
        const slot = await TimeSlot.findOne({ 
            _id: slot_id, 
            facility_id: facility_id, 
            date: new Date(date) 
        }).session(session);

        if (!slot) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Time slot not found' });
        }

        // Check if slot is still available
        if (slot.status !== 'available') {
            await session.abortTransaction();
            return res.status(409).json({ error: 'This time slot is no longer available' });
        }

        // Get facility details
        const facility = await Facility.findById(facility_id).session(session);
        if (!facility) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Facility not found' });
        }

        // Generate unique booking ID
        const bookingId = `BK${Date.now()}${Math.floor(Math.random() * 10000)}`;

        // Create booking
        const booking = await Booking.create([{
            booking_id: bookingId,
            user_id: userId,
            facility_id: facility_id,
            slot_id: slot_id,
            booking_date: new Date(date),
            start_time: slot.start_time,
            end_time: slot.end_time,
            amount: facility.price_per_hour,
            booking_status: 'confirmed',
            payment_status: 'paid'
        }], { session });

        // Update slot status to booked
        await TimeSlot.findByIdAndUpdate(
            slot_id,
            { status: 'booked' },
            { session }
        );

        await session.commitTransaction();

        // Get user details for SMS
        const user = await User.findById(userId);

        // Send SMS confirmation (non-blocking)
        let smsStatus = null;
        if (user && user.phone) {
            const bookingDetails = {
                userName: user.name,
                facilityName: facility.name,
                date: date,
                startTime: slot.start_time,
                endTime: slot.end_time,
                bookingId: bookingId,
                amount: facility.price_per_hour
            };

            // Send SMS asynchronously (don't wait for it)
            smsService.sendBookingConfirmationSMS(user.phone, bookingDetails)
                .then(result => {
                    if (result.success) {
                        console.log('SMS sent successfully for booking:', bookingId);
                    } else {
                        console.error('SMS failed for booking:', bookingId, result.error);
                    }
                })
                .catch(error => {
                    console.error('SMS service error for booking:', bookingId, error);
                });

            smsStatus = 'sent';
        } else {
            console.log('No phone number for user, SMS not sent');
            smsStatus = 'skipped';
        }

        // Return booking details
        res.status(201).json({
            message: 'Booking confirmed successfully',
            sms_status: smsStatus,
            booking: {
                id: booking[0]._id,
                booking_id: bookingId,
                facility_name: facility.name,
                date: date,
                start_time: slot.start_time,
                end_time: slot.end_time,
                amount: facility.price_per_hour,
                booking_status: 'confirmed',
                payment_status: 'paid'
            }
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    } finally {
        session.endSession();
    }
});

// Get user's bookings
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        let query = { user_id: userId };

        if (status) {
            query.booking_status = status;
        }

        const bookings = await Booking.find(query)
            .populate('facility_id', 'name sport_type location image')
            .sort({ createdAt: -1 });

        res.json({ bookings });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Get single booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = await Booking.findOne({ _id: id, user_id: userId })
            .populate('facility_id', 'name sport_type location image description');

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json({ booking });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
});

// Cancel booking
router.delete('/:id', authenticateToken, async (req, res) => {
    const session = await Booking.startSession();
    
    try {
        await session.startTransaction();
        
        const { id } = req.params;
        const userId = req.user.id;

        // Get booking with lock
        const booking = await Booking.findOne({ _id: id, user_id: userId }).session(session);

        if (!booking) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Check if booking can be cancelled
        if (booking.booking_status === 'cancelled') {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Booking is already cancelled' });
        }

        if (booking.booking_status === 'completed') {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Cannot cancel completed booking' });
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

module.exports = router;
