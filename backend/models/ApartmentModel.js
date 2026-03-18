import mongoose from 'mongoose'

const apartmentModelSchema = new mongoose.Schema(
  {
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: [true, 'Building is required']
    },
    name: {
      type: String,
      required: [true, 'Model name is required'],
      trim: true
    },
    modelNumber: {
      type: String,
      trim: true
    },
    floorPlan: {
      type: String,
      trim: true
    },
    sqft: {
      type: Number,
      required: [true, 'Square footage is required'],
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
    apartmentCount: {
      type: Number,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
)

apartmentModelSchema.index({ building: 1 })
apartmentModelSchema.index({ building: 1, name: 1 }, { unique: true })

const ApartmentModel = mongoose.model('ApartmentModel', apartmentModelSchema)

export default ApartmentModel
