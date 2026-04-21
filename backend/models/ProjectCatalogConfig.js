import mongoose from 'mongoose'

const pricingConditionSchema = new mongoose.Schema(
  {
    field: { type: String, required: true, trim: true },
    operator: {
      type: String,
      required: true,
      enum: ['eq', 'neq', 'in', 'not_in', 'gt', 'gte', 'lt', 'lte', 'truthy', 'falsy']
    },
    value: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  { _id: false }
)

const pricingApplySchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ['fixed', 'percentage'] },
    amount: { type: Number, required: true },
    code: { type: String, trim: true, default: '' },
    label: { type: String, trim: true, default: '' }
  },
  { _id: false }
)

const pricingRuleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    priority: { type: Number, default: 100, min: 0 },
    enabled: { type: Boolean, default: true },
    when: { type: [pricingConditionSchema], default: () => [] },
    apply: { type: pricingApplySchema, required: true }
  },
  { _id: false }
)

const projectCatalogConfigSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required']
    },
    version: {
      type: Number,
      required: [true, 'Version is required'],
      min: 1
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    isActiveVersion: {
      type: Boolean,
      default: false
    },
    catalogType: {
      type: String,
      enum: ['houses', 'apartments', 'mixed'],
      required: [true, 'catalogType is required']
    },
    structure: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    },
    assetsSchema: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({})
    },
    pricingRules: {
      type: [pricingRuleSchema],
      default: () => []
    }
  },
  { timestamps: true }
)

projectCatalogConfigSchema.index({ project: 1, version: 1 }, { unique: true })
projectCatalogConfigSchema.index(
  { project: 1, isActiveVersion: 1 },
  { unique: true, partialFilterExpression: { isActiveVersion: true } }
)
projectCatalogConfigSchema.index({ project: 1, status: 1, version: -1 })

const ProjectCatalogConfig = mongoose.model('ProjectCatalogConfig', projectCatalogConfigSchema)

export default ProjectCatalogConfig
