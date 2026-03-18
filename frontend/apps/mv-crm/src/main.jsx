import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@shared/i18n'
import './index.css'
import { AuthProvider } from '../../../shared/context/AuthContext.jsx'
import { ThemeProvider } from '@mui/material/styles'
import theme from './theme'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)
