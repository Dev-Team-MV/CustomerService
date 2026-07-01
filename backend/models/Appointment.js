import mongoose from 'mongoose'

export const APPOINTMENT_TYPES = ['visita', 'llamada', 'reunion', 'seguimiento']

export const APPOINTMENT_STATUSES = ['pendiente', 'confirmada', 'completada', 'cancelada']

const appointmentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: APPOINTMENT_TYPES,
      required: [true, 'Type is required']
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead'
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required']
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned user is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      default: 'pendiente'
    }
  },
  {
    timestamps: true
  }
)

appointmentSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    next(new Error('endDate must be on or after startDate'))
  } else {
    next()
  }
})

appointmentSchema.index({ assignedTo: 1, startDate: 1 })
appointmentSchema.index({ projectId: 1, startDate: 1 })
appointmentSchema.index({ status: 1, startDate: 1 })
appointmentSchema.index({ leadId: 1 })
appointmentSchema.index({ clientId: 1 })

const Appointment = mongoose.model('Appointment', appointmentSchema)

export default Appointment
