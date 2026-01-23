import mongoose from 'mongoose'
import deckOptionSchema from './Deck.js'

const facadeSchema = new mongoose.Schema(
  {
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Model',
      required: [true, 'Model is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    url: {
      type: [String],
      required: [true, 'At least one URL is required'],
      validate: {
        validator: function(v) {
          return v && v.length > 0
        },
        message: 'At least one URL is required'
      }
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },
    decks: [deckOptionSchema]
  },
  {
    timestamps: true
  }
)

const Facade = mongoose.model('Facade', facadeSchema)

export default Facade
