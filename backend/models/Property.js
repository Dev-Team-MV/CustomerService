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
    facade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facade',
      required: [true, 'Facade is required']
    },
    users: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      required: [true, 'At least one owner is required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Property must have at least one owner'
      }
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
    },
    // Opciones de configuración del modelo
    hasBalcony: {
      type: Boolean,
      default: false
    },
    modelType: {
      type: String,
      enum: ['basic', 'upgrade'],
      default: 'basic'
    },
    hasStorage: {
      type: Boolean,
      default: false
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

// Virtual for calculating total construction percentage based on phases
propertySchema.virtual('totalConstructionPercentage').get(function() {
  // Phase weights (percentage of total construction each phase represents)
  const phaseWeights = {
    1: 10.00,  // Site Preparation and Groundbreaking
    2: 15.00,  // Foundation, Framing & Windows
    3: 15.00,  // Exterior Cladding and Roofing Installation
    4: 15.00,  // All MEP's starts rough in work
    5: 10.00,  // Drywall Work and Paint
    6: 10.00,  // Flooring and Millwork
    7: 10.00,  // Kitchen and Bathrooms
    8: 10.00,  // Interior Finishes, Driveway Applainces & Landscaping
    9: 5.00    // Inspections (Delays)
  }
  
  // If phases are populated, calculate the total percentage
  if (this.phases && Array.isArray(this.phases) && this.phases.length > 0) {
    let totalPercentage = 0
    
    this.phases.forEach(phase => {
      const weight = phaseWeights[phase.phaseNumber] || 0
      const phaseCompletion = phase.constructionPercentage || 0
      // Contribution = (phase completion % * phase weight) / 100
      totalPercentage += (phaseCompletion * weight) / 100
    })
    
    // Round to 2 decimal places
    return Math.round(totalPercentage * 100) / 100
  }
  
  return 0
})

propertySchema.set('toJSON', { virtuals: true })
propertySchema.set('toObject', { virtuals: true })

// Instance method to calculate total construction percentage
// This method can be called even when phases are not populated
propertySchema.methods.calculateTotalConstructionPercentage = async function() {
  const phaseWeights = {
    1: 10.00,
    2: 15.00,
    3: 15.00,
    4: 15.00,
    5: 10.00,
    6: 10.00,
    7: 10.00,
    8: 10.00,
    9: 5.00
  }
  
  // If phases are already populated, use them
  if (this.phases && Array.isArray(this.phases) && this.phases.length > 0) {
    let totalPercentage = 0
    
    this.phases.forEach(phase => {
      const weight = phaseWeights[phase.phaseNumber] || 0
      const phaseCompletion = phase.constructionPercentage || 0
      totalPercentage += (phaseCompletion * weight) / 100
    })
    
    return Math.round(totalPercentage * 100) / 100
  }
  
  // Otherwise, fetch phases from database
  const phases = await Phase.find({ property: this._id })
  let totalPercentage = 0
  
  phases.forEach(phase => {
    const weight = phaseWeights[phase.phaseNumber] || 0
    const phaseCompletion = phase.constructionPercentage || 0
    totalPercentage += (phaseCompletion * weight) / 100
  })
  
  return Math.round(totalPercentage * 100) / 100
}

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
