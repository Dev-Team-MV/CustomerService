import { Box, Container, Stepper, Step, StepLabel } from '@mui/material'

const QuoteStepper = ({ currentStep, steps }) => {
  return (
    <Box 
      sx={{ 
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: 3,
        py: 1
      }}
    >
      <Container maxWidth="xl" disableGutters>
        <Stepper activeStep={currentStep} sx={{ py: 1 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel 
                sx={{ 
                  '& .MuiStepLabel-label': { 
                    fontFamily: '"Poppins", sans-serif', 
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  } 
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Container>
    </Box>
  )
}

export default QuoteStepper