import mongoose from 'mongoose'
import imageItemSchema from './schemas/imageItemSchema.js'

/**
 * Singleton: single document.
 * amenities: [{ id, name, images: [{ url, isPublic }] }, ...] — images per amenity.
 * isPublic: true = mostrar sin token; false = requiere token.
 */
const outdoorAmenitiesSchema = new mongoose.Schema(
  {
    amenities: {
      type: [
        {
          id: { type: Number, required: true },
          name: { type: String, default: '' },
          images: { type: [imageItemSchema], default: () => [] }
        }
      ],
      default: () => []
    }
  },
  {
    timestamps: true
  }
)

const OutdoorAmenities = mongoose.model('OutdoorAmenities', outdoorAmenitiesSchema)

export default OutdoorAmenities
