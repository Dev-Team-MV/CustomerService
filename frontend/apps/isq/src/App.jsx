import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, useAuth } from '@shared/context/AuthContext'
import ProtectedRoute from '@shared/components/ProtectedRoute'
import Layout from '@shared/components/LayoutComponents/Layout'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

// Menús y logo
import { privateMenuItems, publicMenuItems } from './Constants/MenuItems'
import logoISQ from './assets/react.svg' // Cambia por el logo real

// Páginas ISQ
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import Profile from './Pages/Profile'
import Residents from './Pages/Residents'
import ConfigurationManager from './Pages/ConfigurationManager'
import NotFound from './Pages/NotFound'
import NewsFeed from './Pages/NewsFeed'
import NewsDetails from './Pages/NewsDetails'
import NewsTable from './Pages/NewsTable'
import TermsAndCondition from './Pages/TermsAndCondition'
import Buildings from './Pages/Buildings'
import BuildingDetails from './Pages/BuildingDetails'
import GetYourQuote from './Pages/GetYourQuote'
import Properties from './Pages/Properties'
import Payloads from './Pages/Payloads'
import MasterPlanPage from './Pages/MasterPlanPage'
import MyApartment from './Pages/MyApartment'
import FamilyGroup from './Pages/FamilyGroup'
import AmenitiesPublic from './Pages/Amenities/AmenitiesPublic'
import AmenitiesPrivate from './Pages/Amenities/AmenitiesPrivate'
import Register from './Pages/Register'

// ...agrega aquí el resto de tus páginas privadas

import theme from './theme' // Usa SIEMPRE el theme extendido

const DynamicLayoutWrapper = ({ children }) => {
  const { user } = useAuth()
  const publicView = !user
  return (
    <Layout
      publicView={publicView}
      menuItems={publicView ? publicMenuItems : privateMenuItems}
      publicMenuItems={publicMenuItems}
      logoSrc={logoISQ}
    >
      {children || <Outlet />}
    </Layout>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider projectSlug="isq">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/terms-and-conditions" element={<TermsAndCondition />} />
          <Route path="/register" element={<Register />} />
          <Route path="/setup-password/:token" element={<Register />} />

          {/* Public Routes */}
          <Route
            element={
              <Layout
                publicView={true}
                menuItems={publicMenuItems}
                logoSrc={logoISQ}
              />
            }
          >
            <Route path="/explore/amenities" element={<AmenitiesPublic />} />
            <Route path="/explore/properties" element={<GetYourQuote />} />
            {/* Agrega aquí tus rutas públicas si las tienes */}
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
                  logoSrc={logoISQ}
                />
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/residents" element={<Residents />} />
              <Route path="/configuration" element={<ConfigurationManager />} />
              <Route path="/admin/news" element={<NewsTable />} />
              <Route path="/buildings" element={<Buildings />} />
              <Route path="/buildings/:id" element={<BuildingDetails />} />
              <Route path="/get-your-quote" element={<GetYourQuote />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/payloads" element={<Payloads />} />
              <Route path="/master-plan" element={<MasterPlanPage />} />
              <Route path="/my-apartment" element={<MyApartment />} />
              <Route path="/family-group" element={<FamilyGroup />} /> 
              <Route path="/amenities" element={<AmenitiesPrivate />} />

              {/* Agrega aquí el resto de tus rutas privadas ISQ */}
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App