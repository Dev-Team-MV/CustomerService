import mongoose from 'mongoose'
import balconyOptionSchema from './Balcony.js'
import upgradeOptionSchema from './Upgrade.js'
import storageOptionSchema from './Storage.js'
import imageItemSchema from './schemas/imageItemSchema.js'

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
    // Multiple options arrays
    balconies: [balconyOptionSchema],
    upgrades: [upgradeOptionSchema],
    storages: [storageOptionSchema],
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
    stories: {
      type: Number,
      min: 1
    },
    images: {
      exterior: [imageItemSchema],
      interior: [imageItemSchema]
    },
    // Blueprints por combinación: balcón y storage (cada imagen con url e isPublic)
    blueprints: {
      default: [imageItemSchema],
      withBalcony: [imageItemSchema],
      withStorage: [imageItemSchema],
      withBalconyAndStorage: [imageItemSchema]
    },
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
