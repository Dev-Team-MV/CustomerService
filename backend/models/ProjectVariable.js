import mongoose from 'mongoose'

const projectVariableSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required']
    },
    name: {
      type: String,
      required: [true, 'Variable name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters']
    },
    recorrido: {
      type: String,
      required: [true, 'Recorrido is required'],
      trim: true,
      maxlength: [200, 'Recorrido cannot exceed 200 characters']
    },
    categoria: {
      type: String,
      required: [true, 'Categoria is required'],
      trim: true,
      maxlength: [80, 'Categoria cannot exceed 80 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

projectVariableSchema.index({ project: 1, name: 1 }, { unique: true })
projectVariableSchema.index({ project: 1, categoria: 1 })

const ProjectVariable = mongoose.model('ProjectVariable', projectVariableSchema)

export default ProjectVariable
