import mongoose from 'mongoose'
import Phase from './Phase.js'

const propertySchema = new mongoose.Schema(
  {
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lot',
      required: [true, 'Lot is required']
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Model',
      required: [true, 'Model is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    price: {
      type: Number,
      required: [true, 'Total price is required'],
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
      enum: ['active', 'pending', 'sold', 'cancelled'],
      default: 'pending'
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

propertySchema.virtual('payloads', {
  ref: 'Payload',
  localField: '_id',
  foreignField: 'property'
})

propertySchema.virtual('phases', {
  ref: 'Phase',
  localField: '_id',
  foreignField: 'property'
})

propertySchema.set('toJSON', { virtuals: true })
propertySchema.set('toObject', { virtuals: true })

// Mark document as new before saving
propertySchema.pre('save', function (next) {
  this._isNew = this.isNew
  next()
})

// Create 9 phases automatically when a new property is created
propertySchema.post('save', async function (doc) {
  // Only create phases if this was a new document
  if (this._isNew) {
    try {
      // Check if phases already exist for this property
      const existingPhases = await Phase.countDocuments({ property: doc._id })
      
      // Only create phases if they don't exist yet
      if (existingPhases === 0) {
        // Define the 9 phases with their titles and construction percentages
        const phasesData = [
          {
            phaseNumber: 1,
            title: 'Site Preparation and Groundbreaking',
            constructionPercentage: 10.00
          },
          {
            phaseNumber: 2,
            title: 'Foundation, Framing & Windows',
            constructionPercentage: 15.00
          },
          {
            phaseNumber: 3,
            title: 'Exterior Cladding and Roofing Installation',
            constructionPercentage: 15.00
          },
          {
            phaseNumber: 4,
            title: "All MEP's starts rough in work",
            constructionPercentage: 15.00
          },
          {
            phaseNumber: 5,
            title: 'Drywall Work and Paint',
            constructionPercentage: 10.00
          },
          {
            phaseNumber: 6,
            title: 'Flooring and Millwork',
            constructionPercentage: 10.00
          },
          {
            phaseNumber: 7,
            title: 'Kitchen and Bathrooms',
            constructionPercentage: 10.00
          },
          {
            phaseNumber: 8,
            title: 'Interior Finishes, Driveway Applainces & Landscaping',
            constructionPercentage: 10.00
          },
          {
            phaseNumber: 9,
            title: 'Inspections (Delays)',
            constructionPercentage: 5.00
          }
        ]
        
        const phasesToCreate = phasesData.map(phase => ({
          property: doc._id,
          phaseNumber: phase.phaseNumber,
          title: phase.title,
          constructionPercentage: phase.constructionPercentage,
          mediaItems: []
        }))
        
        // Insert all phases at once
        await Phase.insertMany(phasesToCreate)
      }
    } catch (error) {
      console.error('Error creating phases for property:', error)
    }
  }
})

const Property = mongoose.model('Property', propertySchema)

export default Property
