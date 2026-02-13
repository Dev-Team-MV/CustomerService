// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// import { ThemeProvider, createTheme } from '@mui/material/styles'
// import CssBaseline from '@mui/material/CssBaseline'
// import { AuthProvider } from './context/AuthContext'
// import ProtectedRoute from './components/ProtectedRoute'
// import Layout from './components/Layout'
// import Login from './pages/Login'
// import Register from './pages/Register'
// import Dashboard from './pages/Dashboard'
// import Profile from './pages/Profile'
// import Properties from './pages/Properties'
// import PropertySelection from './pages/PropertySelection'
// import Lots from './pages/Lots'
// import Models from './pages/Models'
// import ModelDetail from './pages/ModelDetail'
// import Payloads from './pages/Payloads'
// import Residents from './pages/Residents'
// import Analytics from './pages/Analytics'
// import MyProperty from './pages/MyProperty'
// import AmenitiesPublic from './pages/AmenitiesPublic'
// import AmenitiesPrivate from './pages/AmenitiesPrivate'
// import NotFound from './pages/NotFound'
// import ViewModels from './pages/ViewModels'
// import NewsTable from './pages/NewsTable'
// import NewsDetails from './components/news/NewsDetails'
// import NewsFeed from './pages/NewsFeed'

// const theme = createTheme({
//   palette: {
//     primary: {
//       main: '#4a7c59',
//     },
//     secondary: {
//       main: '#8bc34a',
//     },
//   },
// })

// function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <AuthProvider>
//         <Router>
//           <Routes>
//             {/* Auth Routes - Sin Layout */}
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/setup-password/:token" element={<Register />} />
            
//             {/* Public Routes - Layout Público */}
//             <Route element={<Layout publicView={true} />}>
//               <Route path="/explore/properties" element={<PropertySelection />} />
//               <Route path="/explore/amenities" element={<AmenitiesPublic />} />
//                       {/* ✅ Rutas públicas (para propietarios) */}
//         <Route path="/news-feed" element={<NewsFeed />} />
//         <Route path="/news/:id" element={<NewsDetails />} />
        
//             </Route>

//             {/* Protected Routes - Layout Privado */}
//             <Route element={<ProtectedRoute />}>
//               <Route element={<Layout publicView={false} />}>
//                 <Route path="/" element={<Navigate to="/dashboard" replace />} />
//                 <Route path="/dashboard" element={<Dashboard />} />
//                 <Route path="/my-property" element={<MyProperty />} />
//                 <Route path="/amenities" element={<AmenitiesPrivate />} />
//                 <Route path="/view-models" element={<ViewModels />} />

//                 <Route path="/news" element={<NewsTable />} />
//                 <Route path="/news/:id" element={<NewsDetails />} />
                
//                 {/* Property Management */}
//                 <Route path="/properties" element={<Properties />} />
//                 <Route path="/properties/select" element={<PropertySelection />} />
                
//                 <Route path="/lots" element={<Lots />} />
//                 <Route path="/models" element={<Models />} />
//                 <Route path="/models/:id" element={<ModelDetail />} />
//                 <Route path="/payloads" element={<Payloads />} />
//                 <Route path="/residents" element={<Residents />} />
//                 <Route path="/analytics" element={<Analytics />} />
//                 <Route path="/profile" element={<Profile />} />
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
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Properties from './pages/Properties'
import PropertySelection from './pages/PropertySelection'
import Lots from './pages/Lots'
import Models from './pages/Models'
import ModelDetail from './pages/ModelDetail'
import Payloads from './pages/Payloads'
import Residents from './pages/Residents'
import Analytics from './pages/Analytics'
import MyProperty from './pages/MyProperty'
import AmenitiesPublic from './pages/AmenitiesPublic'
import AmenitiesPrivate from './pages/AmenitiesPrivate'
import NotFound from './pages/NotFound'
import ViewModels from './pages/ViewModels'
import NewsTable from './pages/NewsTable'
import NewsDetails from './components/news/NewsDetails'
import NewsFeed from './pages/NewsFeed'
import TermsAndCondition from './pages/TermsAndCondition'

const theme = createTheme({
  palette: {
    primary: {
      main: '#4a7c59',
    },
    secondary: {
      main: '#8bc34a',
    },
  },
})

// ✅ Componente wrapper que cambia el layout según autenticación
const DynamicLayoutWrapper = ({ children }) => {
  const { user } = useAuth()
  const publicView = !user // Si no hay usuario, usa layout público
  
  return <Layout publicView={publicView}>{children}</Layout>
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Routes - Sin Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/setup-password/:token" element={<Register />} />
            <Route path="/terms-and-conditions" element={<TermsAndCondition />} />
            
            {/* ✅ Public Routes - Layout Público (solo para no autenticados) */}
            <Route element={<Layout publicView={true} />}>
              <Route path="/explore/properties" element={<PropertySelection />} />
              <Route path="/explore/amenities" element={<AmenitiesPublic />} />
            </Route>

            {/* ✅ Hybrid Routes - Layout dinámico según autenticación */}
            <Route element={<DynamicLayoutWrapper />}>
              <Route path="/explore/news" element={<NewsFeed />} />
              <Route path="/explore/news/:id" element={<NewsDetails />} />
            </Route>

            {/* ✅ Protected Routes - Layout Privado */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout publicView={false} />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-property" element={<MyProperty />} />
                <Route path="/amenities" element={<AmenitiesPrivate />} />
                <Route path="/view-models" element={<ViewModels />} />
                
                {/* ✅ Admin-only News Management */}
                <Route path="/news" element={<NewsTable />} />
                
                {/* Property Management */}
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/select" element={<PropertySelection />} />
                
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