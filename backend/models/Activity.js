import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema(
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
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ActivityColumn',
      required: [true, 'Column is required']
    },
    position: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    dueDate: {
      type: Date
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
)

activitySchema.index({ boardType: 1, projectId: 1, columnId: 1, position: 1 })
activitySchema.index({ boardType: 1, projectId: 1, dueDate: 1 })

const Activity = mongoose.model('Activity', activitySchema)

export default Activity
