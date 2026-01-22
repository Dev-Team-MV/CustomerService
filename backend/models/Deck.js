import mongoose from 'mongoose'

const deckOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Deck name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Deck price is required'],
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { _id: true, timestamps: true })

export default deckOptionSchema
