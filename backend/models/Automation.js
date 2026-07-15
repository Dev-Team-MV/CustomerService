import mongoose from 'mongoose'

export const AUTOMATION_TRIGGERS = [
  'lead_stage_changed',
  'payment_overdue',
  'appointment_created',
  'inactivity_7days'
]

export const AUTOMATION_ACTIONS = ['send_sms', 'create_activity', 'notify_agent']

const automationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ''
    },
    trigger: {
      type: String,
      enum: AUTOMATION_TRIGGERS,
      required: [true, 'Trigger is required']
    },
    condition: {
      stage: { type: String, trim: true },
      projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
      },
      daysInactive: {
        type: Number,
        min: 1,
        default: 7
      }
    },
    action: {
      type: String,
      enum: AUTOMATION_ACTIONS,
      required: [true, 'Action is required']
    },
    actionPayload: {
      templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SMSTemplate'
      },
      message: { type: String, trim: true },
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      title: { type: String, trim: true },
      description: { type: String, trim: true }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

automationSchema.index({ trigger: 1, isActive: 1 })

const Automation = mongoose.model('Automation', automationSchema)

export default Automation
