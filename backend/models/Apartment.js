import mongoose from 'mongoose'
import Phase from './Phase.js'

const apartmentSchema = new mongoose.Schema(
  {
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      default: null
    },
    apartmentModel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApartmentModel',
      required: [true, 'Apartment model is required']
    },
    floorNumber: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: 1
    },
    apartmentNumber: {
      type: String,
      required: [true, 'Apartment number is required'],
      trim: true
    },
    floorPlanPolygonId: {
      type: String,
      trim: true,
      default: null
    },
    interiorRendersBasic: [{
      type: String,
      trim: true
    }],
    interiorRendersUpgrade: [{
      type: String,
      trim: true
    }],
    selectedRenderType: {
      type: String,
      enum: ['basic', 'upgrade'],
      default: 'basic'
    },
    /** Polygon on floor plan: [{ x, y }, ...] */
    polygon: [{
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    }],
    users: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v),
        message: 'Users must be an array'
      }
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },
    pending: {
      type: Number,
      required: [true, 'Pending amount is required'],
      min: 0
    },
    initialPayment: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['available', 'pending', 'sold', 'cancelled'],
      default: 'available'
    },
    saleDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

apartmentSchema.index({ apartmentModel: 1 })
apartmentSchema.index({ apartmentModel: 1, apartmentNumber: 1 }, { unique: true })
apartmentSchema.index({ users: 1 })
apartmentSchema.index({ building: 1, floorNumber: 1, floorPlanPolygonId: 1 }, {
  unique: true,
  partialFilterExpression: {
    floorPlanPolygonId: { $exists: true, $ne: null, $type: 'string' }
  }
})

apartmentSchema.virtual('payloads', {
  ref: 'Payload',
  localField: '_id',
  foreignField: 'apartment'
})

apartmentSchema.virtual('phases', {
  ref: 'Phase',
  localField: '_id',
  foreignField: 'apartment'
})

apartmentSchema.virtual('parkingSpots', {
  ref: 'ParkingSpot',
  localField: '_id',
  foreignField: 'apartment'
})

apartmentSchema.virtual('totalConstructionPercentage').get(function () {
  if (this.phases && Array.isArray(this.phases) && this.phases.length > 0) {
    const phaseWeights = {
      1: 10.00, 2: 15.00, 3: 15.00, 4: 15.00, 5: 10.00,
      6: 10.00, 7: 10.00, 8: 10.00, 9: 5.00
    }
    let total = 0
    this.phases.forEach(phase => {
      const weight = phaseWeights[phase.phaseNumber] || 0
      total += (phase.constructionPercentage * weight) / 100
    })
    return Math.round(total * 100) / 100
  }
  return 0
})

apartmentSchema.set('toJSON', { virtuals: true })
apartmentSchema.set('toObject', { virtuals: true })

apartmentSchema.pre('save', function (next) {
  this._isNew = this.isNew
  next()
})

// Create 9 phases when new apartment is created
apartmentSchema.post('save', async function (doc) {
  if (this._isNew) {
    try {
      const existingPhases = await Phase.countDocuments({ apartment: doc._id })
      if (existingPhases === 0) {
        const phasesData = [
          { phaseNumber: 1, title: 'Site Preparation and Groundbreaking', constructionPercentage: 0 },
          { phaseNumber: 2, title: 'Foundation, Framing & Windows', constructionPercentage: 0 },
          { phaseNumber: 3, title: 'Exterior Cladding and Roofing Installation', constructionPercentage: 0 },
          { phaseNumber: 4, title: "All MEP's starts rough in work", constructionPercentage: 0 },
          { phaseNumber: 5, title: 'Drywall Work and Paint', constructionPercentage: 0 },
          { phaseNumber: 6, title: 'Flooring and Millwork', constructionPercentage: 0 },
          { phaseNumber: 7, title: 'Kitchen and Bathrooms', constructionPercentage: 0 },
          { phaseNumber: 8, title: 'Interior Finishes, Driveway Applainces & Landscaping', constructionPercentage: 0 },
          { phaseNumber: 9, title: 'Inspections (Delays)', constructionPercentage: 0 }
        ]
        await Phase.insertMany(phasesData.map(p => ({
          apartment: doc._id,
          phaseNumber: p.phaseNumber,
          title: p.title,
          constructionPercentage: p.constructionPercentage,
          mediaItems: []
        })))
      }
    } catch (error) {
      console.error('Error creating phases for apartment:', error)
    }
  }
})

const Apartment = mongoose.model('Apartment', apartmentSchema)

export default Apartment
