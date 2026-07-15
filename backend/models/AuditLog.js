import mongoose from 'mongoose'

export const AUDIT_ACTIONS = [
  'created',
  'updated',
  'deleted',
  'stage_changed',
  'sms_sent',
  'login',
  'impersonation_started',
  'impersonation_stopped'
]

export const AUDIT_ENTITIES = ['Lead', 'Client', 'Activity', 'Appointment', 'Campaign']

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    action: {
      type: String,
      enum: AUDIT_ACTIONS,
      required: true,
      index: true
    },
    entity: {
      type: String,
      enum: AUDIT_ENTITIES,
      required: true,
      index: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    changes: {
      before: { type: mongoose.Schema.Types.Mixed, default: null },
      after: { type: mongoose.Schema.Types.Mixed, default: null }
    },
    ip: {
      type: String,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: false }
)

auditLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 })
auditLogSchema.index({ userId: 1, timestamp: -1 })

export default mongoose.model('AuditLog', auditLogSchema)
