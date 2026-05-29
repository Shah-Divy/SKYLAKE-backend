const mongoose = require('mongoose');
const { POLICY_TYPE } = require('../constants');

const policySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Policy title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Policy content is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: [POLICY_TYPE.SHIPPING, POLICY_TYPE.REFUND],
    required: [true, 'Policy type is required'],
    unique: true,
    index: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);
