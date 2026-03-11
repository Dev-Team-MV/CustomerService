import { Box, Paper, Typography, Avatar, Chip, Button } from '@mui/material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import useStatusColor from '../hooks/useStatusColor'

const PayloadRow = ({ payload, t }) => {
  const navigate    = useNavigate()
  const colors      = useStatusColor(payload.status)

  return (
    <Box
      onClick={() => navigate('/payloads')}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2.5,
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': { bgcolor: '#fafafa', borderRadius: 2, px: 2, mx: -2 },
        '&:last-child': { borderBottom: 'none' }
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar sx={{ bgcolor: '#e8f5ee', color: '#333F1F', fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
          {payload.property?.user?.firstName?.charAt(0) || 'U'}
        </Avatar>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif', color: '#333F1F' }}>
            {payload.property?.lot?.number
              ? t('recentPayloads.lot', { number: payload.property.lot.number })
              : 'N/A'
            }
          </Typography>
          <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
            {payload.property?.user?.firstName} {payload.property?.user?.lastName}
            {' • '}
            {new Date(payload.date).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      <Box textAlign="right">
        <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', color: '#333F1F', mb: 0.5 }}>
          ${payload.amount?.toLocaleString()}
        </Typography>
        <Chip
          label={t(`common:status.${payload.status}`)}
          size="small"
          sx={{
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            bgcolor: colors.bg,
            color: colors.color,
            border: `1px solid ${colors.border}`
          }}
        />
      </Box>
    </Box>
  )
}

const RecentPayloadsPanel = ({ payloads, t }) => {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      whileHover={{ y: -4 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          bgcolor: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #e5e7eb',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #333F1F 0%, #8CA551 100%)'
          }
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', color: '#333F1F', letterSpacing: '0.5px' }}
          >
            {t('recentPayloads.title')}
          </Typography>
          <Button
            onClick={() => navigate('/payloads')}
            sx={{
              color: '#8CA551', textTransform: 'none',
              fontWeight: 600, fontFamily: '"Poppins", sans-serif',
              '&:hover': { bgcolor: 'transparent', color: '#333F1F' }
            }}
          >
            {t('common:actions.viewAll')}
          </Button>
        </Box>

        {payloads.length > 0 ? (
          payloads.slice(0, 3).map(payload => (
            <PayloadRow key={payload._id} payload={payload} t={t} />
          ))
        ) : (
          <Box py={6} textAlign="center">
            <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
              {t('recentPayloads.noPayloads')}
            </Typography>
          </Box>
        )}
      </Paper>
    </motion.div>
  )
}

RecentPayloadsPanel.propTypes = {
  payloads: PropTypes.array.isRequired,
  t:        PropTypes.func.isRequired
}

export default RecentPayloadsPanel