import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Box, useMediaQuery, useTheme, Backdrop } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsDrawer from "./NotificationsDrawer";
import SidebarDrawer from "./SidebarDrawer";
import { publicMenuItems, privateMenuItems } from "../../constants/menuItems";
import AppBarBrandbook from "./AppBar";
const drawerWidthExpanded = 280;

const Layout = ({ publicView = false }) => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Payment received",
      description: "Your payment has been processed.",
      read: false,
    },
    {
      id: 2,
      title: "New message",
      description: "You have a new message from admin.",
      read: false,
    },
    {
      id: 3,
      title: "Document approved",
      description: "Your document was approved.",
      read: true,
    },
  ]);

  const { user, logout } = useAuth();
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

  const menuItems = publicView
    ? publicMenuItems
    : privateMenuItems.filter((item) => item.roles.includes(user?.role));

  const handleNavigate = (path) => {
    navigate(path);
    setExpanded(false);
  };

  return (
    <Box sx={{ display: "flex", position: "relative" }}>
      {/* ✅ APPBAR - BRANDBOOK */}
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
      />

      {/* ✅ BACKDROP - Mejorado */}
      <Backdrop
        open={expanded}
        onClick={() => setExpanded(false)}
        sx={{
          zIndex: 1200,
          backdropFilter: "blur(12px) saturate(180%)",
          WebkitBackdropFilter: "blur(12px) saturate(180%)",
          bgcolor: "rgba(51, 63, 31, 0.25)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      {/* SIDEBAR DRAWER REUTILIZABLE */}
      <SidebarDrawer
        open={expanded}
        onClose={() => setExpanded(false)}
        menuItems={menuItems}
        notifications={notifications}
        setNotificationsOpen={setNotificationsOpen}
        user={user}
        drawerWidth={drawerWidthExpanded}
      />

      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        setNotifications={setNotifications}
      />

      {/* ✅ MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          minHeight: "100vh",
          bgcolor: "#f7fafc",
          pt: "64px",
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
