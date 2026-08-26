import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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

// ✅ IMPORTS DEL TOUR
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getLoanDetailTourSteps, loanDetailTourConfig } from '../tours/modules/loanTour'

function buyerName(loan, fallbackLabel = 'Loan') {
  const b = loan?.buyer
  if (!b) return fallbackLabel
  if (typeof b === 'object') return [b.firstName, b.lastName].filter(Boolean).join(' ') || b.email || fallbackLabel
  return fallbackLabel
}

export default function LoanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('loans')
  const { t: tCommon } = useTranslation('common')

  // ✅ ESTADO DEL TOUR
  const { startTour } = useTour()
  const detailTourSteps = useMemo(() => getLoanDetailTourSteps(tCommon), [tCommon])

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
      setError(err.response?.data?.message || t('loans.detail.loadError', 'Error loading loan'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLoan()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ AUTO-ARRANQUE DEL TOUR (si venimos del tour del pipeline)
  useEffect(() => {
    const pendingId = sessionStorage.getItem('start-loan-detail-tour')
    if (pendingId && pendingId === id && !loading && loan) {
      sessionStorage.removeItem('start-loan-detail-tour')
      const timer = setTimeout(() => {
        startTour(loanDetailTourConfig.id, detailTourSteps, {
          onNextClick: (driver) => driver.moveNext(),
          onPrevClick: (driver) => driver.movePrevious()
        })
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [id, loading, loan, startTour, detailTourSteps])

  const notify = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  // ===== HANDLERS INTERNACIONALIZADOS =====
  const handleUpdateProfile = async (data) => {
    try {
      const updated = await loanService.update(id, data)
      setLoan(updated)
      notify(t('loans.snackbar.profileUpdated', 'Profile updated'))
    } catch (err) {
      notify(err.response?.data?.message || t('loans.snackbar.profileUpdateError', 'Error updating profile'), 'error')
    }
  }

  const handleStageChange = async (stage) => {
    try {
      const updated = await loanService.updateStage(id, stage)
      setLoan(updated)
      notify(t('loans.snackbar.stageUpdated', 'Pipeline stage updated'))
    } catch (err) {
      notify(err.response?.data?.message || t('loans.snackbar.stageUpdateError', 'Error updating stage'), 'error')
    }
  }

  const handleStatusChange = async (status) => {
    try {
      const updated = await loanService.updateSpecialStatus(id, status)
      setLoan(updated)
      notify(t('loans.snackbar.statusUpdated', 'Special status updated'))
    } catch (err) {
      notify(err.response?.data?.message || t('loans.snackbar.statusUpdateError', 'Error updating status'), 'error')
    }
  }

  const handleNextActionSave = async (data) => {
    try {
      const updated = await loanService.updateNextAction(id, data)
      setLoan(updated)
      notify(t('loans.snackbar.nextActionUpdated', 'Next action updated'))
    } catch (err) {
      notify(err.response?.data?.message || t('loans.snackbar.nextActionError', 'Error updating next action'), 'error')
    }
  }

  const handleDocStatusChange = async (docType, data) => {
    try {
      const updated = await loanService.updateDocumentItem(id, docType, data)
      setLoan(updated)
    } catch (err) {
      notify(err.response?.data?.message || t('loans.snackbar.docUpdateError', 'Error updating document'), 'error')
    }
  }

  const handleDocUpload = async (docType, file) => {
    try {
      const updated = await loanService.uploadDocument(id, docType, file)
      setLoan(updated)
      notify(t('loans.snackbar.docUploaded', 'Document uploaded'))
    } catch (err) {
      notify(err.response?.data?.message || t('loans.snackbar.docUploadError', 'Error uploading document'), 'error')
    }
  }

  const handleDocDelete = async (docType) => {
    try {
      const updated = await loanService.deleteDocumentFile(id, docType)
      setLoan(updated)
      notify(t('loans.snackbar.docDeleted', 'Document deleted'))
    } catch (err) {
      notify(err.response?.data?.message || t('loans.snackbar.docDeleteError', 'Error deleting document'), 'error')
    }
  }

  const handleAddNote = async (note) => {
    try {
      const updated = await loanService.addNote(id, note)
      setLoan(updated)
      notify(t('loans.snackbar.noteAdded', 'Note added'))
    } catch (err) {
      notify(err.response?.data?.message || t('loans.snackbar.noteError', 'Error adding note'), 'error')
    }
  }

  // ===== ESTADOS DE CARGA Y ERROR =====
  if (loading) {
    return (
      <PageLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress sx={{ color: '#004535' }} />
        </Box>
      </PageLayout>
    )
  }

  if (error || !loan) {
    return (
      <PageLayout>
        <Box sx={{ p: 3 }}>
          <IconButton onClick={() => navigate('/loans')} sx={{ bgcolor: '#f5f5f5', borderRadius: 0, mb: 2 }}>
            <ArrowBack />
          </IconButton>
          <Alert severity="error" sx={{ borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace', fontSize: '0.85rem' }}>
            {error || t('loans.detail.notFound')}
          </Alert>
        </Box>
      </PageLayout>
    )
  }

  // ✅ FIX: Un solo hijo directo de PageLayout (Box que contiene todo + Snackbar dentro)
  return (
    <PageLayout>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>

        {/* ===== HEADER ===== */}
        <Box id="loan-detail-header" mb={3} display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <IconButton onClick={() => navigate('/loans')} sx={{ bgcolor: '#f5f5f5', borderRadius: 0, '&:hover': { bgcolor: '#e0e0e0' } }}>
            <ArrowBack sx={{ color: '#000' }} />
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
              {buyerName(loan, t('loans.detail.defaultTitle', 'Loan'))}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, flexWrap: 'wrap' }}>
              {loan.buyer?.email && (
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#706f6f' }}>
                  {loan.buyer.email}
                </Typography>
              )}

              {loan.projectId?.name && (
                <>
                  <Typography sx={{ color: '#ccc' }}>•</Typography>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#706f6f' }}>
                    {loan.projectId.name}
                  </Typography>
                </>
              )}

              {(loan.propertyId || loan.apartmentId) && (
                <>
                  <Typography sx={{ color: '#ccc' }}>•</Typography>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#706f6f' }}>
                    {loan.propertyId
                      ? `🏠 ${t('loans.form.fields.lot', 'Lot')} ${loan.propertyId.lot?.number || '—'}`
                      : `🏢 ${t('loans.form.fields.apt', 'Apt')} ${loan.apartmentId.apartmentNumber || '—'}`
                    }
                  </Typography>
                </>
              )}

              {loan.specialStatus && (
                <>
                  <Typography sx={{ color: '#ccc' }}>•</Typography>
                  <Chip
                    label={SPECIAL_STATUS_LABELS[loan.specialStatus] || loan.specialStatus}
                    size="small"
                    sx={{
                      height: 22, fontSize: '0.6rem', fontFamily: '"Courier New", monospace',
                      borderRadius: 0,
                      bgcolor: (SPECIAL_STATUS_COLORS[loan.specialStatus] || '#757575') + '18',
                      color: SPECIAL_STATUS_COLORS[loan.specialStatus] || '#757575',
                      border: `1px solid ${(SPECIAL_STATUS_COLORS[loan.specialStatus] || '#757575')}40`
                    }}
                  />
                </>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={loan.percentComplete || 0}
                  sx={{
                    width: 80, height: 4, borderRadius: 0, bgcolor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 0,
                      bgcolor: (loan.percentComplete || 0) >= 80 ? '#4caf50' : (loan.percentComplete || 0) >= 40 ? '#ff9800' : '#2196f3'
                    }
                  }}
                />
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#888' }}>
                  {loan.percentComplete || 0}%
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* ✅ BOTÓN DEL TOUR (reiniciable manualmente) */}
          <TourButton
            tourId={loanDetailTourConfig.id}
            steps={detailTourSteps}
            label={tCommon('tour.loanDetail.button', 'Loan detail guide')}
            options={{
              onNextClick: (driver) => driver.moveNext(),
              onPrevClick: (driver) => driver.movePrevious()
            }}
          />
        </Box>

        {/* ===== PIPELINE VISUAL ===== */}
        <LoanPipelineVisual
          currentStage={loan.pipelineStage}
          onStageClick={handleStageChange}
        />

        {/* ===== NEXT ACTION ===== */}
        <LoanNextAction
          nextAction={loan.nextAction}
          onSave={handleNextActionSave}
        />

        {/* ===== PROFILE FORM ===== */}
        <LoanProfileForm
          loan={loan}
          onSave={handleUpdateProfile}
          onStageChange={handleStageChange}
          onStatusChange={handleStatusChange}
        />

        {/* ===== DOCUMENT CHECKLIST ===== */}
        <LoanDocumentChecklist
          checklist={loan.documentChecklist || []}
          onStatusChange={handleDocStatusChange}
          onUpload={handleDocUpload}
          onDeleteFile={handleDocDelete}
        />

        {/* ===== TIMELINE & NOTES ===== */}
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

        {/* ✅ Snackbar movido DENTRO del Box principal (mismo nivel que demás secciones) */}
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