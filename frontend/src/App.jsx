import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Properties from './pages/Properties'
import Lots from './pages/Lots'
import Models from './pages/Models'
import ModelDetail from './pages/ModelDetail'
import Payloads from './pages/Payloads'
import Residents from './pages/Residents'
import Analytics from './pages/Analytics'
import PropertySelection from './pages/PropertySelection'
import NotFound from './pages/NotFound'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Public route for property selection */}
            <Route element={<Layout publicView={true} />}>
            <Route path="/properties/select" element={<PropertySelection />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/lots" element={<Lots />} />
                <Route path="/models" element={<Models />} />
                <Route path="/models/:id" element={<ModelDetail />} />
                <Route path="/payloads" element={<Payloads />} />
                <Route path="/residents" element={<Residents />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
