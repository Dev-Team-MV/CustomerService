import mongoose from 'mongoose'

const upgradeOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Upgrade name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Upgrade price is required'],
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
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
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { _id: true, timestamps: true })

export default upgradeOptionSchema
