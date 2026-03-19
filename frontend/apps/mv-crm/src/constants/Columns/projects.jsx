import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material'
import { Search, Delete, Edit, Visibility, BarChart } from '@mui/icons-material'

export const useProjectColumns = ({
  t,
  navigate,
  openStats,
  setEditProject,
  setCreateOpen,
  handleDelete,
}) => [
  {
    field: 'name', headerName: t('table.name'), minWidth: 220,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: '#000', borderRadius: 0, fontSize: '0.65rem', fontWeight: 700, fontFamily: '"Courier New", monospace', flexShrink: 0 }}>
          {row.name?.substring(0, 2).toUpperCase()}
        </Avatar>
        <Box>
          <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.88rem', fontWeight: 500, color: '#000', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            {row.name}
          </Typography>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#aaa', letterSpacing: '0.5px' }}>
            {row.slug}
          </Typography>
        </Box>
      </Box>
    )
  },
  {
    field: 'type', headerName: t('table.type'), minWidth: 120,
    renderCell: ({ row }) => (
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', color: '#444', letterSpacing: '0.5px', textTransform: 'capitalize' }}>
        {row.type?.replace('_', ' ')}
      </Typography>
    )
  },
  {
    field: 'status', headerName: t('table.status'), minWidth: 110,
    renderCell: ({ row }) => (
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: row.isActive ? '#000' : '#bbb', letterSpacing: '1px', textTransform: 'uppercase' }}>
        {row.status}
      </Typography>
    )
  },
  {
    field: 'phase', headerName: t('table.phase'), minWidth: 80,
    renderCell: ({ row }) => (
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888' }}>
        {row.phase}
      </Typography>
    )
  },
{
  field: 'actions', headerName: t('table.actions'), minWidth: 90, align: 'center',
  renderCell: ({ row }) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Tooltip title="Statistics">
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); openStats(row) }}
          sx={{
            color: '#aaa', borderRadius: 0,
            '&:hover': { color: '#000', background: '#f5f5f5' }
          }}
        >
          <BarChart sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('table.view')}>
        <IconButton
          size="small"
          sx={{ color: '#aaa', borderRadius: 0 }}
          onClick={() => navigate(`/projects/${row._id}`)}
        >
          <Visibility sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('table.edit')}>
        <IconButton
          size="small"
          sx={{ color: '#aaa', borderRadius: 0 }}
          onClick={() => setEditProject(row)} // ← Cambia por:
          // onClick={() => setEditProject(row); setCreateOpen(true)} 
        >
          <Edit sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('table.delete')}>
        <IconButton
          size="small"
          sx={{ color: '#aaa', borderRadius: 0 }}
          onClick={(e) => { e.stopPropagation(); handleDelete(row._id) }}
        >
          <Delete sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
]