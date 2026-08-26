export const getLoanTourSteps = (t) => [
  // ===== FASE 1: Página principal =====
  {
    element: '#loans-page-container',
    popover: {
      title: t('tour.loans.overview.title', 'Loan Pipeline'),
      description: t('tour.loans.overview.description', 'Manage the complete mortgage loan lifecycle from application to closing. Track buyers, documents, stages, and deadlines in one place.'),
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#loans-kpi-strip',
    popover: {
      title: t('tour.loans.kpis.title', 'KPI Dashboard'),
      description: t('tour.loans.kpis.description', 'At-a-glance metrics: active loans, closings this week, overdue deadlines, missing docs, and more. Click any KPI to understand its meaning.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#loans-alerts-panel',
    popover: {
      title: t('tour.loans.alerts.title', 'Action Required Alerts'),
      description: t('tour.loans.alerts.description', 'Priority alerts for loans that need attention: closing deadlines approaching, missing documents, overdue tasks, or status changes requiring action.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#loans-toolbar',
    popover: {
      title: t('tour.loans.toolbar.title', 'Search & Create'),
      description: t('tour.loans.toolbar.description', 'Use the search box to find loans by buyer, lender, or property address. Use the "New Loan" button to register a new buyer financing.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#loans-filter-tabs',
    popover: {
      title: t('tour.loans.tabs.title', 'Stage Filters'),
      description: t('tour.loans.tabs.description', 'Filter loans by pipeline phase: Active, Processing, Underwriting, Closing, Completed, or Issues. The Issues tab shows loans with special status flags.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#loans-summary-table',
    popover: {
      title: t('tour.loans.table.title', 'Loans Table'),
      description: t('tour.loans.table.description', 'The main table shows all loans with key columns. Let me walk you through the anatomy of the first row.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#loans-row-first',
    popover: {
      title: t('tour.loans.row.title', 'Loan Row Anatomy'),
      description: t('tour.loans.row.description', 'Each row shows: Buyer (with avatar + email), Property/Apartment, Loan Amount + rate, Progress %, Pipeline Stage chip, Special Status, Assigned agent, and Est. Closing date.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#loans-col-borrower',
    popover: {
      title: t('tour.loans.colBorrower.title', 'Buyer Column'),
      description: t('tour.loans.colBorrower.description', 'Displays the borrower\'s name, avatar, and email. Click the row to open the loan detail page.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#loans-col-property',
    popover: {
      title: t('tour.loans.colProperty.title', 'Property / Apartment'),
      description: t('tour.loans.colProperty.description', 'Shows the linked unit: 🏠 Lot + Model for properties, or 🏢 Apt + Floor for apartments, along with project and price.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#loans-col-stage',
    popover: {
      title: t('tour.loans.colStage.title', 'Pipeline Stage'),
      description: t('tour.loans.colStage.description', 'A color-coded chip showing the current stage (Application, Processing, Underwriting, Closing, or Completed). Colors change by phase.'),
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#loans-col-closing',
    popover: {
      title: t('tour.loans.colClosing.title', 'Est. Closing Date'),
      description: t('tour.loans.colClosing.description', 'Shows the estimated closing date with a countdown (e.g., "5d left"). Turns red when overdue and orange when closing within 7 days.'),
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#loans-row-first',
    popover: {
      title: t('tour.loans.goDetail.title', 'Opening the Loan Detail'),
      description: t('tour.loans.goDetail.description', 'Click "Next" to navigate into the loan detail page, where you\'ll see the complete loan profile, documents, and timeline.'),
      side: 'top',
      align: 'start'
    }
  }
]

export const getLoanDetailTourSteps = (t) => [
  {
    element: '#loan-detail-header',
    popover: {
      title: t('tour.loanDetail.header.title', 'Loan Header'),
      description: t('tour.loanDetail.header.description', 'The header shows the buyer\'s name, project, linked unit, special status chip, and overall completion progress.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#loan-pipeline-visual',
    popover: {
      title: t('tour.loanDetail.pipeline.title', 'Pipeline Visualization'),
      description: t('tour.loanDetail.pipeline.description', 'A visual stepper of the loan lifecycle. Click any stage to advance or move the loan to that specific stage.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#loan-next-action',
    popover: {
      title: t('tour.loanDetail.nextAction.title', 'Next Critical Action'),
      description: t('tour.loanDetail.nextAction.description', 'Shows the most urgent pending task with its deadline and responsible person. Turns red when overdue and orange when due within 3 days.'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#loan-profile-form',
    popover: {
      title: t('tour.loanDetail.profile.title', 'Loan Profile'),
      description: t('tour.loanDetail.profile.description', 'Read-only view of the buyer, financial details, dates, and third parties. Click Edit to update any field, or change the pipeline stage / special status directly from the dropdowns.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#loan-document-checklist',
    popover: {
      title: t('tour.loanDetail.docs.title', 'Document Checklist'),
      description: t('tour.loanDetail.docs.description', 'The 27-document checklist tracks every required file: upload PDFs, mark statuses (Requested, Received, Missing, Approved), and download or delete files. Progress is tracked automatically.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#loan-timeline',
    popover: {
      title: t('tour.loanDetail.timeline.title', 'Activity Timeline'),
      description: t('tour.loanDetail.timeline.description', 'A chronological log of every action: stage changes, document uploads, notes added, status changes. Shows who did what and when.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#loan-notes',
    popover: {
      title: t('tour.loanDetail.notes.title', 'Internal Notes'),
      description: t('tour.loanDetail.notes.description', 'Add private team notes to the loan. Use Ctrl+Enter to save quickly. Notes are stored in the timeline for full audit trail.'),
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#loan-detail-header',
    popover: {
      title: t('tour.loanDetail.finish.title', 'You\'re all set!'),
      description: t('tour.loanDetail.finish.description', 'You now know the complete loan management flow. Use the back arrow to return to the pipeline view.'),
      side: 'bottom',
      align: 'start'
    }
  }
]

export const loanTourConfig = {
  id: 'loans-onboarding',
  autoStart: false
}

export const loanDetailTourConfig = {
  id: 'loan-detail-onboarding',
  autoStart: false
}