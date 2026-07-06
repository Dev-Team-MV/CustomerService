import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { AuthProvider } from '@shared/context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import ProjectsDetails from './pages/ProjectDetails'
import Sales from './pages/Sales'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Analytics from './pages/Analytics'
import Activities from './pages/Activities'
import Payments from './pages/Payments'
import { ProtectedRoute } from '@shared/components/ProtectedRoute'
import MessageTemplates from './pages/MessageTemplates'
import ClientDetail from './pages/ClientDetails'
import Reports from './pages/Reports'
import Agents from './pages/Agents'

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
        <Routes>
          <Route path="/login" element={<Login />} />
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
          <Route path="/analytics" element={
            <ProtectedRoute requiredRole="user">
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/activities" element={
            <ProtectedRoute requiredRole="admin">
              <Activities />
            </ProtectedRoute>
          } />
          <Route path="/message-templates" element={
            <ProtectedRoute requiredRole="admin">
              <MessageTemplates />
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute requiredRole="admin">
              <Payments />
            </ProtectedRoute> 
          }
          />
          <Route path="/reports" element={
            <ProtectedRoute requiredRole="admin">
              <Reports />
            </ProtectedRoute> 
          }
          />
          <Route path="/agents" element={
            <ProtectedRoute requiredRole="admin">
              <Agents />
            </ProtectedRoute> 
          }
          />
          <Route path="/clients/:id" element={
            <ProtectedRoute requiredRole="admin">
              <ClientDetail />
            </ProtectedRoute> 
          }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}