import mongoose from 'mongoose'

const targetsSchema = new mongoose.Schema(
  {
    leads: { type: Number, default: 0, min: 0 },
    conversions: { type: Number, default: 0, min: 0 },
    appointments: { type: Number, default: 0, min: 0 },
    smsCount: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
)

const agentTargetSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true,
      min: 2000
    },
    targets: {
      type: targetsSchema,
      default: () => ({})
    }
  },
  { timestamps: true }
)

agentTargetSchema.index({ agentId: 1, year: 1, month: 1 }, { unique: true })

export default mongoose.model('AgentTarget', agentTargetSchema)
