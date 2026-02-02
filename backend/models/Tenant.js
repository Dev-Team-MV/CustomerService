import mongoose from 'mongoose'

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tenant name is required'],
      trim: true
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
)

const Tenant = mongoose.model('Tenant', tenantSchema)

export default Tenant
