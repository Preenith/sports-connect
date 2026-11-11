const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    booking_id: {
        type: String,
        required: true,
        unique: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    facility_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facility',
        required: true,
        index: true
    },
    slot_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot',
        required: true
    },
    booking_date: {
        type: Date,
        required: true,
        index: true
    },
    start_time: {
        type: String,
        required: true
    },
    end_time: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    booking_status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed'],
        default: 'confirmed',
        index: true
    },
    payment_status: {
        type: String,
        enum: ['paid', 'pending', 'refunded'],
        default: 'paid'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for id to match frontend expectations
bookingSchema.virtual('id').get(function() {
    return this._id.toString();
});

// Indexes for faster queries
bookingSchema.index({ booking_date: 1 });
bookingSchema.index({ booking_status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
