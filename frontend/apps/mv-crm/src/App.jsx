import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { AuthProvider } from '@shared/context/AuthContext'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import ProjectsDetails from './pages/ProjectDetails'
import Sales from './pages/Sales'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

// Shared components
import { ProtectedRoute } from '@shared/components/ProtectedRoute'

const theme = createTheme({
  palette: {
    primary: { main: '#1a1a2e' },
    secondary: { main: '#16213e' },
  },
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Admin only - CRM routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute requiredRole="admin">
                <Clients />
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute requiredRole="admin">
                <Projects />
              </ProtectedRoute>
            } />
            <Route path="/projects/:id" element={
              <ProtectedRoute requiredRole="admin">
                <ProjectsDetails />
              </ProtectedRoute>
            } />
            <Route path="/sales" element={
              <ProtectedRoute requiredRole="admin">
                <Sales />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute requiredRole="admin">
                <Profile />
              </ProtectedRoute>
            } />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}