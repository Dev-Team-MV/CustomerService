import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, useAuth } from '@shared/context/AuthContext'
import ProtectedRoute from '@shared/components/ProtectedRoute'
import Layout from '@shared/components/LayoutComponents/Layout'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

// Importa los menús locales
import { privateMenuItems, publicMenuItems } from './constants/menuItems'

// Páginas
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Properties from './pages/Properties'
import PropertySelection from './pages/PropertySelection'
import Lots from './pages/Lots'
import Models from './pages/Models'
import Payloads from './pages/Payloads'
import Residents from './pages/Residents'
import Analytics from './pages/Analytics'
import MyProperty from './pages/MyProperty'
import AmenitiesPublic from './pages/AmenitiesPublic'
import AmenitiesPrivate from './pages/AmenitiesPrivate'
import NotFound from './pages/NotFound'
import NewsTable from './pages/NewsTable'
import NewsDetails from './components/news/NewsDetails'
import NewsFeed from './pages/NewsFeed'
import TermsAndCondition from './pages/TermsAndCondition'
import ClubhouseManager from './pages/ClubhouseManager'
import MasterPlanManager from './pages/MasterPlanManager'
import TimeLine from './pages/TimeLine'
import ConfigurationManager from './pages/ConfigurationManager'
import FamilyGroup from './pages/FamilyGroup'
import MapInventoryPage from './pages/MapInventoryPage'

import theme from './theme' // Usa SIEMPRE el theme extendido


const DynamicLayoutWrapper = ({ children }) => {
  const { user } = useAuth()
  const publicView = !user
  return (
    <Layout
      publicView={publicView}
      menuItems={publicView ? publicMenuItems : privateMenuItems}
      publicMenuItems={publicMenuItems}
    >
      {children || <Outlet />}
    </Layout>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider projectSlug="lakewood">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/setup-password/:token" element={<Register />} />
          <Route path="/terms-and-conditions" element={<TermsAndCondition />} />

          {/* Public Routes */}
          <Route
            element={
              <Layout
                publicView={true}
                menuItems={publicMenuItems}
                publicMenuItems={publicMenuItems}
              />
            }
          >
            <Route path="/explore/properties" element={<PropertySelection />} />
            <Route path="/explore/amenities" element={<AmenitiesPublic />} />
            <Route path="/map-inventory" element={<MapInventoryPage />} />
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
                />
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-property" element={<MyProperty />} />
              <Route path="/amenities" element={<AmenitiesPrivate />} />
              <Route path="/master-plan/inventory" element={<MasterPlanManager />} />
              <Route path="/configurations" element={<ConfigurationManager />} />
              <Route path="/family-group" element={<FamilyGroup />} />
              <Route path="/admin/news" element={<NewsTable />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/select" element={<PropertySelection />} />
              <Route path="/lots" element={<Lots />} />
              <Route path="/models" element={<Models />} />
              <Route path="/payloads" element={<Payloads />} />
              <Route path="/residents" element={<Residents />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/timeline" element={<TimeLine />} />
              <Route path="/clubhouse-manager" element={<ClubhouseManager />} />
              <Route path="/map-inventory" element={<MapInventoryPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App