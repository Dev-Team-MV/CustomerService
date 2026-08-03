// apps/mv-crm/src/components/QuickActionsPanel.jsx
import { Box, Button, Typography, Stack, useMediaQuery, useTheme } from '@mui/material'
import { PersonAdd, AddCircleOutline } from '@mui/icons-material'

export default function QuickActionsPanel({ onCreateProject, onCreateUser }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box sx={{
      p: { xs: 2, sm: 3 },
      mb: { xs: 2, sm: 4 },
      borderRadius: 0,
      background: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      alignItems: 'flex-start',
      border: '1px solid #e8e8e8',
      width: '100%'
    }}>
      <Typography sx={{
        fontFamily: '"Courier New", monospace',
        fontSize: '0.6rem',
        fontWeight: 600,
        color: '#aaa',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        mb: 1
      }}>
        [01] Quick Actions
      </Typography>

      {/* ✅ Responsive: Columna en móvil, fila en desktop */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
        <Button
          variant="contained"
          startIcon={<AddCircleOutline />}
          onClick={onCreateProject}
          sx={{
            borderRadius: 0,
            fontWeight: 400,
            fontFamily: '"Helvetica Neue", sans-serif',
            textTransform: 'none',
            letterSpacing: '1.5px',
            fontSize: '0.9rem',
            bgcolor: '#000',
            color: '#fff',
            px: 3,
            py: 1.5,
            width: { xs: '100%', sm: 'auto' }, // ✅ Full width en móvil
            transition: 'all 0.25s ease',
            '&:hover': {
              bgcolor: '#222',
              boxShadow: '6px 6px 0px rgba(0,0,0,0.12)'
            }
          }}
        >
          Crear Proyecto
        </Button>

        <Button
          variant="outlined"
          startIcon={<PersonAdd />}
          onClick={onCreateUser}
          sx={{
            borderRadius: 0,
            fontWeight: 400,
            fontFamily: '"Helvetica Neue", sans-serif',
            textTransform: 'none',
            letterSpacing: '1.5px',
            fontSize: '0.9rem',
            bgcolor: '#fff',
            color: '#000',
            border: '1px solid #000',
            px: 3,
            py: 1.5,
            width: { xs: '100%', sm: 'auto' }, // ✅ Full width en móvil
            transition: 'all 0.25s ease',
            '&:hover': {
              bgcolor: '#000',
              color: '#fff',
              borderColor: '#000',
              boxShadow: '6px 6px 0px rgba(0,0,0,0.12)'
            }
          }}
        >
          Agregar Cliente
        </Button>
      </Stack>
    </Box>
  )
}