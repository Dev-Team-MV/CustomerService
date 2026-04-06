// @shared/constants/Column/news.jsx
import { Box, Typography, Avatar, Chip, IconButton, Tooltip } from '@mui/material'
import { Edit, Delete, Visibility, Article } from '@mui/icons-material'
import { getCategoryColor } from '../../config/newsConfig'

// Helper para colores de status
const getStatusColor = (status, config) => {
  if (status === 'published')
    return { bg: `${config.colors.secondary}1F`, color: config.colors.primary, border: `${config.colors.secondary}4D` }
  return { bg: `${config.colors.accent}1F`, color: config.colors.accent, border: `${config.colors.accent}4D` }
}

// Hook de columnas para NewsTable
export const useNewsColumns = ({ t, config, handleView, handleEdit, handleDeleteClick }) => {
  return [
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
                boxShadow: `0 4px 12px ${config.colors.primary}33`
              }}
            />
          ) : (
            <Box
              sx={{
                width: 56, height: 56, borderRadius: 2,
                background: `linear-gradient(135deg, ${config.colors.primary}14 0%, ${config.colors.secondary}14 100%)`,
                border: `1px solid ${config.colors.secondary}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Article sx={{ color: config.colors.secondary, fontSize: 24 }} />
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
                  bgcolor: `${config.colors.accent}1F`, color: config.colors.accent,
                  border: `1px solid ${config.colors.accent}4D`,
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
        const categoryColor = getCategoryColor(row.category, config)
        return (
          <Chip
            label={t(`news:category${row.category.charAt(0).toUpperCase() + row.category.slice(1)}`, row.category)}
            size="small"
            sx={{
              fontWeight: 600, fontFamily: '"Poppins", sans-serif',
              height: 28, px: 1.5, fontSize: '0.75rem',
              letterSpacing: '0.5px', borderRadius: 2, textTransform: 'capitalize',
              bgcolor: `${categoryColor}1F`, color: categoryColor, 
              border: `1px solid ${categoryColor}4D`
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
        const s = getStatusColor(row.status, config)
        return (
          <Chip
            label={t(`news:status${row.status.charAt(0).toUpperCase() + row.status.slice(1)}`, row.status)}
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
                bgcolor: `${config.colors.secondary}1F`, color: config.colors.secondary,
                border: `1px solid ${config.colors.secondary}4D`,
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
          <Tooltip title={t('news:view')} placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleView(row) }}
              sx={{
                bgcolor: `${config.colors.secondary}14`, border: `1px solid ${config.colors.secondary}33`,
                borderRadius: 2, transition: 'all 0.3s ease',
                '&:hover': { bgcolor: config.colors.secondary, borderColor: config.colors.secondary, transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } }
              }}
            >
              <Visibility sx={{ fontSize: 18, color: config.colors.secondary }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('news:edit')} placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleEdit(row) }}
              sx={{
                bgcolor: `${config.colors.accent}14`, border: `1px solid ${config.colors.accent}33`,
                borderRadius: 2, transition: 'all 0.3s ease',
                '&:hover': { bgcolor: config.colors.accent, borderColor: config.colors.accent, transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } }
              }}
            >
              <Edit sx={{ fontSize: 18, color: config.colors.accent }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={t('news:deleteAction')} placement="top">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleDeleteClick(row) }}
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
}