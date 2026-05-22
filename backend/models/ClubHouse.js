import mongoose from 'mongoose'

// Default interior amenities (match app UI: Indoor tabs)
const DEFAULT_INTERIOR_KEYS = [
  'Property Management',
  'Manager Office',
  'Meeting Room',
  'Mixed-use Room',
  'Bar',
  'Lounge',
  'Coworking',
  'Game Room',
  'Golf Simulator',
  'Terrace',
  'Gym',
  'Bathrooms & Lockers',
  'Laundry',
  'Concierge',
  'Catering',
  'Mural',
  'Boat Dock',
  'Mechanical Room',
  'Use-mixed Hallway',
  'Bathroom Hallway'
]

function defaultInterior () {
  const obj = {}
  DEFAULT_INTERIOR_KEYS.forEach(key => { obj[key] = [] })
  return obj
}

/**
 * Cada imagen puede ser pública (visible sin token) o solo con token.
 * isPublic: true = se puede mostrar sin token; false = requiere autenticación.
 * name: opcional, nombre custom para mostrar/gestionar en UI.
 */
const clubHouseImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    isPublic: { type: Boolean, default: true },
    name: { type: String, default: null }
  },
  { _id: false }
)

const clubHouseTimelineMediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['image', 'video']
    },
    url: { type: String, required: true, trim: true },
    name: { type: String, trim: true, default: '' },
    order: { type: Number, required: true, min: 1 },
    isPublic: { type: Boolean, default: true }
  },
  { _id: false }
)

const clubHouseTimelineItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    media: {
      type: [clubHouseTimelineMediaSchema],
      default: []
    },
    clubHouseDate: {
      type: Date,
      required: [true, 'Club house date is required']
    }
  }
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
    deck: {
      type: [clubHouseImageSchema],
      default: () => []
    },
    /** Visibilidad por archivo en carpeta recorrido: { "recorrido.1.jpg": true, "recorrido.2.jpg": false } */
    recorridoVisibility: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    },
    /**
     * Timeline exclusivo de Club House (independiente al under-construction global del proyecto).
     */
    clubHouseTimeline: {
      type: [clubHouseTimelineItemSchema],
      default: () => []
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
