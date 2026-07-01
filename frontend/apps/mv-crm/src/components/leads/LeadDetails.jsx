// apps/mv-crm/src/components/leads/LeadDetails.jsx
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Divider,
  Button,
  Paper,
  Alert
} from '@mui/material'
import { 
  Close, 
  Edit, 
  Delete,
  Email,
  Phone,
  Business,
  Source,
  CalendarToday,
  CheckCircle,
  Warning
} from '@mui/icons-material'
import { STAGE_COLORS } from '../../services/leadService'

const formatDate = (dateString, locale = 'es-ES') => {
  if (!dateString) return 'Sin fecha'
  return new Date(dateString).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const LeadDetails = ({ 
  lead, 
  open, 
  onClose, 
  onEdit, 
  onDelete,
  onConvert,
  stages = []
}) => {
  const { t, i18n } = useTranslation('leads')
  const locale = i18n.language === 'es' ? 'es-ES' : 'en-US'

  if (!lead) return null

  // ✅ Obtener el stage correctamente (lead.stage es un string como 'nuevo', 'contactado', etc.)
  const stageKey = typeof lead.stage === 'object' ? lead.stage.key : lead.stage
  const stage = stages.find(s => s.key === stageKey || s._id === stageKey)
  
  // ✅ Obtener el color del stage (fallback al enum de colores)
  const stageColor = stage?.color || STAGE_COLORS[stageKey] || '#757575'
  const stageName = stage?.name || (stageKey ? stageKey.charAt(0).toUpperCase() + stageKey.slice(1).replace('_', ' ') : 'Desconocido')
  
  const assignee = lead.assignedTo
  const project = lead.projectId // ✅ El backend devuelve projectId populated

  // Verificar si el lead está perdido
  const isLost = stageKey === 'perdido'

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 450 }, p: 0, display: 'flex', flexDirection: 'column' } }}
    >
      {/* ✅ Header con color del stage */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: stageColor,
          color: 'white',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Efecto decorativo */}
        <Box
          sx={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />
        
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" position="relative" zIndex={1}>
          <Box flex={1}>
            <Chip
              label={stageName}
              size="small"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                mb: 1,
                fontWeight: 600,
                backdropFilter: 'blur(10px)'
              }}
            />
            <Typography variant="h6" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
              {lead.name}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            sx={{ 
              color: 'white', 
              flexShrink: 0,
              bgcolor: 'rgba(255,255,255,0.15)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
        {/* ✅ Alerta si está perdido */}
        {isLost && lead.lostReason && (
          <Alert 
            severity="error" 
            icon={<Warning />}
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t('lostReason') || 'Razón de pérdida'}
            </Typography>
            <Typography variant="body2">
              {lead.lostReason}
            </Typography>
          </Alert>
        )}

        {/* Source */}
        <Box display="flex" gap={1} mb={3} flexWrap="wrap">
          {lead.source && (
            <Chip
              icon={<Source sx={{ fontSize: 14 }} />}
              label={t(`source.${lead.source}`) || lead.source}
              variant="outlined"
            />
          )}
        </Box>

        {/* Contact Info */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
            {t('details.contactInfo')}
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {lead.email && (
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ bgcolor: '#2196f3', width: 32, height: 32 }}>
                    <Email sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{t('form.email')}</Typography>
                    <Typography fontWeight={500}>{lead.email}</Typography>
                  </Box>
                </Box>
              )}
              {lead.phone && (
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 32, height: 32 }}>
                    <Phone sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{t('form.phone')}</Typography>
                    <Typography fontWeight={500}>{lead.phone}</Typography>
                  </Box>
                </Box>
              )}
              {!lead.email && !lead.phone && (
                <Typography variant="caption" color="text.secondary">
                  {t('details.noContactInfo') || 'Sin información de contacto'}
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Project */}
        {project && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              {t('form.project')}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#e3f2fd' }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32 }}>
                  <Business sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography fontWeight={600} sx={{ color: '#1565c0' }}>
                  {project.name || project.title?.es || project.title?.en || 'Sin nombre'}
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Assigned To */}
        {assignee && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              {t('form.assignedTo')}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar sx={{ bgcolor: '#9c27b0', width: 32, height: 32 }}>
                  {assignee.firstName?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>
                    {`${assignee.firstName || ''} ${assignee.lastName || ''}`.trim()}
                  </Typography>
                  {assignee.email && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {assignee.email}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {/* Notes */}
        {lead.notes && (
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              {t('form.notes')}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fafafa' }}>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {lead.notes}
              </Typography>
            </Paper>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Dates */}
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <CalendarToday sx={{ fontSize: 16, color: '#757575' }} />
          <Typography variant="caption" color="text.secondary">
            {t('details.created')}: {formatDate(lead.createdAt, locale)}
          </Typography>
        </Box>
        
        {lead.updatedAt && lead.updatedAt !== lead.createdAt && (
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CalendarToday sx={{ fontSize: 16, color: '#757575' }} />
            <Typography variant="caption" color="text.secondary">
              {t('details.updated') || 'Actualizado'}: {formatDate(lead.updatedAt, locale)}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', flexShrink: 0, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => onEdit?.(lead)}
          sx={{ flex: 1 }}
          size="small"
        >
          {t('edit')}
        </Button>
        {!isLost && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => onConvert?.(lead)}
            sx={{ flex: 1 }}
            size="small"
          >
            {t('convert')}
          </Button>
        )}
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={() => {
            if (window.confirm(t('deleteConfirm'))) {
              onDelete?.(lead._id)
              onClose()
            }
          }}
          size="small"
        >
          <Delete />
        </Button>
      </Box>
    </Drawer>
  )
}

export default LeadDetails