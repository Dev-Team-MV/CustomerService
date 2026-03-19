import mongoose from 'mongoose'

const floorPlanSchema = new mongoose.Schema(
  {
    floorNumber: {
      type: Number,
      required: true,
      min: 1
    },
    url: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: true }
)

const buildingSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required']
    },
    name: {
      type: String,
      required: [true, 'Building name is required'],
      trim: true
    },
    section: {
      type: String,
      trim: true
    },
    floors: {
      type: Number,
      required: [true, 'Number of floors is required'],
      min: 1
    },
    floorPlans: [floorPlanSchema],
    exteriorRenders: [{
      type: String,
      trim: true
    }],
    /** Polygon coordinates on master plan: [{ x, y }, ...] */
    polygon: [{
      x: { type: Number, required: true },
      y: { type: Number, required: true }
    }],
    totalApartments: {
      type: Number,
      min: 0
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

buildingSchema.index({ project: 1 })
buildingSchema.index({ project: 1, name: 1 }, { unique: true })

const Building = mongoose.model('Building', buildingSchema)

export default Building
