import mongoose from 'mongoose'

const modelSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: [true, 'Model name is required'],
      unique: true,
      trim: true
    },
    modelNumber: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0
    },
    // Additional prices for options
    balconyPrice: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Additional price if there is a balcony'
    },
    upgradePrice: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Additional price for upgrade model vs basic'
    },
    storagePrice: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Additional price if storage is included'
    },
    bedrooms: {
      type: Number,
      required: [true, 'Number of bedrooms is required'],
      min: 0
    },
    bathrooms: {
      type: Number,
      required: [true, 'Number of bathrooms is required'],
      min: 0
    },
    sqft: {
      type: Number,
      required: [true, 'Square footage is required'],
      min: 0
    },
    images: [{
      type: String
    }],
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
)

const Model = mongoose.model('Model', modelSchema)

export default Model
