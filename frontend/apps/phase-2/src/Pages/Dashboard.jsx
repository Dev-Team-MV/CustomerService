import { Typography, Box, Container } from '@mui/material'
import { useAuth } from '@shared/context/AuthContext'
import PageHeader from '@shared/components/PageHeader'
import DashboardIcon from '@mui/icons-material/Dashboard'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>

        {user?.role === 'admin' || user?.role === 'superadmin' ? (
          <>
            <PageHeader
              icon={DashboardIcon}
              title="Dashboard Admin"
              subtitle="Bienvenido al panel de administración"
            />
            {/* ...widgets, cards, tablas para admin/superadmin... */}
            <Typography variant="body1">
              Bienvenido, {user?.name}. Aquí puedes gestionar residentes, propiedades, analíticas, etc.
            </Typography>
          </>
        ) : (
          <>
            <PageHeader
              icon={DashboardIcon}
              title="Dashboard Usuario"
              subtitle="Bienvenido al panel de usuario"
            />
            {/* ...widgets, cards, tablas para usuario normal... */}
            <Typography variant="body1">
              Bienvenido, {user?.name}. Aquí puedes ver tus propiedades y tu información personal.
            </Typography>
          </>
        )}

    </Box>
  )
}

export default Dashboard