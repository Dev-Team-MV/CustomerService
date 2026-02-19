import mongoose from 'mongoose'

/**
 * Singleton: single document.
 * sections: { "Pool": [url1, url2], "BBQ": [url1], ... } — same shape as ClubHouse exterior by section.
 */
const outdoorAmenitiesSchema = new mongoose.Schema(
  {
    sections: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
)

const OutdoorAmenities = mongoose.model('OutdoorAmenities', outdoorAmenitiesSchema)

export default OutdoorAmenities
