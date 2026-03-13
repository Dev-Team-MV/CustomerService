import { Typography, Box } from '@mui/material'
import { useAuth } from '@shared/context/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()

  return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {user?.role === 'admin' || user?.role === 'superadmin' ? (
          <>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Dashboard Administrativo
            </Typography>
            {/* Aquí widgets, cards, tablas para admin/superadmin */}
            <Typography variant="body1">
              Bienvenido, {user?.name}. Aquí puedes gestionar residentes, propiedades, analíticas, etc.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Dashboard Usuario
            </Typography>
            {/* Aquí widgets, cards, tablas para usuario normal */}
            <Typography variant="body1">
              Bienvenido, {user?.name}. Aquí puedes ver tus propiedades y tu información personal.
            </Typography>
          </>
        )}
      </Box>
  )
}

export default Dashboard