import { Box, Button, Typography, Stack } from '@mui/material'
import { PersonAdd, AddCircleOutline } from '@mui/icons-material'

export default function QuickActionsPanel({ onCreateProject, onCreateUser }) {
  return (
    <Box sx={{
      p: 3,
      mb: 4,
      borderRadius: 0, // ✅ Bordes afilados
      background: '#fff', // ✅ Fondo sólido, sin gradiente verde
      boxShadow: '0 4px 12px rgba(0,0,0,0.04)', // ✅ Sombra sutil
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      alignItems: 'flex-start',
      border: '1px solid #e8e8e8' // ✅ Borde sutil
    }}>
      {/* ✅ Etiqueta técnica estilo Login */}
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

      <Stack direction="row" spacing={2}>
        {/* ✅ Botón primario: negro, cuadrado, hover con sombra sólida */}
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
            transition: 'all 0.25s ease',
            '&:hover': {
              bgcolor: '#222',
              boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' // ✅ Sombra sólida del Login
            }
          }}
        >
          Crear Proyecto
        </Button>

        {/* ✅ Botón outlined: borde negro, hover invierte colores */}
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
            transition: 'all 0.25s ease',
            '&:hover': {
              bgcolor: '#000',
              color: '#fff',
              borderColor: '#000',
              boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' // ✅ Sombra sólida del Login
            }
          }}
        >
          Agregar Cliente
        </Button>
      </Stack>
    </Box>
  )
}