import { Box, Typography, Button, Chip } from '@mui/material'

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
        />
      )
    },
    {
      field: 'project',
      headerName: t('filters.project', 'Proyecto'),
      minWidth: 150,
      renderCell: ({ row }) => (
        <Typography variant="body2">
          {row.projectId?.name || row.projectId?.title?.es || t('common.na', 'N/A')}
        </Typography>
      )
    },
    {
      field: 'questionCount',
      headerName: t('templates.questions', 'Preguntas'),
      minWidth: 100,
      renderCell: ({ row }) => (
        <Typography variant="body2">
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
        />
      )
    },
    {
      field: 'actions',
      headerName: t('actionstable', 'Acciones'),
      minWidth: 180,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {/* <Button 
            variant="outlined" 
            size="small" 
            color="primary" 
            onClick={() => onView(row)}
          >
            {t('actions.view', 'Ver')}
          </Button> */}
          <Button 
            variant="outlined" 
            size="small" 
            color="info" 
            onClick={() => onEdit(row)}
          >
            {t('actions.edit', 'Editar')}
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            color="error" 
            onClick={() => onDelete(row)}
          >
            {t('actions.delete', 'Eliminar')}
          </Button>
        </Box>
      )
    }
  ]
}