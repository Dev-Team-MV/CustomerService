// apps/mv-crm/src/components/documents/DocumentCard.jsx
import { useMemo } from 'react'
import { Box, Typography, Chip, IconButton, Tooltip, Paper, Divider } from '@mui/material'
import { 
  PictureAsPdf, Image, Description, History, Archive, Delete, 
  Business, Person, Home, Apartment 
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const getCategoryIcon = (category) => {
  if (['contract', 'deed', 'permit'].includes(category)) return <Description />
  if (['blueprint', 'appraisal'].includes(category)) return <Image />
  return <PictureAsPdf />
}

const getDaysUntilExpiry = (expiresAt) => {
  if (!expiresAt) return null
  const days = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
  return days
}

export default function DocumentCard({ doc, onPreview, onHistory, onArchive, onDelete }) {
  const { t } = useTranslation('documents')
  const daysLeft = getDaysUntilExpiry(doc.expiresAt)
  
  let statusColor = 'default'
  let statusLabel = t('status.valid')
  if (doc.isArchived) { statusColor = 'default'; statusLabel = t('status.archived') }
  else if (daysLeft !== null && daysLeft < 0) { statusColor = 'error'; statusLabel = t('status.expired') }
  else if (daysLeft !== null && daysLeft <= 30) { statusColor = 'warning'; statusLabel = t('status.expiringSoon') }

  // ✅ Lógica robusta para extraer la información de la propiedad/apartamento
  const propertyInfo = useMemo(() => {
    if (doc.apartmentId) {
      const apt = typeof doc.apartmentId === 'object' ? doc.apartmentId : {}
      const num = apt.apartmentNumber || apt.number || ''
      const floor = apt.floorNumber ? ` (Piso ${apt.floorNumber})` : ''
      return num ? `Apto ${num}${floor}` : 'Apartamento'
    }
    if (doc.propertyId) {
      const prop = typeof doc.propertyId === 'object' ? doc.propertyId : {}
      
      // Manejar tanto si viene populado por el backend como si lo enriquecimos en Documents.jsx
      const lotNumber = typeof prop.lot === 'object' ? prop.lot?.number : null
      const modelName = typeof prop.model === 'object' ? (prop.model?.model || prop.model?.name) : null
      
      if (lotNumber || modelName) {
        return `Lote ${lotNumber || '?'}${modelName ? ` - ${modelName}` : ''}`
      }
      return 'Propiedad'
    }
    return null
  }, [doc.apartmentId, doc.propertyId])

  const projectName = doc.projectId?.name || doc.projectId?.title?.es || doc.projectId?.title?.en
  const clientName = doc.clientId 
    ? `${doc.clientId.firstName || ''} ${doc.clientId.lastName || ''}`.trim() 
    : (doc.leadId?.name || null)

  return (
    <Paper elevation={0} sx={{ p: 2, border: '1px solid #ececec', borderRadius: 2, transition: '0.2s', '&:hover': { boxShadow: 2, borderColor: '#1976d2' }, display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* Header: Icono, Título, Versión y Estado */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Box display="flex" alignItems="center" gap={1} sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ color: '#1976d2', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {getCategoryIcon(doc.category)}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography fontWeight={600} noWrap sx={{ maxWidth: '100%' }} title={doc.title}>
              {doc.title}
            </Typography>
            {doc.version && doc.version > 1 && (
              <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ display: 'block', mt: 0.5 }}>
                {t('document.version', 'Versión')} {doc.version}
              </Typography>
            )}
          </Box>
        </Box>
        <Chip label={statusLabel} size="small" color={statusColor} variant="outlined" sx={{ ml: 1, flexShrink: 0, height: 22 }} />
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Información Relacionada */}
      <Box display="flex" flexDirection="column" gap={1} mb={2} sx={{ flex: 1 }}>
        {projectName && (
          <Box display="flex" alignItems="center" gap={1}>
            <Business sx={{ fontSize: 16, color: '#757575' }} />
            <Typography variant="caption" color="text.secondary" noWrap>{projectName}</Typography>
          </Box>
        )}
        
        {clientName && (
          <Box display="flex" alignItems="center" gap={1}>
            <Person sx={{ fontSize: 16, color: '#757575' }} />
            <Typography variant="caption" color="text.secondary" noWrap>{clientName}</Typography>
          </Box>
        )}
        
        {propertyInfo && (
          <Box display="flex" alignItems="center" gap={1}>
            {doc.apartmentId ? <Apartment sx={{ fontSize: 16, color: '#757575' }} /> : <Home sx={{ fontSize: 16, color: '#757575' }} />}
            <Typography variant="caption" color="text.secondary" noWrap>{propertyInfo}</Typography>
          </Box>
        )}
        
        {/* Fallback si no hay datos relacionados */}
        {!projectName && !clientName && !propertyInfo && (
          <Typography variant="caption" color="text.secondary" fontStyle="italic">
            {t('document.noRelations', 'Sin relaciones asignadas')}
          </Typography>
        )}
      </Box>

      {/* Tags */}
      {doc.tags && doc.tags.length > 0 && (
        <Box display="flex" gap={0.5} flexWrap="wrap" mb={2}>
          {doc.tags.slice(0, 3).map((tag, idx) => (
            <Chip key={idx} label={`#${tag}`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#f5f5f5' }} />
          ))}
          {doc.tags.length > 3 && (
            <Chip label={`+${doc.tags.length - 3}`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#e0e0e0' }} />
          )}
        </Box>
      )}

      {/* Acciones */}
      <Box display="flex" justifyContent="flex-end" gap={0.5} mt="auto">
        <Tooltip title={t('actions.preview')}>
          <IconButton size="small" onClick={() => onPreview(doc)}><Description fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title={t('actions.history')}>
          <IconButton size="small" onClick={() => onHistory(doc)}><History fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title={t('actions.archive')}>
          <IconButton size="small" onClick={() => onArchive(doc)} color="warning"><Archive fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title={t('actions.delete')}>
          <IconButton size="small" onClick={() => onDelete(doc)} color="error"><Delete fontSize="small" /></IconButton>
        </Tooltip>
      </Box>
    </Paper>
  )
}