import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, useAuth } from '@shared/context/AuthContext'
import ProtectedRoute from '@shared/components/ProtectedRoute'
import Layout from '@shared/components/LayoutComponents/Layout'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

// Menús y logo
import { privateMenuItems, publicMenuItems } from './Constants/MenuItems'
import logoSheperd from './assets/react.svg'

// Páginas Sheperd
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import Profile from './Pages/Profile'
import Residents from './Pages/Residents'
import ConfigurationManager from './Pages/Configuration'
import NotFound from './Pages/NotFound'
import NewsFeed from './Pages/NewsFeed'
import NewsDetails from './Pages/NewsDetails'
import NewsTable from './Pages/NewsTable'
import BuildingDashboard from './Pages/BuildingDashboard'

import theme from './theme'

const DynamicLayoutWrapper = ({ children }) => {
  const { user } = useAuth()
  const publicView = !user
  return (
    <Layout
      publicView={publicView}
      menuItems={publicView ? publicMenuItems : privateMenuItems}
      publicMenuItems={publicMenuItems}
      logoSrc={logoSheperd}
    >
      {children || <Outlet />}
    </Layout>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider projectSlug="sheperd">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} />
          <Route path="/setup-password/:token" element={<Register />} />
          <Route path="/terms-and-conditions" element={<TermsAndCondition />} /> */}

          {/* Public Routes */}
          <Route
            element={
              <Layout
                publicView={true}
                menuItems={publicMenuItems}
                publicMenuItems={publicMenuItems}
                logoSrc={logoSheperd}
              />
            }
          >
            {/* <Route path="/explore/amenities" element={<AmenitiesPublic />} /> */}
            {/* Agrega aquí tus rutas públicas */}
          </Route>

          {/* Hybrid Routes */}
          <Route element={<DynamicLayoutWrapper />}>
            <Route path="/explore/news" element={<NewsFeed />} />
            <Route path="/explore/news/:id" element={<NewsDetails />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <Layout
                  publicView={false}
                  menuItems={privateMenuItems}
                  publicMenuItems={publicMenuItems}
                  logoSrc={logoSheperd}
                />
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/residents" element={<Residents />} />
              <Route path="/configuration" element={<ConfigurationManager />} />
              <Route path="/admin/news" element={<NewsTable />} />
              <Route path="/admin/building" element={<BuildingDashboard />} />
              
              {/* Agrega aquí el resto de tus rutas privadas */}
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App