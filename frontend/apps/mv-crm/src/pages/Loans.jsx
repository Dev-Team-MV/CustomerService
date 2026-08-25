import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'processing', label: 'Processing' },
  { key: 'underwriting', label: 'Underwriting' },
  { key: 'closing', label: 'Closing' },
  { key: 'completed', label: 'Completed' },
  { key: 'issues', label: 'Issues' }
]

const STAGE_GROUPS = {
  active: [
    'new_loan_buyer_added', 'loan_application_sent', 'loan_application_started',
    'loan_application_completed', 'initial_documents_requested', 'documents_received',
    'documents_missing_pending', 'pre_qualification_in_review', 'pre_qualified',
    'pre_approval_in_review', 'pre_approved'
  ],
  processing: [
    'property_unit_selected', 'purchase_contract_executed', 'contract_sent_to_lender',
    'loan_estimate_issued', 'disclosures_sent', 'disclosures_signed',
    'processing', 'additional_documents_requested'
  ],
  underwriting: [
    'submitted_to_underwriting', 'underwriting_review', 'conditional_approval',
    'conditions_outstanding', 'conditions_submitted', 'appraisal_ordered',
    'appraisal_scheduled', 'appraisal_completed', 'appraisal_received',
    'appraisal_approved', 'title_ordered_title_review', 'insurance_requested',
    'insurance_received', 'final_underwriting'
  ],
  closing: [
    'clear_to_close', 'closing_disclosure_issued', 'closing_disclosure_signed',
    'closing_scheduled', 'buyer_funds_due', 'closing_documents_signed',
    'loan_funded', 'title_confirmed_closed'
  ],
  completed: ['completed'],
  issues: []
}

const ISSUE_STATUSES = [
  'on_hold', 'buyer_action_required', 'lender_action_required',
  'developer_action_required', 'missing_documents', 'financing_issue',
  'appraisal_issue', 'title_issue', 'loan_denied', 'buyer_withdrawn', 'cancelled'
]

export default function Loans() {
  const navigate = useNavigate()
  const {
    loans, loading, error,
    createLoan, fetchLoans,
    dashboardKPIs, alerts,
    fetchDashboardKPIs, fetchAlerts
  } = useLoans()

  const [search, setSearch] = useState('')
  const [tabIndex, setTabIndex] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchDashboardKPIs()
    fetchAlerts()
  }, [])

  const filtered = useMemo(() => {
    let result = loans
    const tab = FILTER_TABS[tabIndex]?.key

    if (tab && tab !== 'all') {
      if (tab === 'issues') {
        result = result.filter(l => ISSUE_STATUSES.includes(l.specialStatus))
      } else if (STAGE_GROUPS[tab]) {
        result = result.filter(l => STAGE_GROUPS[tab].includes(l.pipelineStage))
      }
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
      setSnackbar({ open: true, message: 'Loan created successfully', severity: 'success' })
      fetchDashboardKPIs()
      fetchAlerts()
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Error creating loan', severity: 'error' })
      throw err
    }
  }

  const handleViewLoan = (loan) => {
    navigate(`/loans/${loan._id}`)
  }

  const handleAlertClick = (alert) => {
    if (alert.loanId) navigate(`/loans/${alert.loanId}`)
  }

  return (
    <PageLayout
      title="Loan"
      titleBold="Pipeline"
      topbarLabel="Loans"
      subtitle="Track buyer financing from application to closing"
    >
      <LoanKPIStrip kpis={dashboardKPIs?.kpis} />

      <LoanAlertsPanel
        alerts={alerts?.alerts || []}
        onAlertClick={handleAlertClick}
      />

      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#000', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Search:
          </Typography>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buyer, address, lender..."
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
              {filtered.length} results
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{
            borderRadius: 0,
            textTransform: 'none',
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            bgcolor: '#000',
            color: '#fff',
            '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' }
          }}
        >
          New Loan
        </Button>
      </Box>

      {/* Filter Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            fontFamily: '"Courier New", monospace',
            fontSize: '0.68rem',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            color: '#888',
            minHeight: 36,
            '&.Mui-selected': { color: '#000', fontWeight: 700 }
          },
          '& .MuiTabs-indicator': { bgcolor: '#000', height: 2 }
        }}
      >
        {FILTER_TABS.map(tab => (
          <Tab key={tab.key} label={tab.label} />
        ))}
      </Tabs>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <LoanSummaryTable
          loans={filtered}
          loading={loading}
          onRowClick={handleViewLoan}
        />
      </motion.div>

      <LoanFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            borderRadius: 0,
            border: '1px solid'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  )
}
