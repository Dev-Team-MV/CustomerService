import { Box, Paper, Typography, Button } from '@mui/material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

const RecentItemsPanel = ({ title, items = [], renderItem, viewAllPath, emptyMessage }) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation('common')

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      whileHover={{ y: -4 }}
    >
      <Paper elevation={0} sx={{
        p: 3, borderRadius: 4, bgcolor: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb',
        position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
        }
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" sx={{
            fontWeight: 700, fontFamily: '"Poppins", sans-serif',
            color: theme.palette.primary.main, letterSpacing: '0.5px'
          }}>
            {title}
          </Typography>
          {viewAllPath && (
            <Button
              onClick={() => navigate(viewAllPath)}
              sx={{
                color: theme.palette.secondary.main, textTransform: 'none',
                fontWeight: 600, fontFamily: '"Poppins", sans-serif',
                '&:hover': { bgcolor: 'transparent', color: theme.palette.primary.main }
              }}
            >
              {t('actions.viewAll', 'Ver todos')}
            </Button>
          )}
        </Box>

        {items.length > 0
          ? items.slice(0, 5).map((item, idx) => renderItem(item, idx))
          : (
            <Box py={6} textAlign="center">
              <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
                {emptyMessage || t('noItems', 'No hay elementos recientes')}
              </Typography>
            </Box>
          )
        }
      </Paper>
    </motion.div>
  )
}

export default RecentItemsPanel