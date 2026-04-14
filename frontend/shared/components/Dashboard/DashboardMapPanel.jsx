import { Paper, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'

const DashboardMapPanel = ({ title, children }) => {
  const theme = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      whileHover={{ y: -4 }}
      style={{ height: '100%' }}
    >
      <Paper elevation={0} sx={{
        p: 3, height: '100%', borderRadius: 4, bgcolor: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb',
        position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
        }
      }}>
        {title && (
          <Typography variant="h6" sx={{
            fontWeight: 700, fontFamily: '"Poppins", sans-serif',
            color: theme.palette.primary.main, letterSpacing: '0.5px', mb: 2
          }}>
            {title}
          </Typography>
        )}
        {children}
      </Paper>
    </motion.div>
  )
}

export default DashboardMapPanel