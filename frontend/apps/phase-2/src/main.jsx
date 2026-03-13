// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import { ThemeProvider } from '@mui/material/styles'
// import theme from './theme'
// import { AuthProvider } from '@shared/context/AuthContext'  
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import '@shared/i18n'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <ThemeProvider theme={theme}>
//       <AuthProvider>
//         <App />
//       </AuthProvider>
//     </ThemeProvider>
//   </React.StrictMode>
// )

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import '@shared/i18n'
import { AuthProvider } from '@shared/context/AuthContext'
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