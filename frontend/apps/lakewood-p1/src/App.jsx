// /Users/oficina/MV-CRM/CustomerService/frontend/apps/lakewood-p1/src/App.jsx
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, useAuth } from '@shared/context/AuthContext'
import ProtectedRoute from '@shared/components/ProtectedRoute'
import Layout from '@shared/components/LayoutComponents/Layout.jsx'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

// Importa los menús locales
import { privateMenuItems, publicMenuItems } from './constants/menuItems'

// Páginas
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

// ✅ 1. Importar la nueva página de encuestas del shared
import CustomerSurveyPage from '@shared/components/CustomerSurveyPage'
import CustomerWarrantyPage from '@shared/components/Warranties/CustomerWarrantyPage'
import ForcePasswordChange from '@shared/components/Login/ForcePasswordChange'

// Footer local
import TypingFooter from './components/Footer'

import theme from './theme'

// Componentes compartidos
import UniversalLogin from '@shared/components/Login/UniversalLogin'
import SharedNewstable from '@shared/components/News/NewsTable'
import SharedNewsDetails from '@shared/components/News/NewsDetails'
import SharedNewsFeed from '@shared/components/News/NewsFeed'
import SharedRegisterPage from '@shared/components/Register/RegisterPage'
import SharedProfilePage from '@shared/components/ProfilePage'
import SharedNotFoundPage from '@shared/components/NotFoundPage'
import SharedConfigurationPage from '@shared/components/ConfigurationPage'
import SharedTermsAndConditionsPage from '@shared/components/TermsAndConditions/TermsAndConditionsPage'
import { getNewsConfig } from '@shared/config/newsConfig'
import ImpersonationBanner from '@shared/components/ImpersonationBanner'

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
          <Route 
            path="/login" 
            element={
              <UniversalLogin 
                Footer={TypingFooter}
                showFooter={true}
              />
            } 
          />
         
          <Route path="/setup-password/:token" element={<SharedRegisterPage />} />
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
              
              {/* ✅ 2. Agregar la ruta de la encuesta */}
              <Route path="/survey" element={<CustomerSurveyPage />} />
              <Route path="/warranties" element={<CustomerWarrantyPage />} />
              
              <Route path="/amenities" element={<AmenitiesPrivate />} />
              <Route path="/master-plan/inventory" element={<MasterPlanManager />} />
              <Route path="/configurations" element={<SharedConfigurationPage />} />
              <Route path="/family-group" element={<FamilyGroup />} />
              <Route path="/admin/news" element={<SharedNewstable config={getNewsConfig('lakewood')} />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/select" element={<PropertySelection />} />
              <Route path="/lots" element={<Lots />} />
              <Route path="/models" element={<Models />} />
              <Route path="/payloads" element={<Payloads />} />
              <Route path="/residents" element={<Residents />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<SharedProfilePage />} />
              <Route path="/timeline" element={<TimeLine />} />
              <Route path="/clubhouse-manager" element={<ClubhouseManager />} />
              <Route path="/map-inventory" element={<MapInventoryPage />} />
              <Route path="/upload-tracker" element={<UploadTracker />} />
              <Route path="/uploads-manager" element={<UploadsManager />} />

              <Route path="/auth/force-password-change" element={<ForcePasswordChange />} />
            </Route>
          </Route>
          
          <Route path="*" element={<SharedNotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App