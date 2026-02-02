import mongoose from 'mongoose'
import balconyOptionSchema from './Balcony.js'
import upgradeOptionSchema from './Upgrade.js'
import storageOptionSchema from './Storage.js'

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
      exterior: [{
        type: String,
        trim: true
      }],
      interior: [{
        type: String,
        trim: true
      }]
    },
    // Blueprints por combinación: balcón y storage (igual que imágenes)
    blueprints: {
      default: [{ type: String, trim: true }],
      withBalcony: [{ type: String, trim: true }],
      withStorage: [{ type: String, trim: true }],
      withBalconyAndStorage: [{ type: String, trim: true }]
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
