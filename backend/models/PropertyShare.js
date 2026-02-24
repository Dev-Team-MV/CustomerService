import mongoose from 'mongoose'

const propertyShareSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true
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

// Un usuario no puede tener la misma propiedad compartida dos veces (por el mismo sharedBy no tiene sentido duplicar)
propertyShareSchema.index({ property: 1, sharedWith: 1 }, { unique: true })
propertyShareSchema.index({ sharedWith: 1 })
propertyShareSchema.index({ property: 1 })
propertyShareSchema.index({ familyGroup: 1 })

const PropertyShare = mongoose.model('PropertyShare', propertyShareSchema)

export default PropertyShare
