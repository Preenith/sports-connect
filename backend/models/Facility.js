const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    sport_type: {
        type: String,
        required: true,
        enum: ['football', 'cricket', 'basketball', 'badminton', 'tennis', 'multi-sport']
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price_per_hour: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for id to match frontend expectations
facilitySchema.virtual('id').get(function() {
    return this._id.toString();
});

// Indexes for faster queries
facilitySchema.index({ sport_type: 1 });
facilitySchema.index({ status: 1 });
facilitySchema.index({ location: 'text', name: 'text', description: 'text' });

module.exports = mongoose.model('Facility', facilitySchema);
