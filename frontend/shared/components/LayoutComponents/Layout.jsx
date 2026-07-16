// // /Users/oficina/MV-CRM/CustomerService/frontend/shared/components/LayoutComponents/Layout.jsx
// import { useState, useMemo, useEffect } from "react";
// import { Outlet, useNavigate, useLocation } from "react-router-dom";
// import { Box, useMediaQuery, useTheme, Backdrop, CircularProgress } from "@mui/material";
// import { useAuth } from "../../context/AuthContext";
// import useProjectBranding from "../../hooks/useProjectBranding"; // ✅ Importar hook directamente
// import { motion, AnimatePresence } from "framer-motion";
// import NotificationsDrawer from "./NotificationsDrawer";
// import SidebarDrawer from "./SidebarDrawer";
// import { publicMenuItems as defaultPublicMenuItems, privateMenuItems as defaultPrivateMenuItems } from "../../constants/menuItems";
// import AppBarBrandbook from "./AppBar";
// import useNotifications from "@shared/hooks/useNotifications";
// import NotificationCreatorModal from "@shared/components/Notifications/NotificationCreatorModal";
// import api from "../../services/api";

// const drawerWidthExpanded = 280;

// const Layout = ({
//   publicView = false,
//   menuItems: customMenuItems,
//   publicMenuItems: customPublicMenuItems,
//   logoSrc,
//   ...props
// }) => {
//   const [anchorElUser, setAnchorElUser] = useState(null);
//   const [expanded, setExpanded] = useState(false);
//   const [notificationsOpen, setNotificationsOpen] = useState(false);
//   const [notificationCreatorOpen, setNotificationCreatorOpen] = useState(false);
//   const [users, setUsers] = useState([]);

//   const { user, logout, projectSlug } = useAuth(); // ✅ Obtener projectSlug directamente
//   const branding = useProjectBranding(projectSlug); // ✅ Usar hook directamente
  
//   const {
//     notifications,
//     refresh,
//     markNotificationAsRead,
//     markAllNotificationsAsRead,
//   } = useNotifications({ enabled: Boolean(user) && !publicView });

//   const refreshNotifications = refresh || (() => {});
//   const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

//   // ✅ Usar logo del branding si no se proporciona logoSrc
//   const effectiveLogoSrc = logoSrc || branding.logo

//   useEffect(() => {
//     if (notificationCreatorOpen && isAdmin && users.length === 0) {
//       api.get('/users')
//         .then(res => setUsers(res.data || []))
//         .catch(err => console.error('Error loading users:', err));
//     }
//   }, [notificationCreatorOpen, isAdmin, users.length]);

//   useEffect(() => {
//     if (notificationsOpen && user && !publicView) {
//       refreshNotifications();
//     }
//   }, [notificationsOpen, user, publicView, refreshNotifications]);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const theme = useTheme();

//   const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
//   const handleCloseUserMenu = () => setAnchorElUser(null);
//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//     handleCloseUserMenu();
//   };

//   const menuItems = useMemo(() => {
//     if (publicView) {
//       return customPublicMenuItems || customMenuItems || defaultPublicMenuItems;
//     }
//     if (customMenuItems) {
//       return customMenuItems.filter((item) => item.roles.includes(user?.role));
//     }
//     return defaultPrivateMenuItems.filter((item) => item.roles.includes(user?.role));
//   }, [customMenuItems, customPublicMenuItems, publicView, user?.role]);

//   const handleNotificationCreated = (notification) => {
//     refreshNotifications();
//   };

//   // ✅ Mostrar loading mientras se cargan los datos de branding (solo si hay projectSlug)
//   if (branding.loading && projectSlug) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ display: "flex", position: "relative" }}>
//       <AppBarBrandbook
//         publicView={publicView}
//         user={user}
//         notifications={notifications}
//         onMenuClick={() => setExpanded(true)}
//         onLogoClick={() => navigate(publicView ? "/" : "/dashboard")}
//         onNotificationsClick={() => setNotificationsOpen(true)}
//         onLoginClick={() => navigate("/login")}
//         onProfileClick={() => {
//           navigate("/profile");
//           handleCloseUserMenu();
//         }}
//         onLogoutClick={handleLogout}
//         anchorElUser={anchorElUser}
//         onOpenUserMenu={handleOpenUserMenu}
//         onCloseUserMenu={handleCloseUserMenu}
//         sx={{
//           bgcolor: theme.palette.primary.main,
//           color: theme.palette.primary.contrastText,
//         }}
//         logoSrc={effectiveLogoSrc}
//       />

//       <Backdrop
//         open={expanded}
//         onClick={() => setExpanded(false)}
//         sx={{
//           zIndex: 1200,
//           backdropFilter: "blur(12px) saturate(180%)",
//           WebkitBackdropFilter: "blur(12px) saturate(180%)",
//           bgcolor: theme.palette.action.disabledBackground,
//           transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
//         }}
//       />

//       <SidebarDrawer
//         open={expanded}
//         onClose={() => setExpanded(false)}
//         menuItems={menuItems}
//         notifications={notifications}
//         setNotificationsOpen={setNotificationsOpen}
//         user={user}
//         drawerWidth={drawerWidthExpanded}
//         sx={{
//           bgcolor: theme.palette.background.paper,
//           color: theme.palette.text.primary,
//         }}
//       />

//       <NotificationsDrawer
//         open={notificationsOpen}
//         onClose={() => setNotificationsOpen(false)}
//         notifications={notifications}
//         onMarkAsRead={markNotificationAsRead}
//         onMarkAllAsRead={markAllNotificationsAsRead}
//         onCreateNotification={() => setNotificationCreatorOpen(true)}
//         isAdmin={isAdmin}
//         sx={{
//           bgcolor: theme.palette.background.paper,
//         }}
//       />

//       {isAdmin && (
//         <NotificationCreatorModal
//           open={notificationCreatorOpen}
//           onClose={() => setNotificationCreatorOpen(false)}
//           users={users}
//           defaultMode="general"
//           onCreated={handleNotificationCreated}
//         />
//       )}

//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           width: "100%",
//           minHeight: "100vh",
//           bgcolor: theme.palette.background.default,
//           pt: { xs: "216px", md: "260px" },
//         }}
//       >
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={location.pathname}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             transition={{ duration: 0.3 }}
//           >
//             <Outlet />
//           </motion.div>
//         </AnimatePresence>
//       </Box>
//     </Box>
//   );
// };

// export default Layout;

// /Users/oficina/MV-CRM/CustomerService/frontend/shared/components/LayoutComponents/Layout.jsx

import { useState, useMemo, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box, useTheme, Backdrop, CircularProgress } from "@mui/material";

// ✅ 1. Importar useImpersonation junto con useAuth
import { useAuth, useImpersonation } from "../../context/AuthContext";
import useProjectBranding from "../../hooks/useProjectBranding";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsDrawer from "./NotificationsDrawer";
import SidebarDrawer from "./SidebarDrawer";
import { 
  publicMenuItems as defaultPublicMenuItems, 
  privateMenuItems as defaultPrivateMenuItems 
} from "../../constants/menuItems";
import AppBarBrandbook from "./AppBar";
import useNotifications from "@shared/hooks/useNotifications";
import NotificationCreatorModal from "@shared/components/Notifications/NotificationCreatorModal";
import api from "../../services/api";

// ✅ 2. Importar el Banner de Impersonación
import ImpersonationBanner from "@shared/components/ImpersonationBanner";

const drawerWidthExpanded = 280;

const Layout = ({
  publicView = false,
  menuItems: customMenuItems,
  publicMenuItems: customPublicMenuItems,
  logoSrc,
  ...props
}) => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationCreatorOpen, setNotificationCreatorOpen] = useState(false);
  const [users, setUsers] = useState([]);

  const { user, logout, projectSlug } = useAuth();
  
  // ✅ 3. Obtener el estado de impersonación (esto faltaba)
  const { isImpersonating } = useImpersonation();
  
  const branding = useProjectBranding(projectSlug);
  
  const {
    notifications,
    refresh,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications({ enabled: Boolean(user) && !publicView });

  const refreshNotifications = refresh || (() => {});
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const effectiveLogoSrc = logoSrc || branding.logo;

  useEffect(() => {
    if (notificationCreatorOpen && isAdmin && users.length === 0) {
      api.get('/users')
        .then(res => setUsers(res.data || []))
        .catch(err => console.error('Error loading users:', err));
    }
  }, [notificationCreatorOpen, isAdmin, users.length]);

  useEffect(() => {
    if (notificationsOpen && user && !publicView) {
      refreshNotifications();
    }
  }, [notificationsOpen, user, publicView, refreshNotifications]);

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleLogout = () => {
    logout();
    navigate("/login");
    handleCloseUserMenu();
  };

  const menuItems = useMemo(() => {
    if (publicView) {
      return customPublicMenuItems || customMenuItems || defaultPublicMenuItems;
    }
    if (customMenuItems) {
      return customMenuItems.filter((item) => item.roles.includes(user?.role));
    }
    return defaultPrivateMenuItems.filter((item) => item.roles.includes(user?.role));
  }, [customMenuItems, customPublicMenuItems, publicView, user?.role]);

  const handleNotificationCreated = (notification) => {
    refreshNotifications();
  };

  // Mostrar loading mientras se cargan los datos de branding
  if (branding.loading && projectSlug) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", position: "relative", minHeight: "100vh" }}>
      
      {/* ✅ 4. Renderizar el Banner aquí (fuera del AppBar) */}
      <ImpersonationBanner />

      <AppBarBrandbook
        publicView={publicView}
        user={user}
        notifications={notifications}
        onMenuClick={() => setExpanded(true)}
        onLogoClick={() => navigate(publicView ? "/" : "/dashboard")}
        onNotificationsClick={() => setNotificationsOpen(true)}
        onLoginClick={() => navigate("/login")}
        onProfileClick={() => {
          navigate("/profile");
          handleCloseUserMenu();
        }}
        onLogoutClick={handleLogout}
        anchorElUser={anchorElUser}
        onOpenUserMenu={handleOpenUserMenu}
        onCloseUserMenu={handleCloseUserMenu}
        sx={{
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          // ✅ 5. Empujar el AppBar hacia abajo 48px si hay impersonación
          top: isImpersonating ? "48px" : 0,
          zIndex: 1200
        }}
        logoSrc={effectiveLogoSrc}
      />

      <Backdrop
        open={expanded}
        onClick={() => setExpanded(false)}
        sx={{
          zIndex: 1200,
          backdropFilter: "blur(12px) saturate(180%)",
          WebkitBackdropFilter: "blur(12px) saturate(180%)",
          bgcolor: theme.palette.action.disabledBackground,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      <SidebarDrawer
        open={expanded}
        onClose={() => setExpanded(false)}
        menuItems={menuItems}
        notifications={notifications}
        setNotificationsOpen={setNotificationsOpen}
        user={user}
        drawerWidth={drawerWidthExpanded}
        sx={{
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      />

      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
        onCreateNotification={() => setNotificationCreatorOpen(true)}
        isAdmin={isAdmin}
        sx={{
          bgcolor: theme.palette.background.paper,
        }}
      />

      {isAdmin && (
        <NotificationCreatorModal
          open={notificationCreatorOpen}
          onClose={() => setNotificationCreatorOpen(false)}
          users={users}
          defaultMode="general"
          onCreated={handleNotificationCreated}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          minHeight: "100vh",
          bgcolor: theme.palette.background.default,
          // ✅ 6. Ajustar el padding-top del contenido principal
          pt: { 
            xs: isImpersonating ? "264px" : "216px", 
            md: isImpersonating ? "308px" : "260px" 
          },
          transition: "padding-top 0.3s ease"
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
  );
};

export default Layout;