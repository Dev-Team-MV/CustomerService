// import { useState } from 'react'
// import { Outlet, useNavigate, useLocation } from 'react-router-dom'
// import {
//   AppBar,
//   Box,
//   Toolbar,
//   IconButton,
//   Typography,
//   Menu,
//   Avatar,
//   Tooltip,
//   MenuItem,
//   Drawer,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Divider,
//   useMediaQuery,
//   useTheme,
//   Button
// } from '@mui/material'
// import MenuIcon from '@mui/icons-material/Menu'
// import DashboardIcon from '@mui/icons-material/Dashboard'
// import HomeWorkIcon from '@mui/icons-material/HomeWork'
// import LandscapeIcon from '@mui/icons-material/Landscape'
// import HomeIcon from '@mui/icons-material/Home'
// import PaymentIcon from '@mui/icons-material/Payment'
// import PeopleIcon from '@mui/icons-material/People'
// import BarChartIcon from '@mui/icons-material/BarChart'
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
// import LoginIcon from '@mui/icons-material/Login'
// import PersonAddIcon from '@mui/icons-material/PersonAdd'
// import { useAuth } from '../context/AuthContext'
// import { motion, AnimatePresence } from 'framer-motion'

// const drawerWidthExpanded = 260

// const Layout = ({ publicView = false }) => {
//   const [anchorElUser, setAnchorElUser] = useState(null)
//   const [expanded, setExpanded] = useState(false) // Sidebar starts collapsed (hidden)
//   const { user, logout } = useAuth()
//   const navigate = useNavigate()
//   const location = useLocation()
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

//   const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget)
//   const handleCloseUserMenu = () => setAnchorElUser(null)
//   const handleLogout = () => {
//     logout()
//     navigate('/login')
//     handleCloseUserMenu()
//   }

//   // Menú para usuarios autenticados
//   const privateMenuItems = [
//     { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['superadmin', 'admin', 'user'] },
//     { text: 'Properties', icon: <HomeWorkIcon />, path: '/properties', roles: ['superadmin', 'admin'] },
//     { text: 'Lot Inventory', icon: <LandscapeIcon />, path: '/lots', roles: ['superadmin', 'admin'] },
//     { text: 'Models', icon: <HomeIcon />, path: '/models', roles: ['superadmin', 'admin'] },
//     { text: 'Payloads', icon: <PaymentIcon />, path: '/payloads', roles: ['superadmin', 'admin'] },
//     { text: 'Residents', icon: <PeopleIcon />, path: '/residents', roles: ['superadmin', 'admin'] },
//     { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics', roles: ['superadmin', 'admin'] },
//     { text: 'My Property', icon: <HomeIcon />, path: '/my-property', roles: ['superadmin', 'admin', 'user'] },
//     { text: 'Amenities', icon: <HomeWorkIcon />, path: '/amenities', roles: ['superadmin', 'admin', 'user'] }
//   ]

//   // Menú para vista pública
//   const publicMenuItems = [
//     { text: 'Get Your Quote', icon: <HomeWorkIcon />, path: '/explore/properties' },
//     { text: 'Explore Amenities', icon: <HomeIcon />, path: '/explore/amenities' }
//   ]

//   const menuItems = publicView ? publicMenuItems : privateMenuItems.filter(item => item.roles.includes(user?.role))

//   const getPageTitle = () => {
//     const path = location.pathname
//     if (publicView) {
//       if (path === '/explore/properties') return 'Get Your Quote'
//       if (path === '/explore/amenities') return 'Explore Amenities'
//       return 'Lakewood Oaks'
//     }
//     const currentMenuItem = privateMenuItems.find(item => path.startsWith(item.path))
//     if (currentMenuItem) return currentMenuItem.text
//     return `Welcome, ${user?.firstName || 'User'}`
//   }

//   // Drawer content (solo visible si expanded)
//   const drawer = expanded && (
//     <Box 
//       sx={{ 
//         height: '100%',
//         width: drawerWidthExpanded,
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
//         <Box
//           component="img"
//           // src="/images/logos/Logo_LakewoodOaks-05.png"
//           alt="Lakewood Oaks"
//           sx={{
//             width: '100%',
//             maxWidth: '200px',
//             height: 'auto',
//             objectFit: 'contain'
//           }}
//         />
//       </Box>

//       {/* Navigation */}
//       <List sx={{ flex: 1, px: 1.5, py: 2 }}>
//         {menuItems.map((item, index) => (
//           <Tooltip 
//             key={item.text} 
//             title={item.text} 
//             placement="right"
//             arrow
//           >
//             <ListItem disablePadding sx={{ mb: 1 }}>
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ 
//                   delay: index * 0.05,
//                   duration: 0.3,
//                   ease: "easeOut"
//                 }}
//                 style={{ width: '100%' }}
//               >
//                 <motion.div
//                   whileHover={{ scale: 1, x: 6 }}
//                   whileTap={{ scale: 0.95 }}
//                   transition={{ type: "spring", stiffness: 400 }}
//                 >
//                   <ListItemButton
//                     onClick={() => navigate(item.path)}
//                     selected={location.pathname === item.path}
//                     sx={{
//                       borderRadius: 3,
//                       py: 1.5,
//                       justifyContent: 'flex-start',
//                       position: 'relative',
//                       bgcolor: location.pathname === item.path ? 'rgba(74, 124, 89, 0.12)' : 'transparent',
//                       '&::after': location.pathname === item.path ? {
//                         content: '""',
//                         position: 'absolute',
//                         right: 0,
//                         top: '50%',
//                         transform: 'translateY(-50%)',
//                         width: 4,
//                         height: '70%',
//                         bgcolor: '#4a7c59',
//                         borderRadius: '4px 0 0 4px',
//                         boxShadow: '-2px 0 8px rgba(74, 124, 89, 0.3)'
//                       } : {},
//                       '&:hover': {
//                         bgcolor: 'rgba(74, 124, 89, 0.08)',
//                         boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
//                       }
//                     }}
//                   >
//                     <ListItemIcon 
//                       sx={{ 
//                         minWidth: 45,
//                         justifyContent: 'center',
//                         color: location.pathname === item.path ? '#4a7c59' : '#718096',
//                         transition: 'color 0.3s ease'
//                       }}
//                     >
//                       <motion.div
//                         animate={{
//                           rotate: location.pathname === item.path ? [0, -10, 10, 0] : 0
//                         }}
//                         transition={{ duration: 0.5 }}
//                       >
//                         <Box sx={{
//                           bgcolor: location.pathname === item.path ? 'rgba(74, 124, 89, 0.15)' : 'transparent',
//                           borderRadius: 2,
//                           p: 0.8,
//                           display: 'flex',
//                           transition: 'background-color 0.3s ease'
//                         }}>
//                           {item.icon}
//                         </Box>
//                       </motion.div>
//                     </ListItemIcon>
//                     <ListItemText
//                       primary={item.text}
//                       primaryTypographyProps={{
//                         fontSize: '0.9rem',
//                         fontWeight: location.pathname === item.path ? 600 : 500,
//                         color: location.pathname === item.path ? '#2d3748' : '#4a5568'
//                       }}
//                     />
//                   </ListItemButton>
//                 </motion.div>
//               </motion.div>
//             </ListItem>
//           </Tooltip>
//         ))}
//       </List>

//       {/* Toggle Button */}
//       <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
//         <IconButton
//           onClick={() => setExpanded(false)}
//           sx={{
//             bgcolor: 'rgba(74, 124, 89, 0.1)',
//             color: '#4a7c59',
//             width: 36,
//             height: 36,
//             '&:hover': {
//               bgcolor: 'rgba(74, 124, 89, 0.2)',
//             }
//           }}
//         >
//           <ChevronLeftIcon />
//         </IconButton>
//       </Box>
//     </Box>
//   )

//   return (
//     <Box sx={{ display: 'flex' }}>
//       {/* AppBar */}
//       <AppBar
//         position="fixed"
//         sx={{
//           bgcolor: 'rgba(255, 255, 255, 0.9)',
//           backdropFilter: 'blur(20px)',
//           WebkitBackdropFilter: 'blur(20px)',
//           color: '#2d3748',
//           boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
//           borderBottom: '1px solid rgba(0,0,0,0.05)',
//           zIndex: 1201
//         }}
//       >
//         <Toolbar>
//           {/* Menu button: only visible when sidebar is collapsed */}
//           {!expanded && (
//             <IconButton
//               color="inherit"
//               edge="start"
//               onClick={() => setExpanded(true)}
//               sx={{ mr: 2 }}
//             >
//               <MenuIcon />
//             </IconButton>
//           )}
//           {/* Logo centered */}
//           <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
//         <Box
//           component="img"
//           src="/images/logos/Logo_LakewoodOaks-05.png"
//           alt="Lakewood Oaks"
//           sx={{
//             width: '100%',
//             maxWidth: '200px',
//             height: 'auto',
//             objectFit: 'contain'
//           }}
//         />
//           </Box>
//           {/* Usuario/login a la derecha */}
//           <Box sx={{ ml: 2 }}>
//             {user ? (
//               <>
//                 <Tooltip title="Open settings">
//                   <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
//                     <Avatar 
//                       sx={{ 
//                         bgcolor: '#4a7c59',
//                         width: 38,
//                         height: 38,
//                         border: '2px solid rgba(74, 124, 89, 0.2)'
//                       }}
//                     >
//                       {user?.firstName?.charAt(0).toUpperCase()}
//                     </Avatar>
//                   </IconButton>
//                 </Tooltip>
//                 <Menu
//                   anchorEl={anchorElUser}
//                   open={Boolean(anchorElUser)}
//                   onClose={handleCloseUserMenu}
//                   anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//                   transformOrigin={{ vertical: 'top', horizontal: 'right' }}
//                   sx={{ 
//                     mt: 1.5,
//                     '& .MuiPaper-root': {
//                       borderRadius: 2,
//                       boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
//                       minWidth: 200,
//                       backdropFilter: 'blur(20px)',
//                       bgcolor: 'rgba(255, 255, 255, 0.95)'
//                     }
//                   }}
//                 >
//                   <MenuItem 
//                     onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}
//                     sx={{ py: 1.5 }}
//                   >
//                     <Typography>Profile</Typography>
//                   </MenuItem>
//                   <Divider />
//                   <MenuItem 
//                     onClick={handleLogout}
//                     sx={{ py: 1.5, color: '#d32f2f' }}
//                   >
//                     <Typography>Logout</Typography>
//                   </MenuItem>
//                 </Menu>
//               </>
//             ) : (
//               <Button
//                 variant="contained"
//                 startIcon={<LoginIcon />}
//                 onClick={() => navigate('/login')}
//                 sx={{
//                   bgcolor: '#4a7c59',
//                   color: '#fff',
//                   '&:hover': { bgcolor: '#3a6249' }
//                 }}
//               >
//                 Login
//               </Button>
//             )}
//           </Box>
//         </Toolbar>
//       </AppBar>

//       {/* Drawer/sidebar: only visible if expanded */}
//       <Drawer
//         variant="persistent"
//         open={expanded}
//         sx={{
//           width: expanded ? drawerWidthExpanded : 0,
//           flexShrink: 0,
//           '& .MuiDrawer-paper': {
//             width: expanded ? drawerWidthExpanded : 0,
//             boxSizing: 'border-box',
//             overflowX: 'hidden',
//             transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//             border: 'none',
//             ...(expanded ? {} : { display: 'none' })
//           }
//         }}
//       >
//         {drawer}
//       </Drawer>

//       {/* Main content */}
//       <Box 
//         component="main" 
//         sx={{ 
//           flexGrow: 1, 
//           width: '100%',
//           maxWidth: '100%',
//           overflow: 'hidden',
//           bgcolor: '#f7fafc',
//           minHeight: '100vh',
//           transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//           boxSizing: 'border-box',
//           pt: '64px'
//         }}
//       >
//         <Box 
//           sx={{ 
//             // px: 3, 
//             // py: 3,
//             width: '100%',
//             maxWidth: '100%',
//             boxSizing: 'border-box',
//             // overflowX: 'hidden'
//           }}
//         >
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={location.pathname}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3 }}
//             >
//               <Outlet />
//             </motion.div>
//           </AnimatePresence>
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
  useTheme,
  Button,
  Backdrop
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import LandscapeIcon from '@mui/icons-material/Landscape'
import HomeIcon from '@mui/icons-material/Home'
import PaymentIcon from '@mui/icons-material/Payment'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import LoginIcon from '@mui/icons-material/Login'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const drawerWidthExpanded = 260

const Layout = ({ publicView = false }) => {
  const [anchorElUser, setAnchorElUser] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget)
  const handleCloseUserMenu = () => setAnchorElUser(null)
  const handleLogout = () => {
    logout()
    navigate('/login')
    handleCloseUserMenu()
  }

  const privateMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['superadmin', 'admin', 'user'] },
    { text: 'Properties', icon: <HomeWorkIcon />, path: '/properties', roles: ['superadmin', 'admin'] },
    { text: 'Lot Inventory', icon: <LandscapeIcon />, path: '/lots', roles: ['superadmin', 'admin'] },
    { text: 'Models', icon: <HomeIcon />, path: '/models', roles: ['superadmin', 'admin'] },
    { text: 'Payloads', icon: <PaymentIcon />, path: '/payloads', roles: ['superadmin', 'admin'] },
    { text: 'Residents', icon: <PeopleIcon />, path: '/residents', roles: ['superadmin', 'admin'] },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics', roles: ['superadmin', 'admin'] },
    { text: 'My Property', icon: <HomeIcon />, path: '/my-property', roles: ['superadmin', 'admin', 'user'] },
    { text: 'Amenities', icon: <HomeWorkIcon />, path: '/amenities', roles: ['superadmin', 'admin', 'user'] }
  ]

  const publicMenuItems = [
    { text: 'Get Your Quote', icon: <HomeWorkIcon />, path: '/explore/properties' },
    { text: 'Explore Amenities', icon: <HomeIcon />, path: '/explore/amenities' }
  ]

  const menuItems = publicView ? publicMenuItems : privateMenuItems.filter(item => item.roles.includes(user?.role))

  const handleNavigate = (path) => {
    navigate(path)
    setExpanded(false) // Cierra el sidebar al navegar
  }

  const drawer = (
    <Box 
      sx={{ 
        height: '100%',
        width: drawerWidthExpanded,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRight: '1px solid rgba(255,255,255,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)'
      }}
    >
      {/* Logo */}
      <Box sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
        <Box
          component="img"
          src="/images/logos/Logo_LakewoodOaks-05.png"
          alt="Lakewood Oaks"
          sx={{
            width: '100%',
            maxWidth: '200px',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {menuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
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
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
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
                    transform: 'translateX(6px)',
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 45,
                    color: location.pathname === item.path ? '#4a7c59' : '#718096'
                  }}
                >
                  <Box sx={{
                    bgcolor: location.pathname === item.path ? 'rgba(74, 124, 89, 0.15)' : 'transparent',
                    borderRadius: 2,
                    p: 0.8,
                    display: 'flex'
                  }}>
                    {item.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    color: location.pathname === item.path ? '#2d3748' : '#4a5568'
                  }}
                />
              </ListItemButton>
            </motion.div>
          </ListItem>
        ))}
      </List>

      {/* Toggle Button */}
      <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <IconButton
          onClick={() => setExpanded(false)}
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
          <ChevronLeftIcon />
        </IconButton>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', position: 'relative' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: '#2d3748',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          zIndex: 1201
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setExpanded(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              src="/images/logos/Logo_LakewoodOaks-05.png"
              alt="Lakewood Oaks"
              sx={{
                width: '100%',
                maxWidth: '200px',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          </Box>

          <Box sx={{ ml: 2 }}>
            {user ? (
              <>
                <Tooltip title="Open settings">
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
                  <MenuItem 
                    onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}
                    sx={{ py: 1.5 }}
                  >
                    <Typography>Profile</Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ py: 1.5, color: '#d32f2f' }}
                  >
                    <Typography>Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  bgcolor: '#4a7c59',
                  color: '#fff',
                  '&:hover': { bgcolor: '#3a6249' }
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Backdrop con blur */}
      <Backdrop
        open={expanded}
        onClick={() => setExpanded(false)}
        sx={{
          zIndex: 1200,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          bgcolor: 'rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* Drawer sobrepuesto */}
      <Drawer
        variant="temporary"
        open={expanded}
        onClose={() => setExpanded(false)}
        ModalProps={{
          keepMounted: true,
          BackdropProps: {
            invisible: true // Usamos nuestro Backdrop custom
          }
        }}
        sx={{
          zIndex: 1201,
          '& .MuiDrawer-paper': {
            width: drawerWidthExpanded,
            boxSizing: 'border-box',
            border: 'none',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Main content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: '100%',
          minHeight: '100vh',
          bgcolor: '#f7fafc',
          pt: '64px',
          transition: 'filter 0.3s ease',
          filter: expanded ? 'blur(4px)' : 'none'
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
  )
}

export default Layout