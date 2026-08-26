import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box, Button, Typography, TextField, InputAdornment, Snackbar, Alert, Tabs, Tab
} from '@mui/material'
import { Search, Add } from '@mui/icons-material'
import { motion } from 'framer-motion'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import LoanKPIStrip from '../components/loans/LoanKPIStrip'
import LoanAlertsPanel from '../components/loans/LoanAlertsPanel'
import LoanSummaryTable from '../components/loans/LoanSummaryTable'
import LoanFormDialog from '../components/loans/LoanFormDialog'
import useLoans from '../constants/hooks/useLoans'

// ✅ TOUR IMPORTS
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getLoanTourSteps, loanTourConfig } from '../tours/modules/loanTour'

const FILTER_TABS = [
  { key: 'all' },
  { key: 'active' },
  { key: 'processing' },
  { key: 'underwriting' },
  { key: 'closing' },
  { key: 'completed' },
  { key: 'issues' }
]

const STAGE_GROUPS = {
  active: ['new_loan_buyer_added', 'loan_application_sent', 'loan_application_started', 'loan_application_completed', 'initial_documents_requested', 'documents_received', 'documents_missing_pending', 'pre_qualification_in_review', 'pre_qualified', 'pre_approval_in_review', 'pre_approved'],
  processing: ['property_unit_selected', 'purchase_contract_executed', 'contract_sent_to_lender', 'loan_estimate_issued', 'disclosures_sent', 'disclosures_signed', 'processing', 'additional_documents_requested'],
  underwriting: ['submitted_to_underwriting', 'underwriting_review', 'conditional_approval', 'conditions_outstanding', 'conditions_submitted', 'appraisal_ordered', 'appraisal_scheduled', 'appraisal_completed', 'appraisal_received', 'appraisal_approved', 'title_ordered_title_review', 'insurance_requested', 'insurance_received', 'final_underwriting'],
  closing: ['clear_to_close', 'closing_disclosure_issued', 'closing_disclosure_signed', 'closing_scheduled', 'buyer_funds_due', 'closing_documents_signed', 'loan_funded', 'title_confirmed_closed'],
  completed: ['completed'],
  issues: []
}

const ISSUE_STATUSES = ['on_hold', 'buyer_action_required', 'lender_action_required', 'developer_action_required', 'missing_documents', 'financing_issue', 'appraisal_issue', 'title_issue', 'loan_denied', 'buyer_withdrawn', 'cancelled']

export default function Loans() {
  const { t } = useTranslation('loans')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const {
    loans, loading, error,
    createLoan, dashboardKPIs, alerts,
    fetchDashboardKPIs, fetchAlerts
  } = useLoans()

  // ✅ TOUR STATE
  const { startTour, pauseTour } = useTour()
const tourSteps = useMemo(() => getLoanTourSteps(tCommon), [tCommon])
  const tourOptionsRef = useRef(null)

  const [search, setSearch] = useState('')
  const [tabIndex, setTabIndex] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [pendingTourLoanId, setPendingTourLoanId] = useState(null)

  useEffect(() => {
    fetchDashboardKPIs()
    fetchAlerts()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    let result = loans || []
    const tab = FILTER_TABS[tabIndex]?.key
    if (tab && tab !== 'all') {
      if (tab === 'issues') result = result.filter(l => ISSUE_STATUSES.includes(l.specialStatus))
      else if (STAGE_GROUPS[tab]) result = result.filter(l => STAGE_GROUPS[tab].includes(l.pipelineStage))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(l => {
        const buyer = l.buyer
        const buyerName = buyer && typeof buyer === 'object'
          ? `${buyer.firstName || ''} ${buyer.lastName || ''} ${buyer.email || ''}`.toLowerCase()
          : ''
        return buyerName.includes(q) ||
          l.propertyAddress?.toLowerCase().includes(q) ||
          l.lender?.toLowerCase().includes(q) ||
          l.pipelineStage?.toLowerCase().includes(q)
      })
    }
    return result
  }, [loans, tabIndex, search])

  const handleCreate = async (data) => {
    try {
      await createLoan(data)
      setSnackbar({ open: true, message: t('loans.snackbar.created'), severity: 'success' })
      fetchDashboardKPIs()
      fetchAlerts()
      setDialogOpen(false)
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || t('loans.snackbar.createError'), severity: 'error' })
    }
  }

  // ✅ Handler del tour para el último paso (navega a detalles)
  const handleTourNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    const totalSteps = tourSteps.length

    // Último paso: navegar al detalle del primer loan
    if (currentIndex === totalSteps - 1) {
      const firstLoan = filtered[0]
      if (firstLoan?._id) {
        pauseTour()
        setPendingTourLoanId(firstLoan._id)
        // Guardamos en sessionStorage para que LoanDetail sepa que debe auto-iniciar el tour
        sessionStorage.setItem('start-loan-detail-tour', firstLoan._id)
        navigate(`/loans/${firstLoan._id}`)
      }
      return
    }

    driverObj.moveNext()
  }

  const tourOptions = {
    onNextClick: handleTourNextClick,
    onPrevClick: (driverObj) => driverObj.movePrevious()
  }
  tourOptionsRef.current = tourOptions

  const handleViewLoan = (loan) => {
    navigate(`/loans/${loan._id}`)
  }

  const handleAlertClick = (alert) => {
    if (alert.loanId) navigate(`/loans/${alert.loanId}`)
  }

  return (
    <PageLayout
      title={t('loans.title')}
      titleBold={t('loans.titleBold')}
      topbarLabel={t('loans.tabs.all')}
      subtitle={t('loans.subtitle')}
    >
      {/* ✅ ID principal del contenedor */}
      <Box id="loans-page-container" sx={{ p: { xs: 2, sm: 3 } }}>

        {/* ✅ TOUR BUTTON */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <TourButton
            tourId={loanTourConfig.id}
            steps={tourSteps}
            label={tCommon('tour.loans.button', 'Loan pipeline guide')}
            options={tourOptions}
          />
        </Box>

        <LoanKPIStrip kpis={dashboardKPIs?.kpis} />
        <LoanAlertsPanel alerts={alerts?.alerts || []} onAlertClick={handleAlertClick} />

        {/* ✅ ID: Toolbar */}
        <Box id="loans-toolbar" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {t('loans.filters.project', 'Search')}:
            </Typography>
            <TextField
              id="loans-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('loans.searchPlaceholder')}
              size="small"
              sx={{ width: 320, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: '#888' }} />
                  </InputAdornment>
                )
              }}
            />
            {search && (
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#888', letterSpacing: '1px' }}>
                {filtered.length} {t('loans.table.results', 'results')}
              </Typography>
            )}
          </Box>

          <Button
            id="loans-new-btn"
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{
              borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem', letterSpacing: '0.5px', bgcolor: '#000', color: '#fff',
              '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' }
            }}
          >
            {t('loans.actions.newLoan')}
          </Button>
        </Box>

        {/* ✅ ID: Tabs */}
        <Box id="loans-filter-tabs">
          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 2,
              '& .MuiTab-root': {
                fontFamily: '"Courier New", monospace', fontSize: '0.68rem',
                letterSpacing: '0.8px', textTransform: 'uppercase', color: '#888',
                minHeight: 36, '&.Mui-selected': { color: '#000', fontWeight: 700 }
              },
              '& .MuiTabs-indicator': { bgcolor: '#000', height: 2 }
            }}
          >
            {FILTER_TABS.map(tab => (
              <Tab key={tab.key} label={t(`loans.tabs.${tab.key}`)} />
            ))}
          </Tabs>
        </Box>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <LoanSummaryTable
            loans={filtered}
            loading={loading}
            onRowClick={handleViewLoan}
          />
        </motion.div>

        <LoanFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleCreate} />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, border: '1px solid' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageLayout>
  )
}