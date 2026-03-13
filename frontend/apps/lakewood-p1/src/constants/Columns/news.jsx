import { Box, Typography, Avatar, Chip, IconButton, Tooltip } from '@mui/material'
import { Edit, Delete, Visibility, Article } from '@mui/icons-material'

// ── Helpers ────────────────────────────────────────────────
export const getCategoryColor = (category) => {
  switch (category) {
    case 'construction': return { bg: 'rgba(229, 134, 60, 0.12)',  color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)'  }
    case 'announcement': return { bg: 'rgba(140, 165, 81, 0.12)',  color: '#8CA551', border: 'rgba(140, 165, 81, 0.3)'  }
    case 'report':       return { bg: 'rgba(51, 63, 31, 0.12)',    color: '#333F1F', border: 'rgba(51, 63, 31, 0.3)'    }
    case 'event':        return { bg: 'rgba(33, 150, 243, 0.12)',  color: '#1976d2', border: 'rgba(33, 150, 243, 0.3)'  }
    default:             return { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)' }
  }
}

export const getStatusColor = (status) => {
  if (status === 'published')
    return { bg: 'rgba(140, 165, 81, 0.12)', color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)' }
  return { bg: 'rgba(229, 134, 60, 0.12)', color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)' }
}

// ── Hook de columnas ───────────────────────────────────────
export const useNewsColumns = ({
  t,
  onView,
  onEdit,
  onDelete,
}) => [
  {
    field: 'title',
    headerName: t('news:news'),
    minWidth: 300,
    renderCell: ({ row }) => (
      <Box display="flex" alignItems="center" gap={1.5}>
        {row.heroImage ? (
          <Avatar
            src={row.heroImage}
            variant="rounded"
            sx={{
              width: 56, height: 56,
              borderRadius: 2,
              border: '2px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
            }}
          />
        ) : (
          <Box
            sx={{
              width: 56, height: 56, borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(51, 63, 31, 0.08) 0%, rgba(140, 165, 81, 0.08) 100%)',
              border: '1px solid rgba(140, 165, 81, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Article sx={{ color: '#8CA551', fontSize: 24 }} />
          </Box>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600, color: '#1a1a1a', fontFamily: '"Poppins", sans-serif',
              mb: 0.3,
              display: '-webkit-box', WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}
          >
            {row.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#706f6f', fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem',
              display: '-webkit-box', WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}
          >
            {row.description || t('news:noDescription')}
          </Typography>
          {row.videos?.length > 0 && (
            <Chip
              label={`📹 ${t('news:video')}`}
              size="small"
              sx={{
                mt: 0.5, height: 20, fontSize: '0.65rem',
                bgcolor: 'rgba(229, 134, 60, 0.12)', color: '#E5863C',
                border: '1px solid rgba(229, 134, 60, 0.3)',
                fontWeight: 600, fontFamily: '"Poppins", sans-serif'
              }}
            />
          )}
        </Box>
      </Box>
    )
  },
  {
    field: 'category',
    headerName: t('news:category'),
    minWidth: 130,
    renderCell: ({ row }) => {
      const c = getCategoryColor(row.category)
      return (
        <Chip
          label={t(`news:${row.category}`, row.category)}
          size="small"
          sx={{
            fontWeight: 600, fontFamily: '"Poppins", sans-serif',
            height: 28, px: 1.5, fontSize: '0.75rem',
            letterSpacing: '0.5px', borderRadius: 2, textTransform: 'capitalize',
            bgcolor: c.bg, color: c.color, border: `1px solid ${c.border}`
          }}
        />
      )
    }
  },
  {
    field: 'status',
    headerName: t('news:status'),
    minWidth: 120,
    renderCell: ({ row }) => {
      const s = getStatusColor(row.status)
      return (
        <Chip
          label={t(`news:${row.status}`, row.status)}
          size="small"
          sx={{
            fontWeight: 600, fontFamily: '"Poppins", sans-serif',
            height: 28, px: 1.5, fontSize: '0.75rem',
            letterSpacing: '0.5px', borderRadius: 2, textTransform: 'capitalize',
            bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}`
          }}
        />
      )
    }
  },
  {
    field: 'createdAt',
    headerName: t('news:date'),
    minWidth: 120,
    renderCell: ({ value }) => (
      <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', fontWeight: 500 }}>
        {new Date(value).toLocaleDateString()}
      </Typography>
    )
  },
  {
    field: 'tags',
    headerName: t('news:tags'),
    minWidth: 200,
    renderCell: ({ row }) => (
      <Box display="flex" gap={0.5} flexWrap="wrap">
        {row.tags?.slice(0, 2).map((tag, idx) => (
          <Chip
            key={idx}
            label={tag}
            size="small"
            sx={{
              height: 24, fontSize: '0.7rem',
              bgcolor: 'rgba(112, 111, 111, 0.08)',
              border: '1px solid rgba(112, 111, 111, 0.2)',
              fontFamily: '"Poppins", sans-serif', fontWeight: 500
            }}
          />
        ))}
        {row.tags?.length > 2 && (
          <Chip
            label={`+${row.tags.length - 2}`}
            size="small"
            sx={{
              height: 24, fontSize: '0.7rem',
              bgcolor: 'rgba(140, 165, 81, 0.12)', color: '#8CA551',
              border: '1px solid rgba(140, 165, 81, 0.3)',
              fontWeight: 600, fontFamily: '"Poppins", sans-serif'
            }}
          />
        )}
      </Box>
    )
  },
  {
    field: 'actions',
    headerName: t('news:actions'),
    align: 'center',
    minWidth: 150,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>

        {/* View */}
        <Tooltip title={t('news:view')} placement="top">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onView(row) }}
            sx={{
              bgcolor: 'rgba(140, 165, 81, 0.08)', border: '1px solid rgba(140, 165, 81, 0.2)',
              borderRadius: 2, transition: 'all 0.3s ease',
              '&:hover': { bgcolor: '#8CA551', borderColor: '#8CA551', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } }
            }}
          >
            <Visibility sx={{ fontSize: 18, color: '#8CA551' }} />
          </IconButton>
        </Tooltip>

        {/* Edit */}
        <Tooltip title={t('news:edit')} placement="top">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onEdit(row) }}
            sx={{
              bgcolor: 'rgba(229, 134, 60, 0.08)', border: '1px solid rgba(229, 134, 60, 0.2)',
              borderRadius: 2, transition: 'all 0.3s ease',
              '&:hover': { bgcolor: '#E5863C', borderColor: '#E5863C', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } }
            }}
          >
            <Edit sx={{ fontSize: 18, color: '#E5863C' }} />
          </IconButton>
        </Tooltip>

        {/* Delete */}
        <Tooltip title={t('news:deleteAction')} placement="top">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onDelete(row) }}
            sx={{
              bgcolor: 'rgba(211, 47, 47, 0.08)', border: '1px solid rgba(211, 47, 47, 0.2)',
              borderRadius: 2, transition: 'all 0.3s ease',
              '&:hover': { bgcolor: '#d32f2f', borderColor: '#d32f2f', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } }
            }}
          >
            <Delete sx={{ fontSize: 18, color: '#d32f2f' }} />
          </IconButton>
        </Tooltip>

      </Box>
    )
  }
]