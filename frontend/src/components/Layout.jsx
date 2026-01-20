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
//   Button,
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
// import PersonIcon from '@mui/icons-material/Person'
// import HomeWorkIcon from '@mui/icons-material/HomeWork'
// import LandscapeIcon from '@mui/icons-material/Landscape'
// import HomeIcon from '@mui/icons-material/Home'
// import PaymentIcon from '@mui/icons-material/Payment'
// import PeopleIcon from '@mui/icons-material/People'
// import BarChartIcon from '@mui/icons-material/BarChart'
// import { useAuth } from '../context/AuthContext'

// const drawerWidth = 240

// const Layout = () => {
//   const [anchorElUser, setAnchorElUser] = useState(null)
//   const [mobileOpen, setMobileOpen] = useState(false)
//   const { user, logout } = useAuth()
//   const navigate = useNavigate()
//   const location = useLocation()

//   const handleOpenUserMenu = (event) => {
//     setAnchorElUser(event.currentTarget)
//   }

//   const handleCloseUserMenu = () => {
//     setAnchorElUser(null)
//   }

//   const handleDrawerToggle = () => {
//     setMobileOpen(!mobileOpen)
//   }

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
//   ]
  
//   const filteredMenuItems = menuItems.filter(item => 
//     item.roles.includes(user?.role)
//   )

//   // Get dynamic page title based on current route
//   const getPageTitle = () => {
//     const path = location.pathname
    
//     // Special routes
//     if (path === '/property-selection' || path === '/properties/select') {
//       return 'Get Your Quote'
//     }
    
//     // Find matching menu item
//     const currentMenuItem = menuItems.find(item => path.startsWith(item.path))
    
//     if (currentMenuItem) {
//       return currentMenuItem.text
//     }
    
//     // Default fallback
//     return `Welcome, ${user?.firstName || 'User'}`
//   }

//   const drawer = (
//     <div>
//       <Toolbar>
//         <Typography variant="h6" noWrap component="div" className="font-bold">
//           Lakewood Oaks
//         </Typography>
//       </Toolbar>
//       <Divider />
//       <List>
//         {filteredMenuItems.map((item) => (
//           <ListItem key={item.text} disablePadding>
//             <ListItemButton 
//               onClick={() => navigate(item.path)}
//               selected={location.pathname === item.path}
//               sx={{
//                 '&.Mui-selected': {
//                   bgcolor: 'rgba(74, 124, 89, 0.08)',
//                   '&:hover': {
//                     bgcolor: 'rgba(74, 124, 89, 0.12)',
//                   }
//                 }
//               }}
//             >
//               <ListItemIcon 
//                 sx={{ 
//                   color: location.pathname === item.path ? '#4a7c59' : 'inherit' 
//                 }}
//               >
//                 {item.icon}
//               </ListItemIcon>
//               <ListItemText 
//                 primary={item.text}
//                 sx={{
//                   '& .MuiTypography-root': {
//                     fontWeight: location.pathname === item.path ? 600 : 400
//                   }
//                 }}
//               />
//             </ListItemButton>
//           </ListItem>
//         ))}
//       </List>
//     </div>
//   )

//   return (
//     <Box sx={{ display: 'flex' }}>
//       <AppBar
//         position="fixed"
//         sx={{
//           width: { sm: `calc(100% - ${drawerWidth}px)` },
//           ml: { sm: `${drawerWidth}px` },
//         }}
//       >
//         <Toolbar>
//           <IconButton
//             color="inherit"
//             aria-label="open drawer"
//             edge="start"
//             onClick={handleDrawerToggle}
//             sx={{ mr: 2, display: { sm: 'none' } }}
//           >
//             <MenuIcon />
//           </IconButton>
//           <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
//             {getPageTitle()}
//           </Typography>
//           <Box sx={{ flexGrow: 0 }}>
//             <Tooltip title="Open settings">
//               <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
//                 <Avatar alt={user?.firstName} src="/static/images/avatar/2.jpg">
//                   {user?.firstName?.charAt(0).toUpperCase()}
//                 </Avatar>
//               </IconButton>
//             </Tooltip>
//             <Menu
//               sx={{ mt: '45px' }}
//               id="menu-appbar"
//               anchorEl={anchorElUser}
//               anchorOrigin={{
//                 vertical: 'top',
//                 horizontal: 'right',
//               }}
//               keepMounted
//               transformOrigin={{
//                 vertical: 'top',
//                 horizontal: 'right',
//               }}
//               open={Boolean(anchorElUser)}
//               onClose={handleCloseUserMenu}
//             >
//               <MenuItem onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}>
//                 <Typography textAlign="center">Profile</Typography>
//               </MenuItem>
//               <MenuItem onClick={handleLogout}>
//                 <Typography textAlign="center">Logout</Typography>
//               </MenuItem>
//             </Menu>
//           </Box>
//         </Toolbar>
//       </AppBar>
//       <Box
//         component="nav"
//         sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
//       >
//         <Drawer
//           variant="temporary"
//           open={mobileOpen}
//           onClose={handleDrawerToggle}
//           ModalProps={{
//             keepMounted: true,
//           }}
//           sx={{
//             display: { xs: 'block', sm: 'none' },
//             '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
//           }}
//         >
//           {drawer}
//         </Drawer>
//         <Drawer
//           variant="permanent"
//           sx={{
//             display: { xs: 'none', sm: 'block' },
//             '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
//           }}
//           open
//         >
//           {drawer}
//         </Drawer>
//       </Box>
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           p: 3,
//           width: '100%',
//         }}
//       >
//         <Toolbar />
//         <Container maxWidth="lg">
//           <Outlet />
//         </Container>
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
  Container,
  Avatar,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
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

const drawerWidthCollapsed = 90
const drawerWidthExpanded = 260

const Layout = () => {
  const [anchorElUser, setAnchorElUser] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget)
  const handleCloseUserMenu = () => setAnchorElUser(null)
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
  
  const handleLogout = () => {
    logout()
    navigate('/login')
    handleCloseUserMenu()
  }

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['superadmin', 'admin', 'user'] },
    { text: 'Properties', icon: <HomeWorkIcon />, path: '/properties', roles: ['superadmin', 'admin'] },
    { text: 'Lot Inventory', icon: <LandscapeIcon />, path: '/lots', roles: ['superadmin', 'admin'] },
    { text: 'Models', icon: <HomeIcon />, path: '/models', roles: ['superadmin', 'admin'] },
    { text: 'Payloads', icon: <PaymentIcon />, path: '/payloads', roles: ['superadmin', 'admin'] },
    { text: 'Residents', icon: <PeopleIcon />, path: '/residents', roles: ['superadmin', 'admin'] },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics', roles: ['superadmin', 'admin'] },
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
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
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
      {/* Logo */}
      <Box sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
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
          transform: expanded ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
        {expanded && (
          <Box sx={{
            mt: 2,
            opacity: expanded ? 1 : 0,
            transform: expanded ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
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
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {filteredMenuItems.map((item, index) => (
          <Tooltip 
            key={item.text} 
            title={!expanded ? item.text : ''} 
            placement="right"
            arrow
          >
            <ListItem 
              disablePadding 
              sx={{ 
                mb: 1,
                opacity: 0,
                animation: `slideIn 0.3s ease forwards ${index * 0.05}s`,
                '@keyframes slideIn': {
                  from: { opacity: 0, transform: 'translateX(-20px)' },
                  to: { opacity: 1, transform: 'translateX(0)' }
                }
              }}
            >
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  justifyContent: expanded ? 'flex-start' : 'center',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(74, 124, 89, 0.12)',
                    '&::after': {
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
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(74, 124, 89, 0.08)',
                    transform: expanded ? 'translateX(6px)' : 'scale(1.1)',
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
                  <Box sx={{
                    bgcolor: location.pathname === item.path ? 'rgba(74, 124, 89, 0.15)' : 'transparent',
                    borderRadius: 2,
                    p: 0.8,
                    display: 'flex',
                    transition: 'background-color 0.3s ease'
                  }}>
                    {item.icon}
                  </Box>
                </ListItemIcon>
                {expanded && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: location.pathname === item.path ? 600 : 500,
                      color: location.pathname === item.path ? '#2d3748' : '#4a5568'
                    }}
                    sx={{
                      opacity: expanded ? 1 : 0,
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>

      {/* Toggle Button */}
      <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <IconButton
          onClick={() => setExpanded(!expanded)}
          sx={{
            bgcolor: 'rgba(74, 124, 89, 0.1)',
            color: '#4a7c59',
            width: 36,
            height: 36,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'rgba(74, 124, 89, 0.2)',
              transform: 'scale(1.1)'
            }
          }}
        >
          {expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      {/* User Avatar */}
      <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <Avatar 
          onClick={handleOpenUserMenu}
          sx={{ 
            width: expanded ? 48 : 42,
            height: expanded ? 48 : 42,
            margin: '0 auto',
            bgcolor: '#4a7c59',
            border: '3px solid rgba(74, 124, 89, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            fontWeight: 700,
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 4px 16px rgba(74, 124, 89, 0.3)'
            }
          }}
        >
          {user?.firstName?.charAt(0).toUpperCase()}
        </Avatar>
        {expanded && (
          <Box sx={{
            mt: 1.5,
            opacity: expanded ? 1 : 0,
            transform: expanded ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
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
        )}
      </Box>
    </Box>
  )

  const drawerWidth = expanded ? drawerWidthExpanded : drawerWidthCollapsed

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: '#2d3748',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
            {getPageTitle()}
          </Typography>
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
          </Menu>
        </Toolbar>
      </AppBar>

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

      
            <Box 
              component="main" 
              sx={{ 
                flexGrow: 1, 
                p: 3, 
                width: '100%', 
                bgcolor: '#f7fafc',
                minHeight: '100vh',
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Toolbar />
              <Container maxWidth={false} disableGutters sx={{ px: 3 }}>
                <Outlet />
              </Container>
            </Box>
      
    </Box>
  )
}

export default Layout