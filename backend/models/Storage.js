import mongoose from 'mongoose'
import imageItemSchema from './schemas/imageItemSchema.js'

const storageOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Storage name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Storage price is required'],
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  sqft: {
    type: Number,
    min: 0
  },
  images: {
    exterior: [imageItemSchema],
    interior: [imageItemSchema]
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { _id: true, timestamps: true })

export default storageOptionSchema
