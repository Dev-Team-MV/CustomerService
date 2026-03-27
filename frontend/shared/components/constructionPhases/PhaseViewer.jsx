import { Box, Typography, LinearProgress, Grid, Paper, CircularProgress, } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import PhaseMediaGallery from './PhaseMediaGallery'

const PhaseViewer = ({ 
  phases, 
  loading, 
  onMediaClick,
  config = {} 
}) => {
  const theme = useTheme()
  const {
    showProgress = true,
    showMediaGallery = true,
    emptyMessage = 'No construction phases available'
  } = config

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (!phases || phases.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {phases.map((phase) => (
        <Paper
          key={phase._id}
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.cardBorder}`,
            bgcolor: 'white'
          }}
        >
          {/* Phase Header */}
          <Box mb={2}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 0.5
              }}
            >
              Phase {phase.phaseNumber}: {phase.title || `Phase ${phase.phaseNumber}`}
            </Typography>
            
            {showProgress && (
              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Construction Progress
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {phase.constructionPercentage}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={phase.constructionPercentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: theme.palette.primary.main
                    }
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Media Gallery */}
          {showMediaGallery && phase.mediaItems?.length > 0 && (
            <PhaseMediaGallery
              mediaItems={phase.mediaItems}
              onMediaClick={onMediaClick}
            />
          )}
        </Paper>
      ))}
    </Box>
  )
}

export default PhaseViewer