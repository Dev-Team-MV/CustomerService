import mongoose from 'mongoose'
import {
  VENDOR_CATEGORIES,
  VENDOR_SUBCATEGORIES,
  isSubcategoryOfCategory
} from '../constants/vendorTaxonomy.js'

export { VENDOR_CATEGORIES, VENDOR_SUBCATEGORIES }

const vendorLocationSchema = new mongoose.Schema(
  {
    formattedAddress: {
      type: String,
      required: [true, 'Location formattedAddress is required'],
      trim: true
    },
    placeId: {
      type: String,
      trim: true,
      default: null
    },
    lat: {
      type: Number,
      default: null
    },
    lng: {
      type: Number,
      default: null
    },
    label: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
)

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true
    },
    category: {
      type: String,
      enum: VENDOR_CATEGORIES,
      required: [true, 'Category is required'],
      index: true
    },
    subcategory: {
      type: String,
      enum: VENDOR_SUBCATEGORIES,
      required: [true, 'Subcategory is required'],
      index: true
    },
    contactPhones: {
      type: [
        {
          type: String,
          trim: true
        }
      ],
      validate: {
        validator (phones) {
          return Array.isArray(phones) && phones.length >= 1 && phones.every((p) => p && String(p).trim())
        },
        message: 'At least one contact phone is required'
      }
    },
    locations: {
      type: [vendorLocationSchema],
      default: []
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true
    },
    photo: {
      type: String,
      trim: true,
      default: null
    },
    website: {
      type: String,
      trim: true,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
    }
  },
  { timestamps: true }
)

vendorSchema.pre('validate', function validateCategorySubcategory (next) {
  if (this.category && this.subcategory && !isSubcategoryOfCategory(this.category, this.subcategory)) {
    this.invalidate(
      'subcategory',
      `Subcategory "${this.subcategory}" does not belong to category "${this.category}"`
    )
  }
  next()
})

vendorSchema.index({ category: 1, subcategory: 1 })
vendorSchema.index({ projectId: 1, status: 1 })
vendorSchema.index({ name: 'text' })
vendorSchema.index({ 'locations.formattedAddress': 1 })
vendorSchema.index({ 'locations.placeId': 1 })

const Vendor = mongoose.model('Vendor', vendorSchema)

export default Vendor
