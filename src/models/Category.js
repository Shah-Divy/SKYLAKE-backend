const mongoose = require('mongoose');
const { STATUS } = require('../constants');

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    index: true,
  },
  description: {
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

module.exports = mongoose.model('Category', categorySchema);
