import mongoose from 'mongoose'

export const ONBOARDING_STATUSES = ['not_started', 'in_progress', 'completed']

export const DEFAULT_ONBOARDING_ITEMS = [
  {
    key: 'contrato_firmado',
    label_en: 'Contract signed',
    label_es: 'Contrato firmado'
  },
  {
    key: 'ine_entregada',
    label_en: 'ID delivered',
    label_es: 'INE entregada'
  },
  {
    key: 'enganche_recibido',
    label_en: 'Down payment received',
    label_es: 'Enganche recibido'
  },
  {
    key: 'construccion_iniciada',
    label_en: 'Construction started',
    label_es: 'Construcción iniciada'
  },
  {
    key: 'recorrido_agendado',
    label_en: 'Walkthrough scheduled',
    label_es: 'Recorrido agendado'
  },
  {
    key: 'recorrido_completado',
    label_en: 'Walkthrough completed',
    label_es: 'Recorrido completado'
  },
  {
    key: 'llaves_entregadas',
    label_en: 'Keys delivered',
    label_es: 'Llaves entregadas'
  },
  {
    key: 'hoa_inscrito',
    label_en: 'HOA registered',
    label_es: 'HOA inscrito'
  }
]

const checklistItemSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true
    },
    label_en: {
      type: String,
      required: true,
      trim: true
    },
    label_es: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    requiredDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null
    }
  },
  { _id: false }
)

const onboardingChecklistSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'propertyId is required'],
      index: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'clientId is required'],
      index: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'projectId is required'],
      index: true
    },
    items: {
      type: [checklistItemSchema],
      default: () =>
        DEFAULT_ONBOARDING_ITEMS.map((item) => ({
          ...item,
          completed: false,
          completedAt: null,
          completedBy: null,
          notes: '',
          requiredDocumentId: null
        }))
    },
    status: {
      type: String,
      enum: ONBOARDING_STATUSES,
      default: 'not_started',
      index: true
    }
  },
  {
    timestamps: true
  }
)

onboardingChecklistSchema.index({ propertyId: 1, clientId: 1 }, { unique: true })
onboardingChecklistSchema.index({ projectId: 1, status: 1 })

export function buildDefaultOnboardingItems() {
  return DEFAULT_ONBOARDING_ITEMS.map((item) => ({
    ...item,
    completed: false,
    completedAt: null,
    completedBy: null,
    notes: '',
    requiredDocumentId: null
  }))
}

const OnboardingChecklist = mongoose.model('OnboardingChecklist', onboardingChecklistSchema)

export default OnboardingChecklist
