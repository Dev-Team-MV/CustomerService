// /Users/oficina/MV-CRM/CustomerService/frontend/apps/hTower/src/App.jsx
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, useAuth } from '@shared/context/AuthContext'
import ProtectedRoute from '@shared/components/ProtectedRoute'
import Layout from '@shared/components/LayoutComponents/Layout'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

// Menús
import { privateMenuItems, publicMenuItems } from './constants/MenuItems'

// Páginas hTower
import Dashboard from './Pages/Dashboard'
import Residents from './Pages/Residents'

// Componentes compartidos
import SharedProfilePage from '@shared/components/ProfilePage'
import SharedNewstable from '@shared/components/News/NewsTable'
import SharedNewsDetails from '@shared/components/News/NewsDetails'
import SharedNewsFeed from '@shared/components/News/NewsFeed'
import SharedRegisterPage from '@shared/components/Register/RegisterPage'
import SharedNotFoundPage from '@shared/components/NotFoundPage'
import SharedConfigurationPage from '@shared/components/ConfigurationPage'
import SharedTermsAndConditionsPage from '@shared/components/TermsAndConditions/TermsAndConditionsPage'
import MasterPlanPage from '@shared/components/MasterPlan/MasterPlanPage'
import Payloads from './Pages/Payloads'
import Properties from './Pages/Properties'

// Componente compartido de login
import UniversalLogin from '@shared/components/Login/UniversalLogin'
import CustomerSurveyPage from '@shared/components/CustomerSurveyPage'
import ForcePasswordChange from '@shared/components/Login/ForcePasswordChange'
import { TourProvider } from '@shared/tours/useTour'

// Configuración de noticias
import { getNewsConfig } from '@shared/config/newsConfig'
import BuildingsPage from '@shared/components/Buildings/BuildingsPage'
import BuildingDetailPage from '@shared/components/Buildings/BuildingDetailPage'
import PropertyQuotePage from '@shared/components/PropertyQuote/PropertyQuotePage'
import { MyResource } from '@shared/components/Resource/MyResource'
import { resourceConfigs, RESOURCE_TYPES } from '@shared/config/resourceConfig'

import { getBuildingColumns } from './constants/Columns/buildings'

import theme from './theme'

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
  const projectId = import.meta.env.VITE_PROJECT_ID
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider projectSlug="h-tower">
        <TourProvider>
        <Routes>
          {/* 🔐 Auth Routes */}
          <Route path="/login" element={<UniversalLogin showFooter={false} />} />
          
          <Route path="/setup-password/:token" element={<SharedRegisterPage />} />
          <Route path="/terms-and-conditions" element={<SharedTermsAndConditionsPage />} />

          {/* 🌐 Public Routes */}
          <Route
            element={
              <Layout
                publicView={true}
                menuItems={publicMenuItems}
              />
            }
          >
            <Route 
              path="/explore/properties" 
              element={
                <PropertyQuotePage 
                  projectSlug="h-tower" 
                  projectId={projectId} 
                />
              } 
            />
          </Route>

          {/* 🔀 Hybrid Routes */}
          <Route element={<DynamicLayoutWrapper />}>
            <Route path="/explore/news" element={<SharedNewsFeed config={getNewsConfig('htower')} />} />
            <Route path="/explore/news/:id" element={<SharedNewsDetails config={getNewsConfig('htower')} />} />
          </Route>

          {/* 🔒 Protected Routes */}
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
              <Route path="/profile" element={<SharedProfilePage />} />
              <Route path="/residents" element={<Residents />} />
              <Route path="/admin/news" element={<SharedNewstable config={getNewsConfig('htower')} />} />
              <Route path="/configurations" element={<SharedConfigurationPage />} />
              <Route path="/payloads" element={<Payloads />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/survey" element={<CustomerSurveyPage />} />
              <Route path="/master-plan" element={<MasterPlanPage projectId={projectId} />} />
              <Route path="/auth/force-password-change" element={<ForcePasswordChange />} />
              <Route 
                path="/buildings" 
                element={
                  <BuildingsPage 
                    projectSlug="h-tower" 
                    getColumns={getBuildingColumns} 
                    detailRoute="/buildings" 
                  />
                } 
              />
              <Route
                path="/buildings/:id"
                element={
                  <BuildingDetailPage
                    projectSlug="h-tower"
                    backRoute="/buildings"
                  />
                }
              />
              <Route
                path="/get-your-quote"
                element={
                  <PropertyQuotePage
                    projectSlug="h-tower"
                    projectId={projectId}
                  />
                }
              />
              <Route
                path="/my-apartment"
                element={
                  <MyResource
                    resourceConfig={resourceConfigs.apartment}
                    resourceType={RESOURCE_TYPES.APARTMENT}
                  />
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<SharedNotFoundPage />} />
        </Routes>
        </TourProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App