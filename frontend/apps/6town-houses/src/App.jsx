// /Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/App.jsx
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, useAuth } from '@shared/context/AuthContext'
import ProtectedRoute from '@shared/components/ProtectedRoute'
import Layout from '@shared/components/LayoutComponents/Layout'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

// Menús
import { privateMenuItems, publicMenuItems } from './Constants/MenuItems'

// Páginas 6Town Houses
import Dashboard from './Pages/Dashboard'
import NotFound from './Pages/NotFound'
import ConfigurationManager from './Pages/ConfigurationManager'
import Profile from './Pages/Profile'
import Register from './Pages/Register'
import MasterPlanPageWrapper from './Pages/MasterPlanPage'
import NewsFeed from './Pages/NewsFeed'
import NewsDetails from './Pages/NewsDetails'
import NewsTable from './Pages/NewsTable'
import Residents from './Pages/Residents'
import TermsAndCondition from './Pages/TermsAndConditions'
import CatalogConfig from './Pages/CtalogConfig'
import Buildings from './Pages/Buildings'
import BuildingDetails from './Pages/BuildingDetails'
import GetYourQuote from './Components/quote/GetYourQuote'
import Lots from './Pages/Lots'
import Models from './Pages/Models'
import Properties from './Pages/Properties'
import Payloads from './Pages/Payloads'
import MyProperty from './Pages/MyProperty'
import FamilyGroup from './Pages/FamilyGropu'

import theme from './theme'

// Componente compartido
import UniversalLogin from '@shared/components/Login/UniversalLogin'
import CustomerSurveyPage from '@shared/components/CustomerSurveyPage'
import CustomerWarrantyPage from '@shared/components/Warranties/CustomerWarrantyPage'
import ForcePasswordChange from '@shared/components/Login/ForcePasswordChange'
import { TourProvider } from '@shared/tours/useTour'

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
      <AuthProvider projectSlug="6town-houses">
        <TourProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<UniversalLogin />} />

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
            <Route path="/explore/properties" element={<GetYourQuote />} />
            <Route path="/explore/news" element={<NewsFeed />} />
            <Route path="/explore/news/:id" element={<NewsDetails />} />
          </Route>

          {/* Hybrid Routes */}
          <Route element={<DynamicLayoutWrapper />}>
            <Route path="/news" element={<NewsFeed />} />
            <Route path="/news/:id" element={<NewsDetails />} />
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
              <Route path="/configuration" element={<ConfigurationManager />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/survey" element={<CustomerSurveyPage />} />
              <Route path="/warranties" element={<CustomerWarrantyPage />} />
              <Route path="/master-plan" element={<MasterPlanPageWrapper />} />
              <Route path="/admin/news" element={<NewsTable />} />
              <Route path="/residents" element={<Residents />} />
              <Route path="/catalog-config" element={<CatalogConfig />} />
              <Route path="/buildings" element={<Buildings />} />
              <Route path="/buildings/:id" element={<BuildingDetails />} />
              <Route path="/get-your-quote" element={<GetYourQuote />} />
              <Route path="/lots" element={<Lots />} />
              <Route path="/models" element={<Models />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/payloads" element={<Payloads />} />
              <Route path="/my-property" element={<MyProperty />} />
              <Route path="/family-groups" element={<FamilyGroup />} />
              <Route path="/auth/force-password-change" element={<ForcePasswordChange />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        </TourProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App