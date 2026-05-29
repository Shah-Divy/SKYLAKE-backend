const mongoose = require('mongoose');
const { STATUS } = require('../constants');

const downloadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
  },
  zipFile: {
    type: String,
    required: [true, 'ZIP archive path/url is required'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  videoLink: {
    type: String,
    trim: true,
    default: '',
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

module.exports = mongoose.model('Download', downloadSchema);
