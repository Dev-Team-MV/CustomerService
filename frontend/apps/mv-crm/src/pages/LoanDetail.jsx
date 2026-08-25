import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, IconButton, CircularProgress, Alert, Snackbar,
  Chip, LinearProgress
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import LoanPipelineVisual from '../components/loans/LoanPipelineVisual'
import LoanNextAction from '../components/loans/LoanNextAction'
import LoanProfileForm from '../components/loans/LoanProfileForm'
import LoanDocumentChecklist from '../components/loans/LoanDocumentChecklist'
import LoanTimeline from '../components/loans/LoanTimeline'
import LoanNotes from '../components/loans/LoanNotes'
import loanService from '../services/loanService'
import {
  SPECIAL_STATUS_LABELS, SPECIAL_STATUS_COLORS
} from '../services/loanService'

function buyerName(loan) {
  const b = loan?.buyer
  if (!b) return 'Loan'
  if (typeof b === 'object') return [b.firstName, b.lastName].filter(Boolean).join(' ') || b.email || 'Loan'
  return 'Loan'
}

export default function LoanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loan, setLoan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const loadLoan = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await loanService.getById(id)
      setLoan(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading loan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLoan()
  }, [id])

  const notify = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleUpdateProfile = async (data) => {
    try {
      const updated = await loanService.update(id, data)
      setLoan(updated)
      notify('Profile updated')
    } catch (err) {
      notify(err.response?.data?.message || 'Error updating profile', 'error')
    }
  }

  const handleStageChange = async (stage) => {
    try {
      const updated = await loanService.updateStage(id, stage)
      setLoan(updated)
      notify('Pipeline stage updated')
    } catch (err) {
      notify(err.response?.data?.message || 'Error updating stage', 'error')
    }
  }

  const handleStatusChange = async (status) => {
    try {
      const updated = await loanService.updateSpecialStatus(id, status)
      setLoan(updated)
      notify('Special status updated')
    } catch (err) {
      notify(err.response?.data?.message || 'Error updating status', 'error')
    }
  }

  const handleNextActionSave = async (data) => {
    try {
      const updated = await loanService.updateNextAction(id, data)
      setLoan(updated)
      notify('Next action updated')
    } catch (err) {
      notify(err.response?.data?.message || 'Error updating next action', 'error')
    }
  }

  const handleDocStatusChange = async (docType, data) => {
    try {
      const updated = await loanService.updateDocumentItem(id, docType, data)
      setLoan(updated)
    } catch (err) {
      notify(err.response?.data?.message || 'Error updating document', 'error')
    }
  }

  const handleDocUpload = async (docType, file) => {
    try {
      const updated = await loanService.uploadDocument(id, docType, file)
      setLoan(updated)
      notify('Document uploaded')
    } catch (err) {
      notify(err.response?.data?.message || 'Error uploading document', 'error')
    }
  }

  const handleDocDelete = async (docType) => {
    try {
      const updated = await loanService.deleteDocumentFile(id, docType)
      setLoan(updated)
      notify('Document deleted')
    } catch (err) {
      notify(err.response?.data?.message || 'Error deleting document', 'error')
    }
  }

  const handleAddNote = async (note) => {
    try {
      const updated = await loanService.addNote(id, note)
      setLoan(updated)
      notify('Note added')
    } catch (err) {
      notify(err.response?.data?.message || 'Error adding note', 'error')
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </PageLayout>
    )
  }

  if (error || !loan) {
    return (
      <PageLayout>
        <Alert severity="error" sx={{ m: 3, borderRadius: 0, border: '1px solid' }}>
          {error || 'Loan not found'}
        </Alert>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>

        {/* Header */}
        <Box mb={3} display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <IconButton onClick={() => navigate('/loans')} sx={{ bgcolor: '#f5f5f5', borderRadius: 0 }}>
            <ArrowBack />
          </IconButton>

          <Box flex={1} minWidth={0}>
            <Typography
              sx={{
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                fontWeight: 200,
                fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' },
                color: '#000',
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                wordBreak: 'break-word'
              }}
            >
              {buyerName(loan)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
              {loan.specialStatus && (
                <Chip
                  label={SPECIAL_STATUS_LABELS[loan.specialStatus] || loan.specialStatus}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.6rem',
                    fontFamily: '"Courier New", monospace',
                    borderRadius: 0,
                    bgcolor: (SPECIAL_STATUS_COLORS[loan.specialStatus] || '#757575') + '18',
                    color: SPECIAL_STATUS_COLORS[loan.specialStatus] || '#757575',
                    border: `1px solid ${(SPECIAL_STATUS_COLORS[loan.specialStatus] || '#757575')}40`
                  }}
                />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={loan.percentComplete || 0}
                  sx={{
                    width: 80,
                    height: 4,
                    borderRadius: 0,
                    bgcolor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': { borderRadius: 0, bgcolor: '#000' }
                  }}
                />
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#888' }}>
                  {loan.percentComplete || 0}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Pipeline Visual */}
        <LoanPipelineVisual
          currentStage={loan.pipelineStage}
          onStageClick={handleStageChange}
        />

        {/* Next Action */}
        <LoanNextAction
          nextAction={loan.nextAction}
          onSave={handleNextActionSave}
        />

        {/* Profile Form */}
        <LoanProfileForm
          loan={loan}
          onSave={handleUpdateProfile}
          onStageChange={handleStageChange}
          onStatusChange={handleStatusChange}
        />

        {/* Document Checklist */}
        <LoanDocumentChecklist
          checklist={loan.documentChecklist || []}
          onStatusChange={handleDocStatusChange}
          onUpload={handleDocUpload}
          onDeleteFile={handleDocDelete}
        />

        {/* Timeline & Notes side by side on desktop */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <LoanTimeline loanId={id} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <LoanNotes
              notes={loan.internalNotes}
              onAddNote={handleAddNote}
            />
          </Box>
        </Box>
      </Box>

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
    </PageLayout>
  )
}
