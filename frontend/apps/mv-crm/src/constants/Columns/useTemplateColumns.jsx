import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import { Edit, Delete, Visibility } from '@mui/icons-material'

export const useTemplateColumns = ({ t, onView, onEdit, onDelete }) => {
  return [
    {
      field: 'name',
      headerName: t('templates.name', 'Nombre'),
      minWidth: 200,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight={600}>
          {row.name}
        </Typography>
      )
    },
    {
      field: 'type',
      headerName: t('filters.type', 'Tipo'),
      minWidth: 150,
      renderCell: ({ row }) => (
        <Chip 
          label={t(`survey.types.${row.type}`, row.type)} 
          size="small" 
          color={
            row.type === 'post_sale' ? 'success' : 
            row.type === 'post_construction' ? 'info' : 
            row.type === 'post_warranty' ? 'warning' : 'default'
          } 
          sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }} // ✅ Estética unificada
        />
      )
    },
    {
      field: 'project',
      headerName: t('filters.project', 'Proyecto'),
      minWidth: 150,
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
          {row.projectId?.name || row.projectId?.title?.es || t('common.na', 'N/A')}
        </Typography>
      )
    },
    {
      field: 'questionCount',
      headerName: t('templates.questions', 'Preguntas'),
      minWidth: 100,
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
          {row.questions?.length || 0}
        </Typography>
      )
    },
    {
      field: 'isActive',
      headerName: t('filters.status', 'Estado'),
      minWidth: 120,
      renderCell: ({ row }) => (
        <Chip 
          label={row.isActive ? t('templates.active', 'Activa') : t('templates.inactive', 'Inactiva')} 
          size="small" 
          color={row.isActive ? 'success' : 'default'} 
          variant={row.isActive ? 'outlined' : 'filled'}
          sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.65rem' }} // ✅ Estética unificada
        />
      )
    },
    {
      field: 'actions',
      headerName: t('actionstable', 'Acciones'),
      minWidth: 140, // ✅ Ancho ajustado para íconos
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>

          
          <Tooltip title={t('actions.edit', 'Editar')}>
            <IconButton size="small" color="info" onClick={() => onEdit(row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('actions.delete', 'Eliminar')}>
            <IconButton size="small" color="error" onClick={() => onDelete(row)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]
}