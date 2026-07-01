import mongoose from 'mongoose'

export const LEAD_STAGES = [
  'nuevo',
  'contactado',
  'visita_agendada',
  'propuesta',
  'vendido',
  'perdido'
]

export const LEAD_SOURCES = ['web', 'referido', 'visita', 'llamada']

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    source: {
      type: String,
      enum: LEAD_SOURCES,
      default: 'web'
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    stage: {
      type: String,
      enum: LEAD_STAGES,
      default: 'nuevo'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true
    },
    lostReason: {
      type: String,
      trim: true
    },
    convertedToUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

leadSchema.index({ projectId: 1, stage: 1 })
leadSchema.index({ assignedTo: 1 })
leadSchema.index({ createdAt: -1 })

const Lead = mongoose.model('Lead', leadSchema)

export default Lead
