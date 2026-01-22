// import { useState } from 'react'
// import { Outlet, useNavigate, useLocation } from 'react-router-dom'
// import {
//   AppBar,
//   Box,
//   Toolbar,
//   IconButton,
//   Typography,
//   Menu,
//   Container,
//   Avatar,
//   Tooltip,
//   MenuItem,
//   Drawer,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Divider
// } from '@mui/material'
// import MenuIcon from '@mui/icons-material/Menu'
// import DashboardIcon from '@mui/icons-material/Dashboard'
// import HomeWorkIcon from '@mui/icons-material/HomeWork'
// import LandscapeIcon from '@mui/icons-material/Landscape'
// import HomeIcon from '@mui/icons-material/Home'
// import PaymentIcon from '@mui/icons-material/Payment'
// import PeopleIcon from '@mui/icons-material/People'
// import BarChartIcon from '@mui/icons-material/BarChart'
// import ChevronRightIcon from '@mui/icons-material/ChevronRight'
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
// import { useAuth } from '../context/AuthContext'

// const drawerWidthCollapsed = 90
// const drawerWidthExpanded = 260

// const Layout = () => {
//   const [anchorElUser, setAnchorElUser] = useState(null)
//   const [mobileOpen, setMobileOpen] = useState(false)
//   const [expanded, setExpanded] = useState(false)
//   const { user, logout } = useAuth()
//   const navigate = useNavigate()
//   const location = useLocation()

//   const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget)
//   const handleCloseUserMenu = () => setAnchorElUser(null)
//   const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
  
//   const handleLogout = () => {
//     logout()
//     navigate('/login')
//     handleCloseUserMenu()
//   }

//   const menuItems = [
//     { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['superadmin', 'admin', 'user'] },
//     { text: 'Properties', icon: <HomeWorkIcon />, path: '/properties', roles: ['superadmin', 'admin'] },
//     { text: 'Lot Inventory', icon: <LandscapeIcon />, path: '/lots', roles: ['superadmin', 'admin'] },
//     { text: 'Models', icon: <HomeIcon />, path: '/models', roles: ['superadmin', 'admin'] },
//     { text: 'Payloads', icon: <PaymentIcon />, path: '/payloads', roles: ['superadmin', 'admin'] },
//     { text: 'Residents', icon: <PeopleIcon />, path: '/residents', roles: ['superadmin', 'admin'] },
//     { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics', roles: ['superadmin', 'admin'] },
//     { text: 'My Property', icon: <HomeIcon />, path: '/my-property', roles: ['superadmin', 'admin', 'user'] }
//   ]
  
//   const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role))

//   const getPageTitle = () => {
//     const path = location.pathname
//     if (path === '/property-selection' || path === '/properties/select') return 'Get Your Quote'
//     const currentMenuItem = menuItems.find(item => path.startsWith(item.path))
//     if (currentMenuItem) return currentMenuItem.text
//     return `Welcome, ${user?.firstName || 'User'}`
//   }

//   const drawer = (
//     <Box 
//       onMouseEnter={() => setExpanded(true)}
//       onMouseLeave={() => setExpanded(false)}
//       sx={{ 
//         height: '100%',
//         width: expanded ? drawerWidthExpanded : drawerWidthCollapsed,
//         transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//         background: 'rgba(255, 255, 255, 0.8)',
//         backdropFilter: 'blur(20px) saturate(180%)',
//         WebkitBackdropFilter: 'blur(20px) saturate(180%)',
//         borderRight: '1px solid rgba(255,255,255,0.3)',
//         display: 'flex',
//         flexDirection: 'column',
//         overflow: 'hidden',
//         boxShadow: '4px 0 24px rgba(0,0,0,0.06)'
//       }}
//     >
//       {/* Logo */}
//       <Box sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
//         <Box sx={{
//           width: 50,
//           height: 50,
//           margin: '0 auto',
//           background: 'linear-gradient(135deg, #4a7c59 0%, #76c893 100%)',
//           borderRadius: 3,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           boxShadow: '0 8px 32px rgba(74, 124, 89, 0.3)',
//           transform: expanded ? 'scale(1.1)' : 'scale(1)',
//           transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//           position: 'relative',
//           '&::before': {
//             content: '""',
//             position: 'absolute',
//             inset: -4,
//             borderRadius: 3,
//             background: 'linear-gradient(135deg, #4a7c59 0%, #76c893 100%)',
//             opacity: 0.2,
//             filter: 'blur(12px)',
//             zIndex: -1
//           }
//         }}>
//           <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>L</Typography>
//         </Box>
//         {expanded && (
//           <Box sx={{
//             mt: 2,
//             opacity: expanded ? 1 : 0,
//             transform: expanded ? 'translateY(0)' : 'translateY(-10px)',
//             transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
//           }}>
//             <Typography 
//               variant="h6" 
//               sx={{ 
//                 fontWeight: 700,
//                 color: '#2d3748',
//                 letterSpacing: '-0.5px'
//               }}
//             >
//               Lakewood
//             </Typography>
//             <Typography 
//               variant="caption" 
//               sx={{ 
//                 color: '#4a7c59',
//                 fontWeight: 600,
//                 letterSpacing: 2
//               }}
//             >
//               OAKS
//             </Typography>
//           </Box>
//         )}
//       </Box>

//       {/* Navigation */}
//       <List sx={{ flex: 1, px: 1.5, py: 2 }}>
//         {filteredMenuItems.map((item, index) => (
//           <Tooltip 
//             key={item.text} 
//             title={!expanded ? item.text : ''} 
//             placement="right"
//             arrow
//           >
//             <ListItem 
//               disablePadding 
//               sx={{ 
//                 mb: 1,
//                 opacity: 0,
//                 animation: `slideIn 0.3s ease forwards ${index * 0.05}s`,
//                 '@keyframes slideIn': {
//                   from: { opacity: 0, transform: 'translateX(-20px)' },
//                   to: { opacity: 1, transform: 'translateX(0)' }
//                 }
//               }}
//             >
//               <ListItemButton
//                 onClick={() => navigate(item.path)}
//                 selected={location.pathname === item.path}
//                 sx={{
//                   borderRadius: 3,
//                   py: 1.5,
//                   justifyContent: expanded ? 'flex-start' : 'center',
//                   position: 'relative',
//                   transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//                   '&.Mui-selected': {
//                     bgcolor: 'rgba(74, 124, 89, 0.12)',
//                     '&::after': {
//                       content: '""',
//                       position: 'absolute',
//                       right: 0,
//                       top: '50%',
//                       transform: 'translateY(-50%)',
//                       width: 4,
//                       height: '70%',
//                       bgcolor: '#4a7c59',
//                       borderRadius: '4px 0 0 4px',
//                       boxShadow: '-2px 0 8px rgba(74, 124, 89, 0.3)'
//                     }
//                   },
//                   '&:hover': {
//                     bgcolor: 'rgba(74, 124, 89, 0.08)',
//                     transform: expanded ? 'translateX(6px)' : 'scale(1.1)',
//                     boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
//                   }
//                 }}
//               >
//                 <ListItemIcon 
//                   sx={{ 
//                     minWidth: expanded ? 45 : 'auto',
//                     justifyContent: 'center',
//                     color: location.pathname === item.path ? '#4a7c59' : '#718096',
//                     transition: 'color 0.3s ease'
//                   }}
//                 >
//                   <Box sx={{
//                     bgcolor: location.pathname === item.path ? 'rgba(74, 124, 89, 0.15)' : 'transparent',
//                     borderRadius: 2,
//                     p: 0.8,
//                     display: 'flex',
//                     transition: 'background-color 0.3s ease'
//                   }}>
//                     {item.icon}
//                   </Box>
//                 </ListItemIcon>
//                 {expanded && (
//                   <ListItemText
//                     primary={item.text}
//                     primaryTypographyProps={{
//                       fontSize: '0.9rem',
//                       fontWeight: location.pathname === item.path ? 600 : 500,
//                       color: location.pathname === item.path ? '#2d3748' : '#4a5568'
//                     }}
//                     sx={{
//                       opacity: expanded ? 1 : 0,
//                       transition: 'opacity 0.3s ease'
//                     }}
//                   />
//                 )}
//               </ListItemButton>
//             </ListItem>
//           </Tooltip>
//         ))}
//       </List>

//       {/* Toggle Button */}
//       <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
//         <IconButton
//           onClick={() => setExpanded(!expanded)}
//           sx={{
//             bgcolor: 'rgba(74, 124, 89, 0.1)',
//             color: '#4a7c59',
//             width: 36,
//             height: 36,
//             transition: 'all 0.3s ease',
//             '&:hover': {
//               bgcolor: 'rgba(74, 124, 89, 0.2)',
//               transform: 'scale(1.1)'
//             }
//           }}
//         >
//           {expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
//         </IconButton>
//       </Box>

//       {/* User Avatar */}
//       <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
//         <Avatar 
//           onClick={handleOpenUserMenu}
//           sx={{ 
//             width: expanded ? 48 : 42,
//             height: expanded ? 48 : 42,
//             margin: '0 auto',
//             bgcolor: '#4a7c59',
//             border: '3px solid rgba(74, 124, 89, 0.2)',
//             transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//             cursor: 'pointer',
//             fontWeight: 700,
//             '&:hover': {
//               transform: 'scale(1.1)',
//               boxShadow: '0 4px 16px rgba(74, 124, 89, 0.3)'
//             }
//           }}
//         >
//           {user?.firstName?.charAt(0).toUpperCase()}
//         </Avatar>
//         {expanded && (
//           <Box sx={{
//             mt: 1.5,
//             opacity: expanded ? 1 : 0,
//             transform: expanded ? 'translateY(0)' : 'translateY(-10px)',
//             transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
//           }}>
//             <Typography 
//               variant="body2" 
//               sx={{ 
//                 fontWeight: 600,
//                 color: '#2d3748',
//                 lineHeight: 1.2
//               }}
//             >
//               {user?.firstName}
//             </Typography>
//             <Typography 
//               variant="caption" 
//               sx={{ 
//                 color: '#718096',
//                 fontSize: '0.7rem'
//               }}
//             >
//               {user?.role}
//             </Typography>
//           </Box>
//         )}
//       </Box>
//     </Box>
//   )

//   const drawerWidth = expanded ? drawerWidthExpanded : drawerWidthCollapsed

//   return (
//     <Box sx={{ display: 'flex' }}>
//       <AppBar
//         position="fixed"
//         sx={{
//           width: { sm: `calc(100% - ${drawerWidth}px)` },
//           ml: { sm: `${drawerWidth}px` },
//           bgcolor: 'rgba(255, 255, 255, 0.8)',
//           backdropFilter: 'blur(20px)',
//           WebkitBackdropFilter: 'blur(20px)',
//           color: '#2d3748',
//           boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
//           borderBottom: '1px solid rgba(0,0,0,0.05)',
//           transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
//         }}
//       >
//         <Toolbar>
//           <IconButton
//             color="inherit"
//             edge="start"
//             onClick={handleDrawerToggle}
//             sx={{ mr: 2, display: { sm: 'none' } }}
//           >
//             <MenuIcon />
//           </IconButton>
//           <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
//             {getPageTitle()}
//           </Typography>
//           <Tooltip title="Open settings">
//             <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
//               <Avatar 
//                 sx={{ 
//                   bgcolor: '#4a7c59',
//                   width: 38,
//                   height: 38,
//                   border: '2px solid rgba(74, 124, 89, 0.2)'
//                 }}
//               >
//                 {user?.firstName?.charAt(0).toUpperCase()}
//               </Avatar>
//             </IconButton>
//           </Tooltip>
//           <Menu
//             anchorEl={anchorElUser}
//             open={Boolean(anchorElUser)}
//             onClose={handleCloseUserMenu}
//             anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//             transformOrigin={{ vertical: 'top', horizontal: 'right' }}
//             sx={{ 
//               mt: 1.5,
//               '& .MuiPaper-root': {
//                 borderRadius: 2,
//                 boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
//                 minWidth: 200,
//                 backdropFilter: 'blur(20px)',
//                 bgcolor: 'rgba(255, 255, 255, 0.95)'
//               }
//             }}
//           >
//             <MenuItem 
//               onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}
//               sx={{ 
//                 py: 1.5,
//                 '&:hover': { bgcolor: 'rgba(74, 124, 89, 0.08)' }
//               }}
//             >
//               <Typography>Profile</Typography>
//             </MenuItem>
//             <Divider />
//             <MenuItem 
//               onClick={handleLogout}
//               sx={{ 
//                 py: 1.5,
//                 color: '#d32f2f',
//                 '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' }
//               }}
//             >
//               <Typography>Logout</Typography>
//             </MenuItem>
//           </Menu>
//         </Toolbar>
//       </AppBar>

//       <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
//         <Drawer
//           variant="temporary"
//           open={mobileOpen}
//           onClose={handleDrawerToggle}
//           ModalProps={{ keepMounted: true }}
//           sx={{
//             display: { xs: 'block', sm: 'none' },
//             '& .MuiDrawer-paper': { 
//               boxSizing: 'border-box', 
//               width: drawerWidthExpanded, 
//               border: 'none' 
//             },
//           }}
//         >
//           {drawer}
//         </Drawer>
//         <Drawer
//           variant="permanent"
//           sx={{
//             display: { xs: 'none', sm: 'block' },
//             '& .MuiDrawer-paper': { 
//               boxSizing: 'border-box', 
//               width: drawerWidth,
//               border: 'none',
//               transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
//             },
//           }}
//           open
//         >
//           {drawer}
//         </Drawer>
//       </Box>
//             {/* <Box 
//               component="main" 
//               sx={{ 
//                 flexGrow: 1, 
//                 p: 3, 
//                 width: '100%', 
//                 bgcolor: '#f7fafc',
//                 minHeight: '100vh',
//                 transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
//               }}
//             >
//               <Toolbar />
//               <Container maxWidth={false} disableGutters sx={{ px: 3 }}>
//                 <Outlet />
//               </Container>
//             </Box> */}
//                   {/* ✅ Main content con ajustes para prevenir overflow */}
//       <Box 
//         component="main" 
//         sx={{ 
//           flexGrow: 1, 
//           width: '100%',
//           maxWidth: '100%', // ✅ Limitar al 100%
//           overflow: 'hidden', // ✅ Prevenir overflow
//           bgcolor: '#f7fafc',
//           minHeight: '100vh',
//           transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//           boxSizing: 'border-box' // ✅ Importante
//         }}
//       >
//         <Toolbar />
//         {/* ✅ Remover Container y usar Box directo */}
//         <Box 
//           sx={{ 
//             px: 3, 
//             py: 3,
//             width: '100%',
//             maxWidth: '100%', // ✅ Limitar
//             boxSizing: 'border-box', // ✅ Importante
//             overflowX: 'hidden' // ✅ Prevenir scroll horizontal
//           }}
//         >
//           <Outlet />
//         </Box>
//       </Box>
      
//     </Box>
//   )
// }

// export default Layout


import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Avatar,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import LandscapeIcon from '@mui/icons-material/Landscape'
import HomeIcon from '@mui/icons-material/Home'
import PaymentIcon from '@mui/icons-material/Payment'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const drawerWidthCollapsed = 90
const drawerWidthExpanded = 260

const Layout = () => {
  const [anchorElUser, setAnchorElUser] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expanded, setExpanded] = useState(true) // ✅ Cambiado a true para mostrar nombres por defecto
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget)
  const handleCloseUserMenu = () => setAnchorElUser(null)
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
  
  const handleLogout = () => {
    logout()
    navigate('/login')
    handleCloseUserMenu()
  }

  // ✅ Función para toggle sin conflictos
  const toggleDrawer = () => {
    setExpanded(prev => !prev)
  }

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['superadmin', 'admin', 'user'] },
    { text: 'Properties', icon: <HomeWorkIcon />, path: '/properties', roles: ['superadmin', 'admin'] },
    { text: 'Lot Inventory', icon: <LandscapeIcon />, path: '/lots', roles: ['superadmin', 'admin'] },
    { text: 'Models', icon: <HomeIcon />, path: '/models', roles: ['superadmin', 'admin'] },
    { text: 'Payloads', icon: <PaymentIcon />, path: '/payloads', roles: ['superadmin', 'admin'] },
    { text: 'Residents', icon: <PeopleIcon />, path: '/residents', roles: ['superadmin', 'admin'] },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics', roles: ['superadmin', 'admin'] },
    { text: 'My Property', icon: <HomeIcon />, path: '/my-property', roles: ['superadmin', 'admin', 'user'] }
  ]
  
  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role))

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/property-selection' || path === '/properties/select') return 'Get Your Quote'
    const currentMenuItem = menuItems.find(item => path.startsWith(item.path))
    if (currentMenuItem) return currentMenuItem.text
    return `Welcome, ${user?.firstName || 'User'}`
  }

  const drawer = (
    <Box 
      // ✅ REMOVIDO: onMouseEnter y onMouseLeave
      sx={{ 
        height: '100%',
        width: expanded ? drawerWidthExpanded : drawerWidthCollapsed,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRight: '1px solid rgba(255,255,255,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.06)'
      }}
    >
      {/* Logo con animación */}
      <Box sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
        <motion.div
          animate={{ 
            scale: expanded ? 1.1 : 1,
            rotate: expanded ? 360 : 0
          }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 200
          }}
        >
          <Box sx={{
            width: 50,
            height: 50,
            margin: '0 auto',
            background: 'linear-gradient(135deg, #4a7c59 0%, #76c893 100%)',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(74, 124, 89, 0.3)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: -4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4a7c59 0%, #76c893 100%)',
              opacity: 0.2,
              filter: 'blur(12px)',
              zIndex: -1
            }
          }}>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>L</Typography>
          </Box>
        </motion.div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#2d3748',
                    letterSpacing: '-0.5px'
                  }}
                >
                  Lakewood
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#4a7c59',
                    fontWeight: 600,
                    letterSpacing: 2
                  }}
                >
                  OAKS
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Navigation con animaciones */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {filteredMenuItems.map((item, index) => (
          <Tooltip 
            key={item.text} 
            title={!expanded ? item.text : ''} 
            placement="right"
            arrow
          >
            <ListItem disablePadding sx={{ mb: 1 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  duration: 0.3,
                  ease: "easeOut"
                }}
                style={{ width: '100%' }}
              >
                <motion.div
                  whileHover={{ 
                    scale: expanded ? 1 : 1.1,
                    x: expanded ? 6 : 0
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={location.pathname === item.path}
                    sx={{
                      borderRadius: 3,
                      py: 1.5,
                      justifyContent: expanded ? 'flex-start' : 'center',
                      position: 'relative',
                      bgcolor: location.pathname === item.path ? 'rgba(74, 124, 89, 0.12)' : 'transparent',
                      '&::after': location.pathname === item.path ? {
                        content: '""',
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 4,
                        height: '70%',
                        bgcolor: '#4a7c59',
                        borderRadius: '4px 0 0 4px',
                        boxShadow: '-2px 0 8px rgba(74, 124, 89, 0.3)'
                      } : {},
                      '&:hover': {
                        bgcolor: 'rgba(74, 124, 89, 0.08)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        minWidth: expanded ? 45 : 'auto',
                        justifyContent: 'center',
                        color: location.pathname === item.path ? '#4a7c59' : '#718096',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      <motion.div
                        animate={{
                          rotate: location.pathname === item.path ? [0, -10, 10, 0] : 0
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <Box sx={{
                          bgcolor: location.pathname === item.path ? 'rgba(74, 124, 89, 0.15)' : 'transparent',
                          borderRadius: 2,
                          p: 0.8,
                          display: 'flex',
                          transition: 'background-color 0.3s ease'
                        }}>
                          {item.icon}
                        </Box>
                      </motion.div>
                    </ListItemIcon>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                              fontSize: '0.9rem',
                              fontWeight: location.pathname === item.path ? 600 : 500,
                              color: location.pathname === item.path ? '#2d3748' : '#4a5568'
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ListItemButton>
                </motion.div>
              </motion.div>
            </ListItem>
          </Tooltip>
        ))}
      </List>

      {/* Toggle Button con animación - ✅ SOLO onClick */}
      <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IconButton
            onClick={toggleDrawer} // ✅ Usa la función sin conflictos
            sx={{
              bgcolor: 'rgba(74, 124, 89, 0.1)',
              color: '#4a7c59',
              width: 36,
              height: 36,
              '&:hover': {
                bgcolor: 'rgba(74, 124, 89, 0.2)',
              }
            }}
          >
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </motion.div>
          </IconButton>
        </motion.div>
      </Box>

      {/* User Avatar con animación */}
      <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            width: expanded ? 48 : 42,
            height: expanded ? 48 : 42
          }}
          transition={{ duration: 0.3 }}
          style={{ 
            margin: '0 auto',
            width: 'fit-content'
          }}
        >
          <Avatar 
            onClick={handleOpenUserMenu}
            sx={{ 
              width: expanded ? 48 : 42,
              height: expanded ? 48 : 42,
              bgcolor: '#4a7c59',
              border: '3px solid rgba(74, 124, 89, 0.2)',
              cursor: 'pointer',
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(74, 124, 89, 0.3)'
            }}
          >
            {user?.firstName?.charAt(0).toUpperCase()}
          </Avatar>
        </motion.div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Box sx={{ mt: 1.5 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: '#2d3748',
                    lineHeight: 1.2
                  }}
                >
                  {user?.firstName}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#718096',
                    fontSize: '0.7rem'
                  }}
                >
                  {user?.role}
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  )

  const drawerWidth = expanded ? drawerWidthExpanded : drawerWidthCollapsed

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar con animación de entrada */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        style={{ 
          position: 'fixed',
          top: 0,
          right: 0,
          left: isMobile ? 0 : drawerWidth,
          zIndex: 1200
        }}
      >
        <AppBar
          position="static"
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: '#2d3748',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              style={{ flexGrow: 1 }}
            >
              <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                {getPageTitle()}
              </Typography>
            </motion.div>

            <Tooltip title="Open settings">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: '#4a7c59',
                      width: 38,
                      height: 38,
                      border: '2px solid rgba(74, 124, 89, 0.2)'
                    }}
                  >
                    {user?.firstName?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </motion.div>
            </Tooltip>

            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              sx={{ 
                mt: 1.5,
                '& .MuiPaper-root': {
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  minWidth: 200,
                  backdropFilter: 'blur(20px)',
                  bgcolor: 'rgba(255, 255, 255, 0.95)'
                }
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MenuItem 
                  onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}
                  sx={{ 
                    py: 1.5,
                    '&:hover': { bgcolor: 'rgba(74, 124, 89, 0.08)' }
                  }}
                >
                  <Typography>Profile</Typography>
                </MenuItem>
                <Divider />
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    py: 1.5,
                    color: '#d32f2f',
                    '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' }
                  }}
                >
                  <Typography>Logout</Typography>
                </MenuItem>
              </motion.div>
            </Menu>
          </Toolbar>
        </AppBar>
      </motion.div>

      {/* Drawer con nav */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidthExpanded, 
              border: 'none' 
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content con animación de página */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          bgcolor: '#f7fafc',
          minHeight: '100vh',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxSizing: 'border-box',
          pt: '64px'
        }}
      >
        <Box 
          sx={{ 
            px: 3, 
            py: 3,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  )
}

export default Layout