import mongoose from 'mongoose'

/**
 * Singleton: single document.
 * amenities: [{ id, name, images: [urls] }, ...] — images per amenity.
 */
const outdoorAmenitiesSchema = new mongoose.Schema(
  {
    amenities: {
      type: [
        {
          id: { type: Number, required: true },
          name: { type: String, default: '' },
          images: { type: [String], default: () => [] }
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
