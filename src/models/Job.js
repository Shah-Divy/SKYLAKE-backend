const mongoose = require('mongoose');
const { STATUS } = require('../constants');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  experience: {
    type: String,
    required: [true, 'Experience requirement is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
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

module.exports = mongoose.model('Job', jobSchema);
