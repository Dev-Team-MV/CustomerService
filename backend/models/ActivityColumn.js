import mongoose from 'mongoose'

export const DEFAULT_ACTIVITY_COLUMNS = [
  { key: 'backlog', name: 'Backlog', order: 0 },
  { key: 'todo', name: 'Por hacer', order: 1 },
  { key: 'in_progress', name: 'En progreso', order: 2 },
  { key: 'done', name: 'Hecho', order: 3 }
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
