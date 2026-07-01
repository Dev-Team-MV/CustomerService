// src/App.jsx
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, useAuth } from '@shared/context/AuthContext'
import ProtectedRoute from '@shared/components/ProtectedRoute'
import Layout from '@shared/components/LayoutComponents/Layout'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

// Menús y logo
import { privateMenuItems, publicMenuItems } from './constants/MenuItems'
import logoHTower from '../src/assets/react.svg'

// Páginas hTower
import Login from './Pages/Login'
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
// Configuración de noticias
import { getNewsConfig } from '@shared/config/newsConfig'
import BuildingsPage from '@shared/components/Buildings/BuildingsPage'
import BuildingDetailPage from '@shared/components/Buildings/BuildingDetailPage'
import PropertyQuotePage from '@shared/components/PropertyQuote/PropertyQuotePage'
import { MyResource } from '@shared/components/Resource/MyResource'
import { resourceConfigs, RESOURCE_TYPES } from '@shared/config/resourceConfig'

import { getBuildingColumns } from './constants/Columns/buildings'
 

import theme from './theme'

// Wrapper dinámico para rutas híbridas
const DynamicLayoutWrapper = ({ children }) => {
  const { user } = useAuth()
  const publicView = !user
  return (
    <Layout
      publicView={publicView}
      menuItems={publicView ? publicMenuItems : privateMenuItems}
      publicMenuItems={publicMenuItems}
      logoSrc={logoHTower}
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
        <Routes>
          {/* 🔐 Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/register" 
            element={
              <SharedRegisterPage 
                projectName="hTower" 
                logoMain={logoHTower}
                logoSecondary={logoHTower}
                tagline="Gestión inteligente de edificios" 
                brandColors={{ 
                  primary: '#424242',    // Gris oscuro
                  secondary: '#757575',  // Gris medio
                  accent: '#E53935'      // Rojo vibrante
                }} 
              /> 
            } 
          />
          
          <Route 
            path="/setup-password/:token" 
            element={
              <SharedRegisterPage 
                projectName="hTower" 
                logoMain={logoHTower}
                logoSecondary={logoHTower}
                tagline="Gestión inteligente de edificios" 
                brandColors={{ 
                  primary: '#424242',
                  secondary: '#757575',
                  accent: '#E53935'
                }} 
              /> 
            } 
          />
          
          <Route path="/terms-and-conditions" element={<SharedTermsAndConditionsPage />} />

          {/* 🌐 Public Routes */}
          <Route
            element={
              <Layout
                publicView={true}
                menuItems={publicMenuItems}
                logoSrc={logoHTower}
              />
            }
          >
            {/* ✅ NUEVO: Rutas públicas de hTower */}
            {/* <Route path="/explore/amenities" element={<AmenitiesPublic />} /> */}
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

          {/* 🔀 Hybrid Routes (visibles tanto para usuarios autenticados como públicos) */}
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
                  logoSrc={logoHTower}
                />
              }
            >
              {/* Redirección raíz */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Páginas principales */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<SharedProfilePage />} />
              <Route path="/residents" element={<Residents />} />
              
              {/* Administración */}
              <Route path="/admin/news" element={<SharedNewstable config={getNewsConfig('htower')} />} />
              <Route path="/configurations" element={<SharedConfigurationPage />} />
              <Route path="/payloads" element={< Payloads/>} />
              <Route path="/properties" element={< Properties/>} />
              
              <Route path="master-plan" element={
                <MasterPlanPage
                projectId={projectId} 
              />} />

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
                    projectId = {projectId}
                    />}
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

              {/* Agrega aquí el resto de tus rutas privadas hTower */}
            </Route>
          </Route>

          {/* ❌ 404 - Ruta no encontrada */}
          <Route path="*" element={<SharedNotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App