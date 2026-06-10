import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, useAuth } from '@shared/context/AuthContext'
import ProtectedRoute from '@shared/components/ProtectedRoute'
import Layout from '@shared/components/LayoutComponents/Layout.jsx'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

// Importa los menús locales
import { privateMenuItems, publicMenuItems } from './constants/menuItems'

// Páginas
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

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

import ClubhouseManager from './pages/ClubhouseManager'
import MasterPlanManager from './pages/MasterPlanManager'
import TimeLine from './pages/TimeLine'

import FamilyGroup from './pages/FamilyGroup'
import MapInventoryPage from './pages/MapInventoryPage'
import UploadTracker from './pages/UploadTracker'

import UploadsManager from './pages/UploadsManager'

import theme from './theme' // Usa SIEMPRE el theme extendido

import SharedNewstable from '@shared/components/News/NewsTable'
import SharedNewsDetails from '@shared/components/News/NewsDetails'
import SharedNewsFeed from '@shared/components/News/NewsFeed'
import SharedRegisterPage from '@shared/components/Register/RegisterPage'
import SharedProfilePage from '@shared/components/ProfilePage'
import SharedNotFoundPage from '@shared/components/NotFoundPage'
import SharedConfigurationPage from '@shared/components/ConfigurationPage'
import SharedTermsAndConditionsPage from '@shared/components/TermsAndConditions/TermsAndConditionsPage'
import { getNewsConfig } from '@shared/config/newsConfig'


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
          <Route path="/register" element={
            <SharedRegisterPage 
              projectName="Lakewood Oaks on Lake Conroe" 
              logoMain="/images/logos/Logo_LakewoodOaks-05.png" 
              logoSecondary="/images/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png" 
              backgroundImage="/images/260721_001_0010_ISOMETRIA_3-1.png" 
              tagline="Resort-Style Living on Lake Conroe" 
              brandColors={{ primary: '#333F1F', secondary: '#8CA551' }} 
            /> 
          } />
          <Route path="/setup-password/:token" element={
            <SharedRegisterPage 
              projectName="Lakewood Oaks on Lake Conroe" 
              logoMain="/images/logos/Logo_LakewoodOaks-05.png" 
              logoSecondary="/images/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png" 
              backgroundImage="/images/260721_001_0010_ISOMETRIA_3-1.png" 
              tagline="Resort-Style Living on Lake Conroe" 
              brandColors={{ primary: '#333F1F', secondary: '#8CA551' }} 
            /> 
          } />
          <Route path="/terms-and-conditions" element={<SharedTermsAndConditionsPage />} />

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
            {/* <Route path="/explore/map-inventory" element={<MapInventoryPage />} /> */}
          </Route>

          {/* Hybrid Routes */}
          <Route element={<DynamicLayoutWrapper />}>
            <Route path="/explore/news" element={<SharedNewsFeed config={getNewsConfig('lakewood')} />} />
            <Route path="/explore/news/:id" element={<SharedNewsDetails config={getNewsConfig('lakewood')} />} />
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
              {/* <Route path="/configurations" element={<ConfigurationManager />} /> */}
              <Route path="/configurations" element={<SharedConfigurationPage />} />
              <Route path="/family-group" element={<FamilyGroup />} />
              {/* <Route path="/admin/news" element={<NewsTable />} /> */}
              <Route path="/admin/news" element={<SharedNewstable config={getNewsConfig('lakewood')} />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/select" element={<PropertySelection />} />
              <Route path="/lots" element={<Lots />} />
              <Route path="/models" element={<Models />} />
              <Route path="/payloads" element={<Payloads />} />
              <Route path="/residents" element={<Residents />} />
              <Route path="/analytics" element={<Analytics />} />
              {/* <Route path="/profile" element={<Profile />} /> */}
              <Route path="/profile" element={<SharedProfilePage />} />
              <Route path="/timeline" element={<TimeLine />} />
              <Route path="/clubhouse-manager" element={<ClubhouseManager />} />
              <Route path="/map-inventory" element={<MapInventoryPage />} />
              <Route path="/upload-tracker" element={<UploadTracker />} />
              <Route path="/uploads-manager" element={<UploadsManager />} />
            </Route>
          </Route>
          <Route path="*" element={<SharedNotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App