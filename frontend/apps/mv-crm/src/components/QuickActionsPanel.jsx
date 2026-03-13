import { Box, Button, Typography, Stack } from '@mui/material'
import { PersonAdd, AddCircleOutline } from '@mui/icons-material'

export default function QuickActionsPanel({ onCreateProject, onCreateUser }) {
  return (
    <Box sx={{
      p: 3,
      mb: 4,
      borderRadius: 4,
      background: 'linear-gradient(90deg, #fff 0%, #f5f5f5 100%)',
      boxShadow: '0 4px 24px rgba(51,63,31,0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      alignItems: 'flex-start',
      border: '1px solid #e0e0e0'
    }}>
      <Typography sx={{
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 700,
        fontSize: '1.15rem',
        color: '#222',
        mb: 2,
        letterSpacing: '1px'
      }}>
        Quick Actions
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={<AddCircleOutline />}
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
            textTransform: 'none',
            bgcolor: '#111',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(51,63,31,0.12)',
            '&:hover': { bgcolor: '#333F1F', color: '#fff' }
          }}
          onClick={onCreateProject}
        >
          Create Project
        </Button>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
            textTransform: 'none',
            bgcolor: '#fff',
            color: '#333F1F',
            border: '2px solid #333F1F',
            boxShadow: '0 2px 8px rgba(140,165,81,0.08)',
            '&:hover': { bgcolor: '#333F1F', color: '#fff', borderColor: '#333F1F' }
          }}
          onClick={onCreateUser}
        >
          Add Client
        </Button>
      </Stack>
    </Box>
  )
}