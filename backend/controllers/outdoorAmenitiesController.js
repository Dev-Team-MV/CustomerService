import OutdoorAmenities from '../models/OutdoorAmenities.js'

/**
 * GET Outdoor Amenities (singleton).
 * Returns document with sections: { sectionName: [urls], ... }.
 */
export const getOutdoorAmenities = async (req, res) => {
  try {
    let doc = await OutdoorAmenities.findOne()
    if (!doc) {
      doc = await OutdoorAmenities.create({ sections: {} })
    }
    res.json(doc)
  } catch (error) {
    console.error('OutdoorAmenities get error:', error)
    res.status(500).json({ message: error.message })
  }
}

/**
 * POST Outdoor Amenities.
 * Body (JSON): { section: string, urls: string[] }
 * Same as ClubHouse exterior images: one section and array of URLs.
 * Replaces that section's URLs (no append).
 */
export const setOutdoorAmenitiesSection = async (req, res) => {
  try {
    const { section, urls } = req.body

    if (!section || typeof section !== 'string') {
      return res.status(400).json({
        message: 'section is required and must be a string (e.g. Pool, BBQ, Gym)'
      })
    }

    const urlArray = Array.isArray(urls) ? urls.filter(u => typeof u === 'string') : []

    let doc = await OutdoorAmenities.findOne()
    if (!doc) {
      doc = await OutdoorAmenities.create({ sections: {} })
    }

    if (!doc.sections || typeof doc.sections !== 'object') {
      doc.sections = {}
    }
    doc.sections[section.trim()] = urlArray
    doc.markModified('sections')
    await doc.save()

    res.status(200).json({
      message: `Section "${section}" updated`,
      data: doc
    })
  } catch (error) {
    console.error('OutdoorAmenities post error:', error)
    res.status(500).json({ message: error.message })
  }
}
