import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Box, Grid, Button, CircularProgress, Typography, Paper, 
  IconButton, useMediaQuery, useTheme, FormControl, InputLabel, Select, MenuItem
} from '@mui/material'
import { ArrowBack, Save } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import { useLoans } from '../constants/hooks/useLoans'
import loanService, { LOAN_PIPELINE_STAGES, LOAN_SPECIAL_STATUSES } from '../services/loanService'

import LoanProfileForm from '../components/loans/LoanProfileForm'
import LoanDocumentChecklist from '../components/loans/LoanDocumentChecklist'
import LoanTimeline from '../components/loans/LoanTimeline'
import LoanNotes from '../components/loans/LoanNotes'
import LoanNextAction from '../components/loans/LoanNextAction'

export default function LoanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation('loans')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  const { 
    updateLoan, addNote, updateStage, updateSpecialStatus,
    updateDocumentItem, uploadDocument, deleteDocumentFile 
  } = useLoans()
  
  const [loan, setLoan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingStage, setSavingStage] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)

  const refreshLoan = async () => {
    try {
      const data = await loanService.getById(id)
      setLoan(data)
    } catch (err) {
      console.error('Error refreshing loan:', err)
    }
  }

  useEffect(() => {
    if (!id) {
      setError('No loan ID provided')
      setLoading(false)
      return
    }

    const fetchLoan = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await loanService.getById(id)
        setLoan(data)
      } catch (err) {
        console.error('Error fetching loan detail:', err)
        setError(err.message || 'Failed to load loan details')
      } finally {
        setLoading(false)
      }
    }
    fetchLoan()
  }, [id])

  const handleSaveProfile = async (data) => {
    try {
      await updateLoan(id, data)
      await refreshLoan()
    } catch (err) {
      console.error('Error updating profile:', err)
      alert(t('loans.detail.errorSaving', 'Error saving changes'))
    }
  }

  const handleAddNote = async (noteText) => {
    try {
      await addNote(id, noteText)
      await refreshLoan()
    } catch (err) {
      console.error('Error adding note:', err)
    }
  }

  const handleChangeStage = async (newStage) => {
    setSavingStage(true)
    try {
      await updateStage(id, newStage)
      await refreshLoan()
    } catch (err) {
      console.error('Error updating stage:', err)
    } finally {
      setSavingStage(false)
    }
  }

  const handleChangeStatus = async (newStatus) => {
    setSavingStatus(true)
    try {
      await updateSpecialStatus(id, newStatus || null)
      await refreshLoan()
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setSavingStatus(false)
    }
  }

  const handleUpdateNextAction = async (actionData) => {
    try {
      await updateLoan(id, { nextAction: actionData })
      await refreshLoan()
    } catch (err) {
      console.error('Error updating next action:', err)
      alert(t('loans.nextAction.errorSaving', 'Error saving next action'))
    }
  }

  const handleUpdateDoc = async (loanId, docType, data) => {
    await updateDocumentItem(loanId, docType, data)
    await refreshLoan()
  }
  const handleUploadDoc = async (loanId, docType, file) => {
    await uploadDocument(loanId, docType, file)
    await refreshLoan()
  }
  const handleDeleteDoc = async (loanId, docType) => {
    await deleteDocumentFile(loanId, docType)
    await refreshLoan()
  }

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
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/loans')} sx={{ mb: 2, textTransform: 'none', fontFamily: '"Courier New", monospace' }}>
            {t('loans.detail.backToList')}
          </Button>
          <Paper sx={{ p: 4, borderRadius: 0, border: '1px solid #ececec', textAlign: 'center', bgcolor: '#fff' }}>
            <Typography color="error" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem' }}>
              {error || t('loans.detail.notFound')}
            </Typography>
          </Paper>
        </Box>
      </PageLayout>
    )
  }

  const notesList = (loan.timeline || []).filter(e =>
    (e.action || '').toLowerCase().includes('note') || e.metadata?.note
  )

  // ✅ TÍTULO DINÁMICO: maneja Property Y Apartment correctamente
  const projectName = loan.projectId?.name || t('loans.common.notAvailable')
  let resourceInfo = t('loans.common.notAvailable')
  if (loan.propertyId) {
    const lotNum = loan.propertyId.lot?.number || t('loans.common.notAvailable')
    const modelName = loan.propertyId.model?.model || ''
    resourceInfo = `🏠 ${t('loans.form.fields.lot', 'Lot')} ${lotNum}${modelName ? ` - ${modelName}` : ''}`
  } else if (loan.apartmentId) {
    const aptNum = loan.apartmentId.apartmentNumber || t('loans.common.notAvailable')
    const floorNum = loan.apartmentId.floorNumber || ''
    resourceInfo = `🏢 ${t('loans.form.fields.apt', 'Apt')} ${aptNum}${floorNum ? ` (${t('loans.form.fields.floor', 'Floor')} ${floorNum})` : ''}`
  }

  const loanTitle = `${projectName} • ${resourceInfo}`
  const buyerName = `${loan.buyer?.firstName || ''} ${loan.buyer?.lastName || ''}`.trim() || t('loans.common.unknownBuyer', 'Unknown Buyer')

  const inputSx = {
    fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem',
    borderRadius: 0,
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiSelect-select': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }
  }

  return (
    <PageLayout>
      <Box id="loan-detail-content" sx={{ p: { xs: 2, sm: 3 } }}>
        
        {/* HEADER */}
        <Box id="loan-detail-header" mb={3} display="flex" alignItems={isMobile ? 'flex-start' : 'center'} gap={2} flexWrap="wrap">
          <IconButton onClick={() => navigate('/loans')} sx={{ bgcolor: '#f5f5f5', borderRadius: 0, '&:hover': { bgcolor: '#e0e0e0' } }}>
            <ArrowBack sx={{ color: '#000' }} />
          </IconButton>
          
          <Box flex={1} minWidth={0}>
            <Typography sx={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: 200, fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem' }, color: '#000', letterSpacing: '-0.04em', lineHeight: 1.1, wordBreak: 'break-word' }}>
              {loanTitle}
            </Typography>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#706f6f', letterSpacing: '1px', mt: 0.5 }}>
              • {buyerName}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<Save />}
            onClick={() => document.getElementById('loan-profile-form')?.requestSubmit()}
            sx={{
              fontFamily: '"Courier New", monospace', fontSize: '0.75rem', textTransform: 'none', letterSpacing: '0.5px', borderRadius: 0,
              borderColor: '#004535', color: '#004535', width: { xs: '100%', sm: 'auto' },
              '&:hover': { borderColor: '#00332a', bgcolor: '#e8f5ee', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' }
            }}
          >
            {t('loans.detail.saveChanges')}
          </Button>
        </Box>

        {/* ✅ Panel rápido de Stage + Status */}
        <Paper elevation={0} sx={{ border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fafafa', p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" sx={inputSx} disabled={savingStage}>
                <InputLabel>{t('loans.form.fields.pipelineStage')}</InputLabel>
                <Select
                  value={loan.pipelineStage || ''}
                  label={t('loans.form.fields.pipelineStage')}
                  onChange={(e) => handleChangeStage(e.target.value)}
                >
                  {LOAN_PIPELINE_STAGES.map(stage => (
                    <MenuItem key={stage.id} value={stage.id} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
                      <Typography component="span" variant="caption" sx={{ color: '#706f6f', mr: 1 }}>[{stage.phase}]</Typography>
                      {t(`loans.pipelineStages.${stage.id}`, stage.name)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" sx={inputSx} disabled={savingStatus}>
                <InputLabel>{t('loans.form.fields.specialStatus')}</InputLabel>
                <Select
                  value={loan.specialStatus || ''}
                  label={t('loans.form.fields.specialStatus')}
                  onChange={(e) => handleChangeStatus(e.target.value)}
                >
                  <MenuItem value="" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
                    <em>{t('loans.common.normal')} ({t('loans.common.normal')})</em>
                  </MenuItem>
                  {LOAN_SPECIAL_STATUSES.map(s => (
                    <MenuItem key={s.key} value={s.key} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
                      <Box sx={{ width: 10, height: 10, bgcolor: s.color, mr: 1, display: 'inline-block' }} />
                      {t(`loans.specialStatuses.${s.key}`, s.label)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Card de Next Action */}
        <Box sx={{ mb: 4 }}>
          <LoanNextAction 
            action={loan.nextAction} 
            onUpdate={handleUpdateNextAction}
            loanId={loan._id}
          />
        </Box>

        <Paper id="loan-detail-tabs-container" elevation={0} sx={{ border: '1px solid #ececec', borderRadius: 0, bgcolor: '#fff', p: { xs: 1, sm: 3 } }}>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2, pb: 1, borderBottom: '1px solid #ececec' }}>
                  {t('loans.detail.profile')}
                </Typography>
                <LoanProfileForm loan={loan} onSave={handleSaveProfile} formId="loan-profile-form" />
              </Box>
              
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2, pb: 1, borderBottom: '1px solid #ececec' }}>
                  {t('loans.detail.documents')}
                </Typography>
                <LoanDocumentChecklist 
                  loanId={loan._id} 
                  documentChecklist={loan.documentChecklist || []} 
                  onUpdate={handleUpdateDoc}
                  onUpload={handleUploadDoc}
                  onDelete={handleDeleteDoc}
                />
              </Box>

              <Box>
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2, pb: 1, borderBottom: '1px solid #ececec' }}>
                  {t('loans.detail.timeline')}
                </Typography>
                <LoanTimeline timeline={loan.timeline || []} />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: 24 }}>
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#000', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2, pb: 1, borderBottom: '1px solid #ececec' }}>
                  {t('loans.detail.notes')}
                </Typography>
                <LoanNotes notes={notesList} onAddNote={handleAddNote} />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </PageLayout>
  )
}