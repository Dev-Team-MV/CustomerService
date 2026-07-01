// apps/mv-crm/src/components/leads/KanbanColumn.jsx
import { useTranslation } from 'react-i18next'
import { Box, Typography, IconButton, Chip, Tooltip } from '@mui/material'
import { Add } from '@mui/icons-material'
import LeadCard from './LeadCard'

const KanbanColumn = ({ 
  column,
  leads, 
  onLeadClick, 
  onLeadMenuClick,
  onAddClick,
  onDragStart,
  onDrop
}) => {
  const { t } = useTranslation('leads')
  const color = column.color || '#757575'

  // ✅ Traducir el nombre del stage usando el key como clave
  // Fallback al nombre original si no existe la traducción
  const translatedName = t(`stages.${column.key}`, column.name)

  return (
    <Box
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        onDrop?.(column.key)
      }}
      sx={{
        flex: '0 0 280px',
        minWidth: 280,
        maxWidth: 280,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8f9fa',
        borderRadius: 3,
        height: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          pb: 1.5,
          borderBottom: '2px solid',
          borderColor: color
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {translatedName}
            </Typography>
            <Chip
              label={leads.length}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: `${color}20`,
                color: color,
                flexShrink: 0
              }}
            />
          </Box>
          
          <Tooltip title={t('addLead')}>
            <IconButton 
              size="small" 
              onClick={onAddClick}
              sx={{ bgcolor: `${color}15`, '&:hover': { bgcolor: `${color}25` } }}
            >
              <Add sx={{ fontSize: 18, color: color }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Cards */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 1.5,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 3 }
        }}
      >
        {leads.length === 0 ? (
          <Box 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              border: '2px dashed #e0e0e0',
              borderRadius: 2,
              color: '#9e9e9e'
            }}
          >
            <Typography variant="caption">{t('noLeads')}</Typography>
          </Box>
        ) : (
          leads.map(lead => (
            <Box
              key={lead._id}
              draggable
              onDragStart={() => onDragStart?.(lead)}
            >
              <LeadCard
                lead={lead}
                onClick={onLeadClick}
                onMenuClick={onLeadMenuClick}
              />
            </Box>
          ))
        )}
      </Box>
    </Box>
  )
}

export default KanbanColumn