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

/**
 * Cada imagen puede ser pública (visible sin token) o solo con token.
 * isPublic: true = se puede mostrar sin token; false = requiere autenticación.
 */
const clubHouseImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    isPublic: { type: Boolean, default: true }
  },
  { _id: false }
)

const clubHouseSchema = new mongoose.Schema(
  {
    exterior: {
      type: [clubHouseImageSchema],
      default: () => []
    },
    blueprints: {
      type: [clubHouseImageSchema],
      default: () => []
    },
    interior: {
      type: mongoose.Schema.Types.Mixed,
      default: defaultInterior
    },
    /** Visibilidad por archivo en carpeta recorrido: { "recorrido.1.jpg": true, "recorrido.2.jpg": false } */
    recorridoVisibility: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
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
