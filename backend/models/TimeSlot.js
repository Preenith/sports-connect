const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    facility_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facility',
        required: true,
        index: true
    },
    date: {
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
    status: {
        type: String,
        enum: ['available', 'booked', 'unavailable'],
        default: 'available',
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for id to match frontend expectations
timeSlotSchema.virtual('id').get(function() {
    return this._id.toString();
});

// Compound index for unique slots
timeSlotSchema.index({ facility_id: 1, date: 1, start_time: 1, end_time: 1 }, { unique: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
