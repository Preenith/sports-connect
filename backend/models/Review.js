const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for id to match frontend expectations
reviewSchema.virtual('id').get(function() {
    return this._id.toString();
});

// Compound index for unique reviews per user per facility
reviewSchema.index({ user_id: 1, facility_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
