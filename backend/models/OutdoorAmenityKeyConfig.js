import mongoose from 'mongoose'

/** Singleton id: extra keys beyond built-in constants */
export const OUTDOOR_AMENITY_KEY_CONFIG_ID = 'default'

const outdoorAmenityKeyConfigSchema = new mongoose.Schema(
  {
    _id: { type: String, default: OUTDOOR_AMENITY_KEY_CONFIG_ID },
    extraKeys: { type: [String], default: () => [] }
  },
  {
    timestamps: true,
    collection: 'outdooramenitykeyconfigs'
  }
)

const OutdoorAmenityKeyConfig = mongoose.model('OutdoorAmenityKeyConfig', outdoorAmenityKeyConfigSchema)

export default OutdoorAmenityKeyConfig
