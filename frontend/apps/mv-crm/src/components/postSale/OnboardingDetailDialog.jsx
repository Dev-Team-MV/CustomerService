import { useState, useEffect } from 'react'
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  Box, Typography, LinearProgress, Checkbox, FormControlLabel,
  Paper, Chip, CircularProgress, TextField, Grid, IconButton,
  useMediaQuery, useTheme
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
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

  const unifiedButtonSx = { 
    borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', letterSpacing: '0.5px', width: { xs: '100%', sm: 'auto' },
    '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } 
  }
  
  const inputSx = { 
    fontFamily: '"Courier New", monospace', fontSize: '0.75rem', borderRadius: 0, 
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' }
  }

  return (
    // ✅ ID 1: Modal completo (Punto de anclaje inicial estable para el tour)
    <Dialog id="onboarding-detail-modal" open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec', width: '100%' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ececec', p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" sx={{ fontFamily: '"Courier New", monospace', fontSize: { xs: '0.75rem', sm: '0.85rem' }, letterSpacing: '1px', textTransform: 'uppercase' }}>
          {t('onboarding.checklistDetails')}
        </Typography>
        <Chip 
          label={t(`onboarding.statuses.${onboarding.status}`, onboarding.status)} 
          color={onboarding.status === 'completed' ? 'success' : onboarding.status === 'in_progress' ? 'primary' : 'default'}
          sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.65rem', fontWeight: 600, maxWidth: 120 }}
        />
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, overflowX: 'hidden' }}>
        {/* ✅ ID 2: Resumen Superior */}
        <Box id="onboarding-detail-summary" sx={{ mb: 3, p: { xs: 2, sm: 2 }, bgcolor: '#f9f9f9', borderRadius: 0, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                <Business fontSize="small" color="action" sx={{ flexShrink: 0 }} />
                <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif', wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {typeof onboarding.projectId === 'object' ? onboarding.projectId.name : t('common.na')}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                {isApartment ? <Apartment fontSize="small" color="primary" sx={{ flexShrink: 0 }} /> : <Home fontSize="small" color="success" sx={{ flexShrink: 0 }} />}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif', wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {isApartment ? `${t('onboarding.apt')} ${aptNumber}` : `${t('onboarding.lot')} ${lotNumber}`}
                  </Typography>
                  {!isApartment && modelName && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: '"Courier New", monospace', wordBreak: 'break-all' }}>
                      {modelName}
                    </Typography>
                  )}
                  {isApartment && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: '"Courier New", monospace', wordBreak: 'break-all' }}>
                      {buildingName}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                <Person fontSize="small" color="action" sx={{ flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontFamily: '"Helvetica Neue", sans-serif', wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
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

        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, fontFamily: '"Courier New", monospace', letterSpacing: '1px', textTransform: 'uppercase', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
          {t('onboarding.checklistItems')}
        </Typography>
        
        {/* ✅ ID 3: Contenedor de la Lista de Ítems */}
        <Box id="onboarding-detail-items" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {localItems.map((item, index) => {
            const isFirst = index === 0 // ✅ Detectar el primer ítem para asignar IDs únicos al tour

            return (
              <Paper 
                key={item.key} 
                variant="outlined" 
                sx={{ 
                  p: { xs: 1.5, sm: 2 }, borderRadius: 0, border: '1px solid #e0e0e0',
                  bgcolor: item.completed ? '#f1f8e9' : 'background.paper',
                  borderColor: item.completed ? '#4caf50' : '#e0e0e0',
                  opacity: updatingKey === item.key ? 0.7 : 1,
                  transition: 'all 0.2s',
                  overflow: 'hidden'
                }}
              >
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'flex-start' }} gap={2} sx={{ minWidth: 0 }}>
                  <FormControlLabel
                    control={
                      // ✅ ID 4: Checkbox del primer ítem
                      <Checkbox 
                        id={isFirst ? 'onboarding-item-checkbox' : undefined}
                        checked={item.completed} 
                        onChange={() => handleToggleItem(item.key)}
                        disabled={updatingKey === item.key}
                        icon={<Circle />}
                        checkedIcon={<CheckCircle color="success" />}
                        sx={{ mt: { xs: 0, sm: 0.5 }, flexShrink: 0 }}
                      />
                    }
                    label={
                      <Box sx={{ width: '100%', minWidth: 0 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                          <Typography sx={{ 
                            fontWeight: 600,
                            textDecoration: item.completed ? 'line-through' : 'none',
                            color: item.completed ? 'text.secondary' : 'text.primary',
                            fontFamily: '"Helvetica Neue", sans-serif',
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            wordBreak: 'break-word',
                            flex: '1 1 auto',
                            minWidth: 0
                          }}>
                            {item[currentLang] || item.label_es || item.label || item.key}
                            {updatingKey === item.key && <CircularProgress size={16} sx={{ ml: 1 }} />}
                          </Typography>
                        </Box>
                        
                        {/* ✅ ID 5: Campo de notas del primer ítem */}
                        <TextField
                          id={isFirst ? 'onboarding-item-notes' : undefined}
                          fullWidth
                          size="small"
                          variant="outlined"
                          placeholder={t('onboarding.addNotes')}
                          value={notes[item.key] || ''}
                          onChange={(e) => setNotes(prev => ({ ...prev, [item.key]: e.target.value }))}
                          sx={{ mt: 1, mb: 1, ...inputSx }}
                        />

                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" sx={{ width: '100%', minWidth: 0 }}>
                          {/* ✅ ID 6: Botón de subir archivo del primer ítem */}
                          <Button
                            id={isFirst ? 'onboarding-item-upload' : undefined}
                            variant="outlined"
                            size="small"
                            startIcon={<CloudUpload />}
                            onClick={() => openDocumentUploadModal(item.key)}
                            sx={{ ...unifiedButtonSx, border: '1px solid #000', color: '#000', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#555', color: '#555', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' }, flexShrink: 0 }}
                          >
                            {item.requiredDocumentId ? t('onboarding.replaceDoc') : t('onboarding.uploadDoc')}
                          </Button>
                          
                          {item.requiredDocumentId && (
                            <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap" sx={{ mt: { xs: 1, sm: 0 }, width: { xs: '100%', sm: 'auto' }, minWidth: 0 }}>
                              <Chip 
                                label={item.requiredDocumentId.title || t('onboarding.documentAttached')} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                                icon={<Description fontSize="small" />}
                                onClick={() => setViewingDoc(item.requiredDocumentId)}
                                sx={{ 
                                  cursor: 'pointer', 
                                  borderRadius: 0, 
                                  fontFamily: '"Courier New", monospace', 
                                  fontSize: '0.7rem', 
                                  '&:hover': { bgcolor: 'action.hover' }, 
                                  flex: { xs: 1, sm: 'none' },
                                  maxWidth: '100%',
                                  '& .MuiChip-label': {
                                    wordBreak: 'break-all',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '100%'
                                  }
                                }}
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
                                sx={{ borderRadius: 0, flexShrink: 0 }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                        
                        {item.completed && item.completedAt && (
                          <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1, fontFamily: '"Courier New", monospace', fontSize: '0.7rem', wordBreak: 'break-word' }}>
                            {t('onboarding.completedOn')} {new Date(item.completedAt).toLocaleString()} 
                            {item.completedBy?.firstName && ` ${t('onboarding.by')} ${item.completedBy.firstName} ${item.completedBy.lastName}`}
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ width: '100%', m: 0, alignItems: 'flex-start' }}
                  />
                </Box>
              </Paper>
            )
          })}
        </Box>
      </DialogContent>

      {/* ✅ ID 7: Acciones de cierre */}
      <DialogActions sx={{ p: 2, borderTop: '1px solid #ececec', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
        <Button 
          id="onboarding-detail-close" 
          onClick={onClose} 
          sx={{ ...unifiedButtonSx, color: '#888', width: '100%' }}
        >
          {t('actions.close')}
        </Button>
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