import mongoose from 'mongoose'

const floorPlanPolygonSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true
    },
    points: [{
      type: Number
    }],
    apartmentModel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApartmentModel',
      default: null
    },
    color: {
      type: String,
      trim: true,
      default: '#8CA551'
    },
    name: {
      type: String,
      trim: true
    }
  },
  { _id: false }
)

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
    },
    polygons: {
      type: [floorPlanPolygonSchema],
      default: []
    }
  },
  { _id: true }
)

const buildingFloorPolygonSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true
    },
    floorNumber: {
      type: Number,
      required: true,
      min: 1
    },
    points: [{
      type: Number
    }],
    color: {
      type: String,
      trim: true,
      default: '#8CA551'
    },
    name: {
      type: String,
      trim: true
    },
    isCommercial: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
)

const availabilityLockSchema = new mongoose.Schema(
  {
    quoteId: {
      type: String,
      required: true,
      trim: true
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    lockedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  { _id: false }
)

const assignmentSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    assignedAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
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
    /** Master plan polygon visual style */
    polygonColor: {
      type: String,
      trim: true,
      default: '#8CA551'
    },
    polygonStrokeColor: {
      type: String,
      trim: true,
      default: '#1F2937'
    },
    polygonOpacity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.35
    },
    /** Exterior building render polygons to select floors */
    buildingFloorPolygons: {
      type: [buildingFloorPolygonSchema],
      default: []
    },
    /** Mapping técnico para quote desde master plan (casas). */
    quoteRef: {
      lot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lot',
        default: null
      },
      model: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Model',
        default: null
      },
      facade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facade',
        default: null
      }
    },
    totalApartments: {
      type: Number,
      min: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'quote_locked', 'reserved', 'assigned', 'sold', 'disabled'],
      default: 'available'
    },
    availabilityReason: {
      type: String,
      trim: true,
      default: ''
    },
    availabilityLock: {
      type: availabilityLockSchema,
      default: null
    },
    assignment: {
      type: assignmentSchema,
      default: null
    }
  },
  {
    timestamps: true
  }
)

buildingSchema.index({ project: 1 })
buildingSchema.index({ project: 1, name: 1 }, { unique: true })
buildingSchema.index({ project: 1, availabilityStatus: 1 })

const Building = mongoose.model('Building', buildingSchema)

export default Building
