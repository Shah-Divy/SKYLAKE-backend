const mongoose = require('mongoose');
const { STATUS } = require('../constants');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'News title is required'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'News cover image is required'],
  },
  content: {
    type: String,
    required: [true, 'News content is required'],
    trim: true,
  },
  publishDate: {
    type: Date,
    default: Date.now,
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

module.exports = mongoose.model('News', newsSchema);
