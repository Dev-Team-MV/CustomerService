import mongoose from 'mongoose'

const parkingSpotSchema = new mongoose.Schema(
  {
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: [true, 'Building is required']
    },
    floorNumber: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: 1
    },
    code: {
      type: String,
      required: [true, 'Parking spot code is required'],
      trim: true
    },
    spotType: {
      type: String,
      enum: ['standard', 'covered', 'uncovered', 'tandem', 'motorcycle'],
      default: 'standard'
    },
    status: {
      type: String,
      enum: ['available', 'assigned', 'reserved', 'blocked'],
      default: 'available'
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

parkingSpotSchema.index({ building: 1, code: 1 }, { unique: true })
parkingSpotSchema.index({ building: 1, floorNumber: 1 })
parkingSpotSchema.index({ apartment: 1 })

const ParkingSpot = mongoose.model('ParkingSpot', parkingSpotSchema)

export default ParkingSpot
