import { Card, CardContent, Box, Typography, Paper } from '@mui/material'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

const QuickActionsPanel = ({ actions, t }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
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
    <Box sx={{ mb: 2.5 }}>
      <Typography
        variant="h6"
        sx={{
          color: '#333F1F', fontWeight: 700,
          letterSpacing: '0.5px', mb: 0.5,
          fontFamily: '"Poppins", sans-serif'
        }}
      >
        {t('quickActions.title')}
      </Typography>
      <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
        {t('quickActions.subtitle')}
      </Typography>
    </Box>

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {actions.map((action, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * index }}
          whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400 } }}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            onClick={action.onClick}
            elevation={0}
            sx={{
              cursor: 'pointer',
              borderRadius: 3,
              border: '1px solid transparent',
              bgcolor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.3s',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0, top: 0, bottom: 0,
                width: 3,
                bgcolor: action.color,
                transform: 'scaleY(0)',
                transition: 'transform 0.3s'
              },
              '&:hover': {
                borderColor: action.color,
                boxShadow: `0 8px 20px ${action.color}20`,
                '&::before': { transform: 'scaleY(1)' },
                '& .action-icon-container': {
                  transform: 'scale(1.1) rotate(5deg)',
                  bgcolor: action.color,
                  '& svg': { color: 'white' }
                },
                '& .arrow-container': {
                  transform: 'translateX(4px)',
                  bgcolor: action.color,
                  color: 'white'
                }
              }
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  className="action-icon-container"
                  sx={{
                    width: 48, height: 48,
                    borderRadius: 2.5,
                    bgcolor: action.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& svg': { fontSize: 24, color: action.color, transition: 'all 0.3s' }
                  }}
                >
                  {action.icon}
                </Box>

                <Box flex={1}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#333F1F', fontWeight: 600,
                      mb: 0.3, fontSize: '0.9rem',
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    {action.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: '#706f6f', fontSize: '0.7rem', fontFamily: '"Poppins", sans-serif' }}
                  >
                    {action.description}
                  </Typography>
                </Box>

                <Box
                  className="arrow-container"
                  sx={{
                    width: 32, height: 32,
                    borderRadius: '50%',
                    bgcolor: action.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: action.color,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    transition: 'all 0.3s'
                  }}
                >
                  ›
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Box>
  </Paper>
)

QuickActionsPanel.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.shape({
    icon:        PropTypes.node.isRequired,
    label:       PropTypes.string.isRequired,
    description: PropTypes.string,
    color:       PropTypes.string.isRequired,
    bgColor:     PropTypes.string.isRequired,
    onClick:     PropTypes.func.isRequired
  })).isRequired,
  t: PropTypes.func.isRequired
}

export default QuickActionsPanel