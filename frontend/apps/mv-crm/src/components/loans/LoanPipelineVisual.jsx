import { Box, Typography, Stepper, Step, StepLabel, StepConnector, stepConnectorClasses } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { STAGE_COLORS } from '../../services/loanService'

export default function LoanPipelineVisual({ phases, currentStageId }) {
  const { t } = useTranslation('loans')
  const activeStepIndex = phases.findIndex(p => p.stages.some(s => s.id === currentStageId))

  const ColorConnector = () => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 10, left: 'calc(-50% + 16px)', right: 'calc(50% + 16px)' },
    [`&.${stepConnectorClasses.active}`]: { [`& .${stepConnectorClasses.line}`]: { borderColor: '#004535', borderTopWidth: 3 } },
    [`&.${stepConnectorClasses.completed}`]: { [`& .${stepConnectorClasses.line}`]: { borderColor: '#004535', borderTopWidth: 3 } },
    [`& .${stepConnectorClasses.line}`]: { borderColor: '#e0e0e0', borderTopWidth: 3, borderRadius: 0 }
  })

  return (
    <Box sx={{ width: '100%', p: 3, bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 0 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3, color: '#004535', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
        {t('loans.pipeline.title')}
      </Typography>
      <Stepper activeStep={activeStepIndex >= 0 ? activeStepIndex : 0} alternativeLabel connector={<ColorConnector />}>
        {phases.map((phase) => (
          <Step key={phase.name}>
            <StepLabel 
              StepIconProps={{ sx: { color: STAGE_COLORS[phase.name] || '#ccc', '& .MuiStepIcon-root': { fontSize: 24 } } }}
              sx={{ '& .MuiStepLabel-label': { fontWeight: 600, fontSize: '0.8rem', fontFamily: '"Helvetica Neue", sans-serif', color: '#1a1a1a' } }}
            >
              {t(`loans.pipelinePhases.${phase.name}`, phase.name)}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  )
}