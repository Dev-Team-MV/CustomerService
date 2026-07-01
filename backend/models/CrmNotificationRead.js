import mongoose from 'mongoose'

const CRM_NOTIFICATION_TYPES = ['overdue_payment', 'upcoming_activity', 'stale_lead']

const crmNotificationReadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    alertType: {
      type: String,
      enum: CRM_NOTIFICATION_TYPES,
      required: true
    },
    entityId: {
      type: String,
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

crmNotificationReadSchema.index({ userId: 1, alertType: 1, entityId: 1 }, { unique: true })

export { CRM_NOTIFICATION_TYPES }
export default mongoose.model('CrmNotificationRead', crmNotificationReadSchema)
