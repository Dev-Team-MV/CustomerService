import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'

export const getMessageTemplatesColumns = (t, onEdit, onDelete) => [
  {
    field: 'name',
    headerName: t('sms.templates.columns.name'),
    flex: 1,
    minWidth: 200,
    renderCell: (params) => (
      <Box>
        <Typography variant="body2" fontWeight={600}>
          {params.row.name}
        </Typography>
        {params.row.category && (
          <Chip 
            label={params.row.category} 
            size="small" 
            sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
          />
        )}
      </Box>
    )
  },
  {
    field: 'template',
    headerName: t('sms.templates.columns.content'),
    flex: 1,
    minWidth: 300,
    renderCell: (params) => (
      <Typography variant="body2" sx={{ 
        overflow: 'hidden', 
        textOverflow: 'ellipsis', 
        whiteSpace: 'nowrap',
        maxWidth: '100%'
      }}>
        {params.row.template}
      </Typography>
    )
  },
  {
    field: 'description',
    headerName: t('sms.templates.columns.description'),
    flex: 1,
    minWidth: 200,
    renderCell: (params) => (
      <Typography variant="caption" color="text.secondary">
        {params.row.description || '-'}
      </Typography>
    )
  },
  {
    field: 'actions',
    headerName: t('sms.templates.columns.actions'),
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Box display="flex" gap={0.5}>
        <Tooltip title={t('sms.actions.edit')}>
          <IconButton 
            size="small"
            onClick={() => onEdit(params.row)}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('sms.actions.delete')}>
          <IconButton 
            size="small"
            color="error"
            onClick={() => onDelete(params.row._id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }
]