import mongoose from 'mongoose'

const propertyShareSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment'
    },
    sharedWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    familyGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyGroup',
      default: null
    }
  },
  {
    timestamps: true
  }
)

propertyShareSchema.pre('validate', function (next) {
  const hasProperty = this.property != null
  const hasApartment = this.apartment != null
  if (hasProperty === hasApartment) {
    next(new Error('Exactly one of property or apartment is required'))
  } else {
    next()
  }
})

propertyShareSchema.index({ property: 1, sharedWith: 1 }, { unique: true, sparse: true })
propertyShareSchema.index({ apartment: 1, sharedWith: 1 }, { unique: true, sparse: true })
propertyShareSchema.index({ sharedWith: 1 })
propertyShareSchema.index({ property: 1 }, { sparse: true })
propertyShareSchema.index({ apartment: 1 }, { sparse: true })
propertyShareSchema.index({ familyGroup: 1 })

const PropertyShare = mongoose.model('PropertyShare', propertyShareSchema)

export default PropertyShare
