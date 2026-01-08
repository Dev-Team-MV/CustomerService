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
      required: [true, 'Price is required'],
      min: 0
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
