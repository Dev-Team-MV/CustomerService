import mongoose from 'mongoose'
import balconyOptionSchema from './Balcony.js'
import upgradeOptionSchema from './Upgrade.js'
import storageOptionSchema from './Storage.js'

const modelSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant is required']
    },
    model: {
      type: String,
      required: [true, 'Model name is required'],
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

// Nombre de modelo único por tenant
modelSchema.index({ tenant: 1, model: 1 }, { unique: true })

const Model = mongoose.model('Model', modelSchema)

export default Model
