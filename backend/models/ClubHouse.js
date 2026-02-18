import mongoose from 'mongoose'

// Default interior amenities (match app UI: Indoor tabs)
const DEFAULT_INTERIOR_KEYS = [
  'Reception',
  'Managers Office',
  'Conference Room',
  'Multi-Purpose Room',
  'Bar',
  'Lounge',
  'Coworking',
  'Game Room',
  'Golf Simulator',
  'Terrace',
  'Gym',
  'Bathrooms',
  'Laundry',
  'Counter',
  'Catering',
  'Mural'
]

function defaultInterior () {
  const obj = {}
  DEFAULT_INTERIOR_KEYS.forEach(key => { obj[key] = [] })
  return obj
}

const clubHouseSchema = new mongoose.Schema(
  {
    exterior: {
      type: [String],
      default: () => []
    },
    blueprints: {
      type: [String],
      default: () => []
    },
    interior: {
      type: mongoose.Schema.Types.Mixed,
      default: defaultInterior
    }
  },
  {
    timestamps: true
  }
)

// Singleton: we only ever have one ClubHouse document
const ClubHouse = mongoose.model('ClubHouse', clubHouseSchema)

export default ClubHouse
export { DEFAULT_INTERIOR_KEYS }
