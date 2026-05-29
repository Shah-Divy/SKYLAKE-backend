const mongoose = require('mongoose');
const { STATUS } = require('../constants');

const reviewSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
  },
  companyName: {
    type: String,
    trim: true,
    default: '',
  },
  review: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
  },
  profileImage: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: 5,
  },
  status: {
    type: String,
    enum: [STATUS.ACTIVE, STATUS.INACTIVE],
    default: STATUS.ACTIVE,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
