// apps/mv-crm/src/components/postSale/OnboardingDetailDialog.jsx
import { useState, useEffect } from 'react'
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  Box, Typography, LinearProgress, Checkbox, FormControlLabel,
  Paper, Chip, CircularProgress, TextField, Grid, IconButton
} from '@mui/material'
import { 
  CheckCircle, Circle, Business, Home, Apartment, Person, 
  CloudUpload, Delete, Description 
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import api from '@shared/services/api'

import { useResolvedProperties } from '../../constants/hooks/useResolvedProperties'
import DocumentUploadModal from '../documents/DocumentUploadModal'
import DocumentViewer from '../documents/DocumentViewer'

export default function OnboardingDetailDialog({ open, onClose, onboarding, onRefresh, onNotify }) {
  const { t, i18n } = useTranslation('postSale')
  
  const { propertiesMap } = useResolvedProperties(onboarding ? [onboarding] : [])
  const { lots = {}, models = {}, buildings = {}, apartments = {} } = propertiesMap

  const [localItems, setLocalItems] = useState([])
  const [updatingKey, setUpdatingKey] = useState(null)
  const [notes, setNotes] = useState({})
  const [docData, setDocData] = useState({})

  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [currentItemKey, setCurrentItemKey] = useState(null)
  const [viewingDoc, setViewingDoc] = useState(null)

  useEffect(() => {
    if (onboarding?.items) {
      setLocalItems(onboarding.items)
      const initialNotes = {}
      const initialDocs = {}
      onboarding.items.forEach(item => {
        initialNotes[item.key] = item.notes || ''
        initialDocs[item.key] = item.requiredDocumentId || null
      })
      setNotes(initialNotes)
      setDocData(initialDocs)
    }
  }, [onboarding?._id])

  if (!onboarding) return null

  const completedCount = localItems.filter(i => i.completed).length
  const totalCount = localItems.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const isApartment = !!(onboarding.apartmentId || (typeof onboarding.propertyId === 'object' && onboarding.propertyId.apartmentNumber))
  
  let lotNumber = t('common.na')
  let modelName = ''
  let aptNumber = t('common.na')
  let buildingName = t('onboarding.building')

  if (isApartment) {
    const apt = typeof onboarding.apartmentId === 'object' ? onboarding.apartmentId : apartments[onboarding.apartmentId]
    if (apt) {
      aptNumber = apt.apartmentNumber || t('common.na')
      const building = typeof apt.building === 'object' ? apt.building : buildings[apt.building]
      buildingName = building?.name || (building?._id ? String(building._id).slice(-6) : t('onboarding.building'))
    }
  } else {
    const prop = onboarding.propertyId
    if (prop) {
      const lotId = typeof prop.lot === 'string' ? prop.lot : prop.lot?._id
      const modelId = typeof prop.model === 'string' ? prop.model : prop.model?._id
      
      const lotData = lots[lotId] || {}
      const modelData = models[modelId] || {}
      
      lotNumber = lotData.number || lotData.name || (lotId ? String(lotId).slice(-6) : t('common.na'))
      modelName = modelData.name || modelData.model || ''
    }
  }

  const handleToggleItem = async (itemKey) => {
    const currentItem = localItems.find(i => i.key === itemKey)
    const newStatus = !currentItem.completed

    setUpdatingKey(itemKey)
    try {
      const docIdToSend = docData[itemKey]?._id || null
      
      await api.post(`/onboarding/${onboarding._id}/items/${itemKey}/complete`, {
        completed: newStatus,
        notes: notes[itemKey] || '',
        requiredDocumentId: docIdToSend
      })
      
      setLocalItems(prev => prev.map(i => 
        i.key === itemKey ? { 
          ...i, 
          completed: newStatus, 
          completedAt: newStatus ? new Date().toISOString() : null,
          completedBy: newStatus ? { firstName: 'Admin', lastName: '' } : null, 
          notes: notes[itemKey] || '',
          requiredDocumentId: docData[itemKey] || null
        } : i
      ))
      
      onNotify(newStatus ? t('onboarding.itemCompleted') : t('onboarding.itemPending'), 'success')
      onRefresh() 
    } catch (err) {
      console.error('❌ Error toggling item:', err)
      onNotify(t('onboarding.itemUpdateError'), 'error')
    } finally {
      setUpdatingKey(null)
    }
  }

  const openDocumentUploadModal = (itemKey) => {
    setCurrentItemKey(itemKey)
    setUploadModalOpen(true)
  }

  const handleDocumentUploadSuccess = (uploadResponse) => {
    const newDoc = uploadResponse?._id ? uploadResponse : { _id: uploadResponse }
    
    if (newDoc._id) {
      setDocData(prev => ({ ...prev, [currentItemKey]: newDoc }))
      setLocalItems(prev => prev.map(i => 
        i.key === currentItemKey ? { ...i, requiredDocumentId: newDoc } : i
      ))
      onNotify(t('onboarding.docUploaded'), 'success')
    }
    setUploadModalOpen(false)
  }

  const currentLang = i18n.language === 'es' ? 'label_es' : 'label_en'
  const stableProjectId = typeof onboarding.projectId === 'object' ? onboarding.projectId._id : onboarding.projectId
  const stableClientId = typeof onboarding.clientId === 'object' ? onboarding.clientId._id : onboarding.clientId
  const stablePropertyId = typeof onboarding.propertyId === 'object' ? onboarding.propertyId._id : onboarding.propertyId
  const stableApartmentId = isApartment ? stablePropertyId : null

  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }
  const inputSx = { fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' } }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ececec' }}>
        <Typography variant="h6" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {t('onboarding.checklistDetails')}
        </Typography>
        <Chip 
          label={t(`onboarding.statuses.${onboarding.status}`, onboarding.status)} 
          color={onboarding.status === 'completed' ? 'success' : onboarding.status === 'in_progress' ? 'primary' : 'default'}
          sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.65rem', fontWeight: 600 }}
        />
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 0, border: '1px solid #e0e0e0' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <Business fontSize="small" color="action" />
                <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                  {typeof onboarding.projectId === 'object' ? onboarding.projectId.name : t('common.na')}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={1}>
                {isApartment ? <Apartment fontSize="small" color="primary" /> : <Home fontSize="small" color="success" />}
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                    {isApartment ? `${t('onboarding.apt')} ${aptNumber}` : `${t('onboarding.lot')} ${lotNumber}`}
                  </Typography>
                  {!isApartment && modelName && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: '"Courier New", monospace' }}>
                      {modelName}
                    </Typography>
                  )}
                  {isApartment && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: '"Courier New", monospace' }}>
                      {buildingName}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <Person fontSize="small" color="action" />
                <Typography variant="body2" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                  {typeof onboarding.clientId === 'object' ? `${onboarding.clientId.firstName} ${onboarding.clientId.lastName}` : t('common.na')}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Box display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" fontWeight={600} sx={{ fontFamily: '"Courier New", monospace' }}>{t('onboarding.overallProgress')}</Typography>
              <Typography variant="caption" fontWeight={700} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>{progress}%</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 0, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': { borderRadius: 0 } }} 
            />
          </Box>
        </Box>

        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, fontFamily: '"Courier New", monospace', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {t('onboarding.checklistItems')}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {localItems.map((item) => (
            <Paper 
              key={item.key} 
              variant="outlined" 
              sx={{ 
                p: 2, borderRadius: 0, border: '1px solid #e0e0e0',
                bgcolor: item.completed ? '#f1f8e9' : 'background.paper',
                borderColor: item.completed ? '#4caf50' : '#e0e0e0',
                opacity: updatingKey === item.key ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={2}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={item.completed} 
                      onChange={() => handleToggleItem(item.key)}
                      disabled={updatingKey === item.key}
                      icon={<Circle />}
                      checkedIcon={<CheckCircle color="success" />}
                    />
                  }
                  label={
                    <Box sx={{ width: '100%' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ 
                          fontWeight: 600,
                          textDecoration: item.completed ? 'line-through' : 'none',
                          color: item.completed ? 'text.secondary' : 'text.primary',
                          fontFamily: '"Helvetica Neue", sans-serif'
                        }}>
                          {item[currentLang] || item.label_es || item.label || item.key}
                          {updatingKey === item.key && <CircularProgress size={16} sx={{ ml: 1 }} />}
                        </Typography>
                      </Box>
                      
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder={t('onboarding.addNotes')}
                        value={notes[item.key] || ''}
                        onChange={(e) => setNotes(prev => ({ ...prev, [item.key]: e.target.value }))}
                        sx={{ mt: 1, mb: 1, ...inputSx }}
                      />

                      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CloudUpload />}
                          onClick={() => openDocumentUploadModal(item.key)}
                          sx={{ ...unifiedButtonSx, border: '1px solid #000', color: '#000', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#555', color: '#555', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' } }}
                        >
                          {item.requiredDocumentId ? t('onboarding.replaceDoc') : t('onboarding.uploadDoc')}
                        </Button>
                        
                        {item.requiredDocumentId && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Chip 
                              label={item.requiredDocumentId.title || t('onboarding.documentAttached')} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              icon={<Description fontSize="small" />}
                              onClick={() => setViewingDoc(item.requiredDocumentId)}
                              sx={{ cursor: 'pointer', borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.7rem', '&:hover': { bgcolor: 'action.hover' } }}
                            />
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={(e) => {
                                e.stopPropagation()
                                setDocData(prev => ({ ...prev, [item.key]: null }))
                                setLocalItems(prev => prev.map(i => i.key === item.key ? { ...i, requiredDocumentId: null } : i))
                              }}
                              title={t('actions.remove')}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                      
                      {item.completed && item.completedAt && (
                        <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1, fontFamily: '"Courier New", monospace' }}>
                          {t('onboarding.completedOn')} {new Date(item.completedAt).toLocaleString()} 
                          {item.completedBy?.firstName && ` ${t('onboarding.by')} ${item.completedBy.firstName} ${item.completedBy.lastName}`}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </Box>
            </Paper>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #ececec' }}>
        <Button onClick={onClose} sx={{ ...unifiedButtonSx, color: '#888' }}>{t('actions.close')}</Button>
      </DialogActions>

      <DocumentUploadModal 
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        defaultProjectId={stableProjectId}
        defaultClientId={stableClientId}
        defaultPropertyId={stablePropertyId}
        defaultApartmentId={stableApartmentId}
        onUploadSuccess={handleDocumentUploadSuccess}
      />

      <DocumentViewer 
        open={!!viewingDoc} 
        onClose={() => setViewingDoc(null)} 
        document={viewingDoc} 
      />
    </Dialog>
  )
}