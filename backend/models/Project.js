import mongoose from 'mongoose'
import imageItemSchema from './schemas/imageItemSchema.js'
import { COMMUNITY_SPACE_IDS } from '../constants/communitySpaceIds.js'

const localizedStringSchema = {
  en: { type: String, trim: true },
  es: { type: String, trim: true }
}

/** Planos / PDFs o imágenes de plano (misma idea que ImageItem + nombre opcional) */
const communityPlanoItemSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    isPublic: { type: Boolean, default: true },
    name: { type: String, trim: true, default: null }
  },
  { _id: false }
)

const communitySpaceSectionsSchema = new mongoose.Schema(
  {
    exterior: {
      title: { type: localizedStringSchema, default: () => ({}) },
      images: { type: [imageItemSchema], default: () => [] }
    },
    planos: {
      items: { type: [communityPlanoItemSchema], default: () => [] }
    }
  },
  { _id: false }
)

const communitySpaceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: [...COMMUNITY_SPACE_IDS]
    },
    label: { type: String, trim: true, default: '' },
    sections: { type: communitySpaceSectionsSchema, default: () => ({}) }
  },
  { _id: false }
)

const outdoorAmenitySectionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true, lowercase: true },
    images: { type: [imageItemSchema], default: () => [] }
  },
  { _id: false }
)

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
    }],
    outdoorAmenitySections: {
      type: [outdoorAmenitySectionSchema],
      default: () => []
    },
    /** Espacios tipo Ágora / Teatro / Club House (exterior + planos por proyecto) */
    communitySpaces: {
      type: [communitySpaceSchema],
      default: () => []
    }
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
