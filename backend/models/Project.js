import mongoose from 'mongoose'

const localizedStringSchema = {
  en: { type: String, trim: true },
  es: { type: String, trim: true }
}

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
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
    phase: {
      type: String,
      trim: true
    },
    title: {
      type: localizedStringSchema,
      default: () => ({})
    },
    subtitle: {
      type: localizedStringSchema,
      default: () => ({})
    },
    description: {
      type: localizedStringSchema,
      default: () => ({})
    },
    fullDescription: {
      type: localizedStringSchema,
      default: () => ({})
    },
    image: {
      type: String,
      trim: true
    },
    gallery: [{
      type: String,
      trim: true
    }],
    features: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    },
    type: {
      type: String,
      enum: ['residential_lots', 'apartments', 'other'],
      default: 'residential_lots'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'coming_soon', 'sold_out'],
      default: 'active'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    externalUrl: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    area: {
      type: String,
      trim: true
    },
    videos: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true
  }
)

projectSchema.index({ isActive: 1 })
projectSchema.index({ status: 1 })

/** Ensure localized fields always return full { en, es } structure (not just _id) */
const normalizeLocalized = (val) => {
  if (!val || typeof val !== 'object') return { en: '', es: '' }
  return {
    en: val.en != null ? String(val.en) : '',
    es: val.es != null ? String(val.es) : ''
  }
}

projectSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.title = normalizeLocalized(ret.title)
    ret.subtitle = normalizeLocalized(ret.subtitle)
    ret.description = normalizeLocalized(ret.description)
    ret.fullDescription = normalizeLocalized(ret.fullDescription)
    return ret
  }
})

const Project = mongoose.model('Project', projectSchema)

export default Project
