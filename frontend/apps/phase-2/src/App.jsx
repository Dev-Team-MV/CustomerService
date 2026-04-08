import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, useAuth } from '@shared/context/AuthContext'
import ProtectedRoute from '@shared/components/ProtectedRoute'
import Layout from '@shared/components/LayoutComponents/Layout'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'

// Menús y logo
import { privateMenuItems, publicMenuItems } from './Constants/MenuItems'
import logoPhase2 from './assets/react.svg' // Cambia por el logo real

// Pages
import Login from './Pages/LoginPhase2'
import Dashboard from './Pages/Dashboard'
import Residents from './Pages/Residents'
import NotFound from './Pages/NotFound'
import Properties from './Pages/Properties'
import ConfigurationManagerP2 from './Pages/ConfigurationManagerP2'
import Profile from './Pages/ProfileP2'
import Buildings from './Pages/Buildings'
import BuildingDetails from './Pages/BuildingDetails'
import GetYourQuote from './Pages/GetYourQuote'
import Payloads from './Pages/Payloads'
import MyApartment from './Pages/MyApartment'
import MasterPlanPage from './Pages/MasterPlanPage'
import FamilyGroup from './Pages/FamilyGroup'
import NewsFeed from './Pages/NewsFeed'
import NewsTable from './Pages/NewsTable'
import NewsDetails from './Pages/NewsDetails'
import AmenitiesPrivate from './Pages/Amenities/AmenitiesPrivate'
import AmenitiesPublic from './Pages/Amenities/AmenitiesPublic'
import AgoraManager from './Pages/AgoraManager'
import TermsAndCondition from './Pages/TermsAndCondition'
import theme from './theme'


// const theme = createTheme({
//   palette: {
//     primary: { main: '#1a237e' },
//     secondary: { main: '#43a047' },
//   },
// })

const DynamicLayoutWrapper = ({ children }) => {
  const { user } = useAuth()
  const publicView = !user
  return (
    <Layout
      publicView={publicView}
      menuItems={publicView ? publicMenuItems : privateMenuItems}
      publicMenuItems={publicMenuItems}
      logoSrc={logoPhase2}
    >
      {children || <Outlet />}
    </Layout>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider projectSlug="lakewood-f2">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/terms-and-conditions" element={<TermsAndCondition />} />


          {/* Public Routes */}
          <Route
            element={
              <Layout
                publicView={true}
                menuItems={publicMenuItems}
                logoSrc={logoPhase2}
              />
            }
          >
            <Route path="/explore/amenities" element={<AmenitiesPublic />} />
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
                  logoSrc={logoPhase2}
                />
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/residents" element={<Residents />} />
              <Route path="/payloads" element={<Payloads />} />
              <Route path="/configuration" element={<ConfigurationManagerP2 />} />
              <Route path="/agora" element={<AgoraManager />} />
              <Route path="/master-plan" element={<MasterPlanPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/family-group" element={<FamilyGroup />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/my-apartment" element={<MyApartment />} />
              <Route path="/buildings" element={<Buildings />} />
              <Route path="/buildings/:id" element={<BuildingDetails />} />
              <Route path="/admin/news" element={<NewsTable />} />
              <Route path="/news/:id" element={<NewsDetails />} />
              <Route path="/amenities" element={<AmenitiesPrivate />} />
              <Route path="/quote" element={<GetYourQuote />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App