import mongoose from 'mongoose'

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  },
  { _id: false }
)

const familyGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: {
      type: [memberSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
)

// Índices para consultas frecuentes
familyGroupSchema.index({ createdBy: 1 })
familyGroupSchema.index({ 'members.user': 1 })

const FamilyGroup = mongoose.model('FamilyGroup', familyGroupSchema)

export default FamilyGroup
