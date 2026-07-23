import { useState, useMemo } from 'react'
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Box, Typography, Grid, Chip, Button, TextField, Divider, ImageList, ImageListItem 
} from '@mui/material'
import { Home, Apartment, Business, Person, CalendarToday } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

import WarrantyTimeline from './WarrantyTimeline'

export default function WarrantyDetailDialog({ open, onClose, warranty, onResolve, resolving, propertiesMap = {} }) {
  const { t } = useTranslation('postSale')
  const { lots = {}, models = {}, buildings = {}, apartments = {} } = propertiesMap

  const [resolutionText, setResolutionText] = useState(warranty?.resolution || '')
  const [resolveStatus, setResolveStatus] = useState('resolved')

  const timelineEvents = useMemo(() => {
    if (!warranty) return []
    const events = []
    const client = warranty.clientId
    
    events.push({
      status: 'submitted',
      createdAt: warranty.createdAt,
      notes: 'Reclamo registrado en el sistema', // Podrías mover esto al JSON si lo deseas
      user: client && typeof client === 'object' ? `${client.firstName} ${client.lastName}` : t('warranty.client')
    })

    const isAlreadyResolved = warranty.status === 'resolved' || warranty.status === 'rejected'
    
    if (isAlreadyResolved) {
      events.push({
        status: warranty.status,
        createdAt: warranty.resolvedAt || warranty.updatedAt,
        notes: warranty.resolution || 'Sin detalles adicionales',
        user: 'Administrador'
      })
    } else if (warranty.status !== 'submitted') {
      events.push({
        status: warranty.status,
        createdAt: warranty.updatedAt,
        notes: `Estado actualizado a: ${t(`warranty.statuses.${warranty.status}`)}`,
        user: 'Sistema'
      })
    }
    return events
  }, [warranty, t])

  if (!warranty || !open) return null

  const project = warranty.projectId
  const client = warranty.clientId
  const isApartment = !!warranty.apartmentId
  const unit = isApartment ? warranty.apartmentId : warranty.propertyId
  
  let displayUnit = t('common.na')
  let displayModel = ''
  let displayBuilding = t('common.na')
  let displayFloor = t('common.na')

  if (isApartment) {
    const apt = typeof unit === 'object' ? unit : apartments[unit]
    if (apt) {
      displayUnit = `${t('warranty.apartment')} ${apt.apartmentNumber || (typeof unit === 'string' ? String(unit).slice(-6) : t('common.na'))}`
      displayFloor = apt.floorNumber || t('common.na')
      const bldg = typeof apt.building === 'object' ? apt.building : buildings[apt.building]
      displayBuilding = bldg?.name || (typeof apt.building === 'string' ? `ID: ${String(apt.building).slice(-6)}` : t('common.na'))
    } else {
      displayUnit = `${t('warranty.apartment')} ${typeof unit === 'string' ? String(unit).slice(-6) : t('common.na')}`
    }
  } else {
    const propId = typeof unit === 'string' ? unit : unit?._id
    const propObj = typeof unit === 'object' ? unit : (lots[propId] || {})
    
    const lotId = typeof propObj.lot === 'string' ? propObj.lot : propObj.lot?._id
    const modelId = typeof propObj.model === 'string' ? propObj.model : propObj.model?._id
    
    const lotData = lots[lotId] || propObj.lot || {}
    const modelData = models[modelId] || propObj.model || {}
    
    displayUnit = `${t('warranty.property')} ${lotData.number || lotData.name || (propId ? String(propId).slice(-6) : t('common.na'))}`
    displayModel = modelData.name || modelData.model || ''
  }

  const isAlreadyResolved = warranty.status === 'resolved' || warranty.status === 'rejected'

  const handleResolveClick = () => {
    if (!resolutionText.trim()) {
      alert(t('warranty.resolutionRequired'))
      return
    }
    onResolve(warranty._id, { resolution: resolutionText, status: resolveStatus })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {t('warranty.claimDetails')} #{warranty._id.slice(-6)}
        </Typography>
        <Chip 
          label={t(`warranty.statuses.${warranty.status}`)} 
          color={warranty.status === 'resolved' ? 'success' : warranty.status === 'rejected' ? 'error' : 'default'} 
        />
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Person fontSize="small" /> {t('warranty.clientLabel')}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {client?.firstName} {client?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">{client?.email} | {client?.phoneNumber}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Business fontSize="small" /> {t('warranty.projectLabel')}
              </Typography>
              <Typography variant="body1" fontWeight={600}>{project?.name || project?.title?.es || t('common.na')}</Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {isApartment ? <Apartment fontSize="small" /> : <Home fontSize="small" />} {t('warranty.unit')}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {displayUnit}
              </Typography>
              {isApartment && (
                <Typography variant="body2">
                  {t('warranty.building')}: {displayBuilding} | {t('warranty.floor')} {displayFloor}
                </Typography>
              )}
              {!isApartment && displayModel && (
                <Typography variant="body2">
                  {t('warranty.model')}: {displayModel}
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarToday fontSize="small" /> {t('warranty.createdAt')}
              </Typography>
              <Typography variant="body2">{new Date(warranty.createdAt).toLocaleString()}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>{t('warranty.category')} & {t('warranty.priority')}</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={t(`warranty.categories.${warranty.category}`)} size="small" variant="outlined" />
                <Chip 
                  label={t(`warranty.priorities.${warranty.priority}`)} 
                  size="small" 
                  color={warranty.priority === 'high' || warranty.priority === 'emergency' ? 'error' : 'default'} 
                />
              </Box>
              
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>{t('warranty.description')}</Typography>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
                <Typography variant="body2">{warranty.description}</Typography>
              </Box>
            </Box>

            {warranty.photoUrls && warranty.photoUrls.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>{t('warranty.photoEvidence')}</Typography>
                <ImageList sx={{ width: '100%', height: 200 }} cols={3} rowHeight={164}>
                  {warranty.photoUrls.map((url, index) => (
                    <ImageListItem key={index}>
                      <img 
                        src={url} 
                        alt={`Evidencia ${index + 1}`} 
                        style={{ borderRadius: 8, objectFit: 'cover', width: '100%', height: '100%', cursor: 'pointer' }} 
                        onClick={() => window.open(url, '_blank')} 
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />
        <WarrantyTimeline events={timelineEvents} />

        {!isAlreadyResolved && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>{t('warranty.resolveClaim')}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label={t('warranty.finalStatus')}
                  value={resolveStatus}
                  onChange={(e) => setResolveStatus(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="resolved">{t('warranty.statuses.resolved')}</option>
                  <option value="rejected">{t('warranty.statuses.rejected')}</option>
                </TextField>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t('warranty.resolutionNotes')}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
        <Button onClick={onClose} color="inherit">{t('actions.close')}</Button>
        {!isAlreadyResolved && (
          <Button 
            variant="contained" 
            color={resolveStatus === 'resolved' ? 'success' : 'error'}
            onClick={handleResolveClick}
            disabled={resolving || !resolutionText.trim()}
          >
            {resolving ? t('actions.processing') : (resolveStatus === 'resolved' ? t('warranty.markResolved') : t('warranty.markRejected'))}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}