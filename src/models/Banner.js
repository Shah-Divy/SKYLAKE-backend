const mongoose = require('mongoose');
const { STATUS, MEDIA_TYPE } = require('../constants');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
  },
  mediaType: {
    type: String,
    enum: [MEDIA_TYPE.IMAGE, MEDIA_TYPE.VIDEO],
    required: [true, 'Media type is required'],
    default: MEDIA_TYPE.IMAGE,
  },
  mediaUrl: {
    type: String,
    required: [true, 'Media URL is required'],
  },
  ctaText: {
    type: String,
    trim: true,
    default: '',
  },
  ctaUrl: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: [STATUS.ACTIVE, STATUS.INACTIVE],
    default: STATUS.ACTIVE,
  },
  order: {
    type: Number,
    default: 0,
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

module.exports = mongoose.model('Banner', bannerSchema);
