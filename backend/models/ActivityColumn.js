import mongoose from 'mongoose'

export const DEFAULT_ACTIVITY_COLUMNS = [
  { key: 'backlog', name: 'Backlog', color: '#64748b', order: 0 },
  { key: 'todo', name: 'Por hacer', color: '#0ea5e9', order: 1 },
  { key: 'in_progress', name: 'En progreso', color: '#f59e0b', order: 2 },
  { key: 'done', name: 'Hecho', color: '#22c55e', order: 3 }
]

const activityColumnSchema = new mongoose.Schema(
  {
    boardType: {
      type: String,
      enum: ['project', 'global'],
      default: 'project',
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: function () {
        return this.boardType === 'project'
      }
    },
    key: {
      type: String,
      required: [true, 'Column key is required'],
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Column name is required'],
      trim: true
    },
    color: {
      type: String,
      trim: true,
      default: '#64748b',
      validate: {
        validator: function (value) {
          return /^#([A-Fa-f0-9]{6})$/.test(value)
        },
        message: 'Color must be a valid hex code like #9c27b0'
      }
    },
    order: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
)

activityColumnSchema.index({ boardType: 1, projectId: 1, key: 1 }, { unique: true })
activityColumnSchema.index({ boardType: 1, projectId: 1, order: 1 })

const ActivityColumn = mongoose.model('ActivityColumn', activityColumnSchema)

export default ActivityColumn
