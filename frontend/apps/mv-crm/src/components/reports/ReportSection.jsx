// apps/mv-crm/src/components/reports/ReportSection.jsx
import { Box, Typography, Paper, Divider, useMediaQuery, useTheme } from '@mui/material'

const ReportSection = ({
  icon: Icon,
  iconBgColor = '#e3f2fd',
  iconColor = '#1976d2',
  title,
  description,
  children
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        border: '1px solid #ececec',
        borderRadius: 0, // ✅ Cero bordes redondeados
        bgcolor: '#fff',
        width: '100%'
      }}
    >
      {/* Header */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} mb={3}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 0, // ✅ Cero bordes redondeados
            bgcolor: iconBgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon sx={{ fontSize: 28, color: iconColor }} />
        </Box>
        <Box flex={1}>
          <Typography
            sx={{
              fontFamily: '"Helvetica Neue", sans-serif',
              fontSize: { xs: '1rem', sm: '1.2rem' },
              fontWeight: 600,
              color: '#000'
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              color: '#888',
              letterSpacing: '0.5px',
              mt: { xs: 0.5, sm: 0 }
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Content */}
      {children}
    </Paper>
  )
}

export default ReportSection