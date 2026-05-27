import Phase from '../models/Phase.js'
import UnderConstruction from '../models/UnderConstruction.js'

// GET /api/reports/upload-tracker?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&types=properties,masterplan
export const getUploadTracker = async (req, res) => {
  try {
    const { startDate, endDate, types = 'properties,masterplan' } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' })
    }

    const start = new Date(startDate)
    start.setUTCHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setUTCHours(23, 59, 59, 999)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' })
    }

    const typeList = types.split(',').map((t) => t.trim())
    const result = {}

    // --- Properties ---
    if (typeList.includes('properties')) {
      const phases = await Phase.find({
        property: { $exists: true, $ne: null },
        'mediaItems.uploadedAt': { $gte: start, $lte: end }
      }).populate({
        path: 'property',
        select: 'lot model',
        populate: [
          { path: 'lot', select: 'number' },
          { path: 'model', select: 'model' }
        ]
      })

      const propertyMap = {}

      for (const phase of phases) {
        if (!phase.property) continue

        const prop = phase.property
        const propId = prop._id.toString()

        if (!propertyMap[propId]) {
          const lotNum = prop.lot?.number || '?'
          const modelName = prop.model?.model || '?'
          propertyMap[propId] = {
            id: propId,
            label: `Lot ${lotNum} - ${modelName}`,
            dates: {},
            media: {}
          }
        }

        for (const item of phase.mediaItems) {
          if (!item.uploadedAt) continue
          const d = new Date(item.uploadedAt)
          if (d < start || d > end) continue
          const dateKey = d.toISOString().split('T')[0]
          propertyMap[propId].dates[dateKey] = (propertyMap[propId].dates[dateKey] || 0) + 1
          if (!propertyMap[propId].media[dateKey]) propertyMap[propId].media[dateKey] = []
          propertyMap[propId].media[dateKey].push({
            type: item.mediaType || 'image',
            url: item.url,
            name: item.title || ''
          })
        }
      }

      result.properties = Object.values(propertyMap).sort((a, b) => a.label.localeCompare(b.label))
    }

    // --- Masterplan ---
    if (typeList.includes('masterplan')) {
      const allItems = await UnderConstruction.find({}, 'title _id').lean()

      const masterplan = []
      for (const item of allItems) {
        const parsed = new Date(item.title)
        if (isNaN(parsed.getTime())) continue
        parsed.setUTCHours(0, 0, 0, 0)
        if (parsed < start || parsed > end) continue
        masterplan.push({
          id: item._id.toString(),
          title: item.title,
          date: parsed.toISOString().split('T')[0]
        })
      }

      masterplan.sort((a, b) => a.date.localeCompare(b.date))
      result.masterplan = masterplan
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
