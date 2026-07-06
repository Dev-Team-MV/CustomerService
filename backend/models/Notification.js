import mongoose from 'mongoose'

const NOTIFICATION_TYPES = ['INFO', 'WARN', 'ERROR', 'CUSTOM']
const USER_ROLES = ['superadmin', 'admin', 'owner', 'user']

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    body: {
      type: String,
      trim: true,
      default: ''
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: 'INFO'
    },
    audience: {
      type: String,
      enum: USER_ROLES
    },
    targetUserIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    targetRoles: [{
      type: String,
      enum: USER_ROLES
    }],
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null
    },
    payload: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
)

notificationSchema.index({ createdAt: -1 })
notificationSchema.index({ targetUserIds: 1, createdAt: -1 })
notificationSchema.index({ targetRoles: 1, createdAt: -1 })
notificationSchema.index({ audience: 1, createdAt: -1 })
notificationSchema.index({ projectId: 1, createdAt: -1 })
notificationSchema.index({ type: 1, 'payload.fingerprint': 1 })

export { NOTIFICATION_TYPES, USER_ROLES }
export default mongoose.model('Notification', notificationSchema)
