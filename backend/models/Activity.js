import mongoose from 'mongoose'

const activitySubtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Subtask title is required'],
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    dueDate: {
      type: Date
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    order: {
      type: Number,
      min: 0,
      default: 0
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

const activityThreadMessageSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'Thread message is required'],
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
)

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
    },
    relatedProjects: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
      }],
      default: []
    },
    subtasks: {
      type: [activitySubtaskSchema],
      default: []
    },
    threads: {
      type: [activityThreadMessageSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
)

activitySchema.index({ boardType: 1, projectId: 1, columnId: 1, position: 1 })
activitySchema.index({ boardType: 1, projectId: 1, dueDate: 1 })
activitySchema.index({ relatedProjects: 1 })

const Activity = mongoose.model('Activity', activitySchema)

export default Activity
