import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider } from '@shared/context/AuthContext'
import ProtectedRoute from '@shared/components/ProtectedRoute'
import Residents from './Pages/Residents'
import Dashboard from './Pages/Dashboard'
import NotFound from './Pages/NotFound'
import Login from './Pages/LoginPhase2'
import theme from './theme'
import Layout from '@shared/components/LayoutComponents/Layout'
import { Routes, Route, Navigate } from 'react-router-dom'
import { privateMenuItems, publicMenuItems } from './Constants/MenuItems'
import logoPhase2 from '../src/assets/react.svg'
import Properties from './Pages/Properties'
import ConfigurationManagerP2 from './Pages/ConfigurationManagerP2'
import Profile from './Pages/ProfileP2'
import Buildings from './Pages/Buildings'
import BuildingDetails from './Pages/BuildingDetails'
import GetYourQuote from './Pages/GetYourQuote'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
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
              <Route path="/quote" element={<GetYourQuote />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/residents" element={<Residents />} />
              <Route path="/configuration" element={<ConfigurationManagerP2 />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/buildings" element={<Buildings />} />
              <Route path="/buildings/:id" element={<BuildingDetails />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App