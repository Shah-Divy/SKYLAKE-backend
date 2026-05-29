const mongoose = require('mongoose');
const { STATUS } = require('../constants');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true,
  },
  modelNumber: {
    type: String,
    required: [true, 'Model number is required'],
    trim: true,
    index: true,
  },
  hsnCode: {
    type: String,
    trim: true,
    default: '',
  },
  images: {
    type: [String],
    required: [true, 'At least one product image is required'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Product must have at least one image'
    }
  },
  videoLink: {
    type: String,
    trim: true,
    default: '',
  },
  pdfFile: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Original price is required'],
    min: [0, 'Price cannot be negative'],
  },
  discountedPrice: {
    type: Number,
    min: [0, 'Discounted price cannot be negative'],
    validate: {
      validator: function(value) {
        // Only validate if discountedPrice is set
        if (value === undefined || value === null) return true;
        return value <= this.price;
      },
      message: 'Discounted price must be less than or equal to the original price'
    },
    default: null,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Brand assignment is required'],
    index: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category assignment is required'],
    index: true,
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

// compound text index to support full-text search across multiple fields
productSchema.index({ productName: 'text', modelNumber: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
