// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// import { ThemeProvider } from '@mui/material/styles'
// import CssBaseline from '@mui/material/CssBaseline'
// import { AuthProvider } from '@shared/context/AuthContext'
// import ProtectedRoute from '@shared/components/ProtectedRoute'
// import Phase2Layout from './Components/Layout/Phase2Layout'
// import Residents from './Pages/Residents'
// import Dashboard from './Pages/Dashboard'
// import NotFound from './Pages/NotFound'
// import Login from './Pages/LoginPhase2'
// import theme from './theme' // <-- ¡Agrega esta línea!
// import Layout from '@shared/components/LayoutComponents/Layout'


// function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <AuthProvider>
//         <Router>
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route element={<ProtectedRoute />}>
//               <Route element={<Layout publicView={false} />}>
//                 <Route path="/" element={<Navigate to="/dashboard" replace />} />
//                 <Route path="/dashboard" element={<Dashboard />} />
//                 <Route path="/residents" element={<Residents />} />
//                 {/* ...otras rutas */}
//               </Route>
//             </Route>
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </Router>
//       </AuthProvider>
//     </ThemeProvider>
//   )
// }
// export default App

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
import { privateMenuItems, publicMenuItems } from './Constants/MenuItems' // <-- Tus propios menuItems
// import logoPhase2 from '../src/assets/LOGO_MICHELANGELO_PNG-07.png' // <-- Asegúrate de tener este logo en tu carpeta de assets
import logoPhase2 from '../src/assets/react.svg' // <-- para que no se desborde, luego cambiar 


import ConfigurationManagerP2 from './Pages/ConfigurationManagerP2'
import Profile from './Pages/ProfileP2'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
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
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/residents" element={<Residents />} />
                <Route path="/configuration" element={<ConfigurationManagerP2 />} />
                <Route path="/profile" element={<Profile />} />
                {/* ...otras rutas */}
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