import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Project slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and hyphens only']
    },
    type: {
      type: String,
      enum: ['residential_lots', 'apartments', 'other'],
      default: 'residential_lots'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
)

projectSchema.index({ slug: 1 })
projectSchema.index({ isActive: 1 })

const Project = mongoose.model('Project', projectSchema)

export default Project
