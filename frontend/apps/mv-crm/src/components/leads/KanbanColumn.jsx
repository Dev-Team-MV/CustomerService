// apps/mv-crm/src/components/leads/KanbanColumn.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography, IconButton, Tooltip, Badge } from '@mui/material'
import { Add, DragIndicator } from '@mui/icons-material'
import LeadCard from './LeadCard'

const KanbanColumn = ({ 
  column,
  leads, 
  onLeadClick, 
  onMenuClick,
  onAddClick,
  onDragStart,
  onDrop,
  onScoreUpdate
}) => {
  const { t } = useTranslation('leads')
  const [dragOver, setDragOver] = useState(false)

  // ✅ NUEVO: Mapeo de column keys a traducciones
  const COLUMN_KEYS = {
    'nuevo': 'stages.nuevo',
    'contactado': 'stages.contactado',
    'visita_agendada': 'stages.visita_agendada',
    'propuesta': 'stages.propuesta',
    'vendido': 'stages.vendido',
    'perdido': 'stages.perdido'
  }

  // ✅ NUEVO: Obtener nombre traducido o usar el nombre original como fallback
  const getColumnName = () => {
    const translationKey = COLUMN_KEYS[column.key]
    if (translationKey) {
      const translated = t(translationKey)
      // Si la traducción no existe, t() devuelve la misma clave
      if (translated !== translationKey) {
        return translated
      }
    }
    // Fallback: usar column.name
    return column.name
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    onDrop?.(column.key)
  }

  return (
    <Box
      sx={{
        minWidth: 320,
        maxWidth: 320,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: dragOver ? '#e3f2fd' : '#f5f5f5',
        borderRadius: 2,
        p: 2,
        transition: 'all 0.2s ease',
        border: dragOver ? '2px dashed #2196f3' : '2px solid transparent'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          pb: 1.5,
          borderBottom: `2px solid ${column.color}`
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: column.color
            }}
          />
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#000'
            }}
          >
            {getColumnName()}
          </Typography>
          <Badge
            badgeContent={leads.length}
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: column.color,
                color: '#fff',
                fontFamily: '"Courier New", monospace',
                fontSize: '0.65rem',
                fontWeight: 700,
                height: 18,
                minWidth: 18,
                padding: '0 4px'
              }
            }}
          />
        </Box>

        <Tooltip title={t('addLead', 'Agregar lead')}>
          <IconButton
            size="small"
            onClick={onAddClick}
            sx={{
              color: '#000',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
            }}
          >
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Leads */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {leads.map(lead => (
          <Box
            key={lead._id}
            draggable
            onDragStart={() => onDragStart?.(lead)}
            sx={{
              cursor: 'grab',
              '&:active': {
                cursor: 'grabbing'
              }
            }}
          >
            <LeadCard
              lead={lead}
              onClick={onLeadClick}
              onMenuClick={onMenuClick}
              onScoreUpdate={onScoreUpdate}
            />
          </Box>
        ))}

        {leads.length === 0 && (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              border: '2px dashed #e0e0e0',
              borderRadius: 1,
              bgcolor: '#fafafa'
            }}
          >
            <DragIndicator sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                color: '#888',
                letterSpacing: '0.5px'
              }}
            >
              {t('noLeads', 'Sin leads')}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default KanbanColumn