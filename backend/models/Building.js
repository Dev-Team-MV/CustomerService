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
    /** Exterior building render polygons to select floors */
    buildingFloorPolygons: {
      type: [buildingFloorPolygonSchema],
      default: []
    },
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
