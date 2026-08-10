import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material'
import { Edit, Delete, Public, Business } from '@mui/icons-material'

export const getMessageTemplatesColumns = (t, onEdit, onDelete) => [
  {
    field: 'name',
    headerName: t('sms.templates.columns.name', 'Name'),
    flex: 1,
    minWidth: 200,
    renderCell: (params) => (
      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
          {params.row.name}
        </Typography>
        {params.row.category && (
          <Chip 
            label={params.row.category} 
            size="small" 
            sx={{ 
              height: 18, 
              fontSize: '0.65rem', 
              mt: 0.5, 
              borderRadius: 0, 
              fontFamily: '"Courier New", monospace',
              bgcolor: '#f5f5f5',
              color: '#666'
            }}
          />
        )}
      </Box>
    )
  },
  {
    field: 'project',
    headerName: t('sms.templates.columns.project', 'Project'),
    minWidth: 150,
    renderCell: (params) => {
      const isGlobal = !params.row.projectId
      const projectName = isGlobal 
        ? t('sms.templates.globalTemplate', 'Global') 
        : (params.row.projectId?.name || params.row.projectId?.title?.es || params.row.projectId?.title?.en || t('sms.templates.project', 'Project'))

      return (
        <Box display="flex" alignItems="center" gap={1}>
          {isGlobal ? (
            <Public sx={{ fontSize: 16, color: '#2196f3' }} />
          ) : (
            <Business sx={{ fontSize: 16, color: '#4caf50' }} />
          )}
          <Typography variant="body2" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
            {projectName}
          </Typography>
        </Box>
      )
    }
  },
  {
    field: 'template',
    headerName: t('sms.templates.columns.content', 'Content'),
    flex: 1.5,
    minWidth: 250,
    renderCell: (params) => (
      <Typography 
        variant="body2" 
        sx={{ 
          fontFamily: '"Courier New", monospace',
          fontSize: '0.75rem',
          color: '#333',
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}
      >
        {params.row.template}
      </Typography>
    )
  },
  {
    field: 'placeholders',
    headerName: t('sms.templates.columns.variables', 'Variables'),
    minWidth: 180,
    renderCell: (params) => (
      <Box display="flex" gap={0.5} flexWrap="wrap">
        {params.row.placeholders && params.row.placeholders.length > 0 ? (
          params.row.placeholders.slice(0, 3).map((ph, idx) => (
            <Chip 
              key={idx}
              label={`{{${ph}}}`} 
              size="small" 
              sx={{ 
                height: 20, 
                fontSize: '0.6rem', 
                borderRadius: 0, 
                fontFamily: '"Courier New", monospace',
                bgcolor: '#e3f2fd',
                color: '#1976d2'
              }}
            />
          ))
        ) : (
          <Typography variant="caption" color="text.secondary">-</Typography>
        )}
        {params.row.placeholders?.length > 3 && (
          <Chip 
            label={`+${params.row.placeholders.length - 3}`} 
            size="small" 
            sx={{ height: 20, fontSize: '0.6rem', borderRadius: 0, bgcolor: '#f5f5f5' }}
          />
        )}
      </Box>
    )
  },
  {
    field: 'isActive',
    headerName: t('sms.templates.columns.status', 'Status'),
    minWidth: 100,
    renderCell: (params) => (
      <Chip
        label={params.row.isActive ? t('sms.templates.active', 'Active') : t('sms.templates.inactive', 'Inactive')}
        size="small"
        sx={{
          height: 22,
          fontSize: '0.65rem',
          borderRadius: 0,
          fontFamily: '"Courier New", monospace',
          fontWeight: 600,
          bgcolor: params.row.isActive ? '#e8f5e9' : '#ffebee',
          color: params.row.isActive ? '#2e7d32' : '#c62828'
        }}
      />
    )
  },
  {
    field: 'actions',
    headerName: t('sms.templates.columns.actions', 'Actions'),
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Box display="flex" gap={0.5}>
        <Tooltip title={t('sms.actions.edit', 'Edit')}>
          <IconButton 
            size="small"
            onClick={() => onEdit(params.row)}
            sx={{ borderRadius: 0, '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <Edit fontSize="small" sx={{ color: '#000' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('sms.actions.delete', 'Delete')}>
          <IconButton 
            size="small"
            onClick={() => onDelete(params.row._id)}
            sx={{ borderRadius: 0, '&:hover': { bgcolor: '#ffebee' } }}
          >
            <Delete fontSize="small" sx={{ color: '#f44336' }} />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }
]