import Loan from '../models/Loan.js'
import { isValidObjectId } from '../utils/crmHelpers.js'

const MS_DAY = 24 * 60 * 60 * 1000
const TERMINAL_STATUSES = ['loan_denied', 'buyer_withdrawn', 'cancelled']
const APPRAISAL_STAGES = ['appraisal_ordered', 'appraisal_scheduled']

function addDays(date, days) {
  return new Date(date.getTime() + days * MS_DAY)
}

function buyerName(loan) {
  const buyer = loan.buyer
  if (!buyer || typeof buyer !== 'object') return 'Unknown buyer'
  const name = [buyer.firstName, buyer.lastName].filter(Boolean).join(' ').trim()
  return name || buyer.email || 'Unknown buyer'
}

function isInactive(loan) {
  if (loan.pipelineStage === 'completed') return true
  return TERMINAL_STATUSES.includes(loan.specialStatus)
}

function buildAlert(type, loan, description, extra = {}) {
  return {
    type,
    loanId: loan._id,
    buyerName: buyerName(loan),
    description,
    pipelineStage: loan.pipelineStage,
    specialStatus: loan.specialStatus || null,
    ...extra
  }
}

export async function computeLoanAlerts({ projectId } = {}) {
  const filter = {}
  if (projectId) {
    if (!isValidObjectId(projectId)) {
      return { error: 'Invalid projectId' }
    }
    filter.projectId = projectId
  }

  const now = new Date()
  const requestedBefore = addDays(now, -3)
  const deadlineSoon = addDays(now, 3)
  const staleBefore = addDays(now, -7)
  const appraisalBefore = addDays(now, -5)
  const conditionsBefore = addDays(now, -5)
  const closingSoon = addDays(now, 7)
  const fundedSince = addDays(now, -1)

  const loans = await Loan.find(filter)
    .populate('buyer', 'firstName lastName email')
    .select(
      'buyer pipelineStage specialStatus stageEnteredAt nextAction estimatedClosingDate documentChecklist'
    )
    .lean()

  const byType = {
    missingDocuments: [],
    deadlineApproaching: [],
    deadlineOverdue: [],
    staleStage: [],
    appraisalPending: [],
    conditionsOutstanding: [],
    closingApproaching: [],
    clearToClose: [],
    loanFunded: []
  }

  for (const loan of loans) {
    const inactive = isInactive(loan)

    if (!inactive) {
      const overdueDocs = (loan.documentChecklist || []).filter(
        (doc) =>
          doc.status === 'requested' &&
          doc.statusChangedAt &&
          new Date(doc.statusChangedAt) < requestedBefore
      )
      if (overdueDocs.length) {
        byType.missingDocuments.push(
          buildAlert(
            'missing_documents',
            loan,
            `${overdueDocs.length} document(s) requested for more than 3 days`,
            { documentTypes: overdueDocs.map((d) => d.documentType) }
          )
        )
      }

      const deadline = loan.nextAction?.deadline ? new Date(loan.nextAction.deadline) : null
      if (deadline && !Number.isNaN(deadline.getTime())) {
        if (deadline < now) {
          byType.deadlineOverdue.push(
            buildAlert(
              'deadline_overdue',
              loan,
              `Next action overdue: ${loan.nextAction.description || 'No description'}`,
              { deadline: loan.nextAction.deadline }
            )
          )
        } else if (deadline <= deadlineSoon) {
          byType.deadlineApproaching.push(
            buildAlert(
              'deadline_approaching',
              loan,
              `Next action due within 3 days: ${loan.nextAction.description || 'No description'}`,
              { deadline: loan.nextAction.deadline }
            )
          )
        }
      }

      if (loan.stageEnteredAt && new Date(loan.stageEnteredAt) < staleBefore) {
        byType.staleStage.push(
          buildAlert(
            'stale_stage',
            loan,
            `Same pipeline stage for more than 7 days: ${loan.pipelineStage}`,
            { stageEnteredAt: loan.stageEnteredAt }
          )
        )
      }

      if (
        APPRAISAL_STAGES.includes(loan.pipelineStage) &&
        loan.stageEnteredAt &&
        new Date(loan.stageEnteredAt) < appraisalBefore
      ) {
        byType.appraisalPending.push(
          buildAlert(
            'appraisal_pending',
            loan,
            `Appraisal stage ${loan.pipelineStage} for more than 5 days`,
            { stageEnteredAt: loan.stageEnteredAt }
          )
        )
      }

      if (
        loan.pipelineStage === 'conditional_approval' &&
        loan.stageEnteredAt &&
        new Date(loan.stageEnteredAt) < conditionsBefore
      ) {
        byType.conditionsOutstanding.push(
          buildAlert(
            'conditions_outstanding',
            loan,
            'Conditional approval outstanding for more than 5 days',
            { stageEnteredAt: loan.stageEnteredAt }
          )
        )
      }

      const closing = loan.estimatedClosingDate ? new Date(loan.estimatedClosingDate) : null
      if (closing && !Number.isNaN(closing.getTime()) && closing >= now && closing <= closingSoon) {
        byType.closingApproaching.push(
          buildAlert(
            'closing_approaching',
            loan,
            'Estimated closing date is within 7 days',
            { estimatedClosingDate: loan.estimatedClosingDate }
          )
        )
      }
    }

    if (loan.pipelineStage === 'clear_to_close') {
      byType.clearToClose.push(
        buildAlert('clear_to_close', loan, 'Clear to Close received')
      )
    }

    if (
      loan.pipelineStage === 'loan_funded' &&
      loan.stageEnteredAt &&
      new Date(loan.stageEnteredAt) >= fundedSince
    ) {
      byType.loanFunded.push(
        buildAlert('loan_funded', loan, 'Loan funded in the last 24 hours', {
          stageEnteredAt: loan.stageEnteredAt
        })
      )
    }
  }

  const alerts = [
    ...byType.missingDocuments,
    ...byType.deadlineApproaching,
    ...byType.deadlineOverdue,
    ...byType.staleStage,
    ...byType.appraisalPending,
    ...byType.conditionsOutstanding,
    ...byType.closingApproaching,
    ...byType.clearToClose,
    ...byType.loanFunded
  ]

  return {
    alerts,
    byType,
    counts: {
      missingDocuments: byType.missingDocuments.length,
      deadlineApproaching: byType.deadlineApproaching.length,
      deadlineOverdue: byType.deadlineOverdue.length,
      staleStage: byType.staleStage.length,
      appraisalPending: byType.appraisalPending.length,
      conditionsOutstanding: byType.conditionsOutstanding.length,
      closingApproaching: byType.closingApproaching.length,
      clearToClose: byType.clearToClose.length,
      loanFunded: byType.loanFunded.length,
      total: alerts.length
    }
  }
}
