// apps/mv-crm/src/components/postSale/WarrantyTimeline.jsx
import { Box, Typography, Stepper, Step, StepLabel, StepContent, Paper, Chip } from '@mui/material'
import { CheckCircle, Pending, Build, Check, Cancel, AccessTime } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const WarrantyTimeline = ({ events = [] }) => {
  const { t } = useTranslation('postSale')

  const statusConfig = {
    submitted:   { label: t('warranty.statuses.submitted'),   icon: <AccessTime />, color: 'warning' },
    under_review:{ label: t('warranty.statuses.under_review'), icon: <Pending />,    color: 'info' },
    approved:    { label: t('warranty.statuses.approved'),    icon: <CheckCircle />,color: 'success' },
    in_progress: { label: t('warranty.statuses.in_progress'), icon: <Build />,      color: 'primary' },
    resolved:    { label: t('warranty.statuses.resolved'),    icon: <Check />,      color: 'success' },
    rejected:    { label: t('warranty.statuses.rejected'),    icon: <Cancel />,     color: 'error' }
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 0, border: '1px solid #ececec' }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, fontFamily: '"Courier New", monospace', letterSpacing: '1px', textTransform: 'uppercase' }}>
        {t('warranty.timeline')}
      </Typography>
      
      <Stepper orientation="vertical" activeStep={events.length - 1}>
        {events.map((event, index) => {
          const config = statusConfig[event.status] || statusConfig.submitted
          return (
            <Step key={index} active={true} completed={index < events.length - 1}>
              <StepLabel 
                icon={config.icon}
                sx={{ '& .MuiStepLabel-label': { fontWeight: 600, fontFamily: '"Helvetica Neue", sans-serif' } }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography>{config.label}</Typography>
                  <Chip 
                    label={t(`warranty.statuses.${event.status}`)} 
                    size="small" 
                    color={config.color} 
                    variant="outlined"
                    sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.65rem', fontWeight: 600 }}
                  />
                </Box>
              </StepLabel>
              <StepContent>
                <Box sx={{ pl: 2, py: 1 }}>
                  {event.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontFamily: '"Helvetica Neue", sans-serif' }}>
                      {event.notes}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Courier New", monospace' }}>
                    {event.createdAt ? new Date(event.createdAt).toLocaleString() : ''}
                    {event.user && ` • ${event.user}`}
                  </Typography>
                </Box>
              </StepContent>
            </Step>
          )
        })}
      </Stepper>
    </Paper>
  )
}

export default WarrantyTimeline