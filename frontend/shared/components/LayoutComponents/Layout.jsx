// @shared/components/LayoutComponents/Layout.jsx
import { useState, useMemo, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box, useMediaQuery, useTheme, Backdrop } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsDrawer from "./NotificationsDrawer";
import SidebarDrawer from "./SidebarDrawer";
import { publicMenuItems as defaultPublicMenuItems, privateMenuItems as defaultPrivateMenuItems } from "../../constants/menuItems";
import AppBarBrandbook from "./AppBar";
import useNotifications from "@shared/hooks/useNotifications";
import NotificationCreatorModal from "@shared/components/Notifications/NotificationCreatorModal"; // ✅ NUEVO
import api from "../../services/api"; // ✅ NUEVO
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
  const [notificationCreatorOpen, setNotificationCreatorOpen] = useState(false); // ✅ NUEVO
  const [users, setUsers] = useState([]); // ✅ NUEVO

  const { user, logout } = useAuth();
  const {
    notifications,
    refresh,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications({ enabled: Boolean(user) && !publicView });

  const refreshNotifications = refresh || (() => {});
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'; // ✅ NUEVO

  // ✅ NUEVO: Cargar usuarios cuando se abre el modal de crear notificación
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const handleNavigate = (path) => {
    navigate(path);
    setExpanded(false);
  };

  // ✅ NUEVO: Handler para cuando se crea una notificación
  const handleNotificationCreated = (notification) => {
    console.log('✅ Notificación creada:', notification);
    refreshNotifications(); // Actualizar la lista de notificaciones
  };

  return (
    <Box sx={{ display: "flex", position: "relative" }}>
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
        }}
        logoSrc={logoSrc}
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
        onCreateNotification={() => setNotificationCreatorOpen(true)} // ✅ NUEVO
        isAdmin={isAdmin} // ✅ NUEVO
        sx={{
          bgcolor: theme.palette.background.paper,
        }}
      />

      {/* ✅ NUEVO: Modal de crear notificación */}
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
          pt: { xs: "216px", md: "260px" },
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