const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  companyProfile: {
    type: String,
    required: [true, 'Company profile description is required'],
    trim: true,
  },
  mission: {
    type: String,
    required: [true, 'Mission statement is required'],
    trim: true,
  },
  vision: {
    type: String,
    required: [true, 'Vision statement is required'],
    trim: true,
  },
  achievements: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
