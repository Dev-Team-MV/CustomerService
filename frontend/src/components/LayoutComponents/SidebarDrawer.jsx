import React from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  Badge,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

const SidebarDrawer = ({
  open,
  onClose,
  menuItems = [],
  notifications = [],
  setNotificationsOpen,
  user,
  publicView,
  setExpanded,
  drawerWidth = 280,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
    if (setExpanded) setExpanded(false);
    if (onClose) onClose();
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
        BackdropProps: {
          invisible: true,
        },
      }}
      sx={{
        zIndex: 1201,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          border: "none",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: drawerWidth,
          background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
          borderRight: "1px solid rgba(140, 165, 81, 0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "4px 0 24px rgba(51, 63, 31, 0.08)",
        }}
      >
        {/* LOGO */}
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            position: "relative",
            borderBottom: "2px solid rgba(140, 165, 81, 0.1)",
            background:
              "linear-gradient(135deg, rgba(51, 63, 31, 0.03) 0%, rgba(140, 165, 81, 0.03) 100%)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              component="img"
              src="/images/logos/Logo_LakewoodOaks-05.png"
              alt="Lakewood Oaks"
              sx={{
                width: "100%",
                maxWidth: "220px",
                height: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 2px 8px rgba(51, 63, 31, 0.15))",
              }}
            />
          </motion.div>
        </Box>

        {/* NAVIGATION */}
        <List sx={{ flex: 1, px: 2, py: 3, overflowY: "auto" }}>
          {/* Botón de notificaciones */}
          {!publicView && user && (
            <ListItem disablePadding sx={{ mb: 2.5 }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                style={{ width: "100%" }}
              >
                <ListItemButton
                  onClick={() => {
                    setNotificationsOpen(true);
                    if (setExpanded) setExpanded(false);
                    if (onClose) onClose();
                  }}
                  sx={{
                    borderRadius: 3,
                    py: 1.8,
                    bgcolor: "rgba(229, 134, 60, 0.06)",
                    border: "2px solid rgba(229, 134, 60, 0.15)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(229, 134, 60, 0.1), transparent)",
                      transition: "left 0.5s ease",
                    },
                    "&:hover": {
                      bgcolor: "rgba(229, 134, 60, 0.12)",
                      borderColor: "#E5863C",
                      transform: "translateX(4px)",
                      boxShadow: "0 4px 12px rgba(229, 134, 60, 0.15)",
                      "&::before": {
                        left: "100%",
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 48 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.5,
                        bgcolor: "rgba(229, 134, 60, 0.12)",
                        border: "1px solid rgba(229, 134, 60, 0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Badge
                        badgeContent={notifications.filter((n) => !n.read).length}
                        color="error"
                        overlap="circular"
                        sx={{
                          "& .MuiBadge-badge": {
                            top: -4,
                            right: -4,
                            minWidth: 18,
                            height: 18,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            boxShadow: "0 2px 8px rgba(211, 47, 47, 0.3)",
                          },
                        }}
                      >
                        <NotificationsIcon sx={{ fontSize: 20, color: "#E5863C" }} />
                      </Badge>
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary="Notifications"
                    primaryTypographyProps={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "#333F1F",
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: "0.3px",
                    }}
                  />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#ff5252",
                        boxShadow: "0 0 0 3px rgba(255, 82, 82, 0.2)",
                        animation: "pulse 2s infinite",
                        "@keyframes pulse": {
                          "0%, 100%": { opacity: 1, transform: "scale(1)" },
                          "50%": { opacity: 0.6, transform: "scale(1.2)" },
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </motion.div>
            </ListItem>
          )}

          {/* Items del menú */}
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1.5 }}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: (index + 1) * 0.05,
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  style={{ width: "100%" }}
                >
                  <ListItemButton
                    onClick={() => handleNavigate(item.path)}
                    selected={isActive}
                    sx={{
                      borderRadius: 3,
                      py: 1.8,
                      position: "relative",
                      bgcolor: isActive
                        ? "rgba(140, 165, 81, 0.08)"
                        : "transparent",
                      border: `2px solid ${isActive ? "rgba(140, 165, 81, 0.2)" : "transparent"}`,
                      transition: "all 0.3s ease",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(140, 165, 81, 0.08), transparent)",
                        transition: "left 0.5s ease",
                      },
                      "&::after": isActive
                        ? {
                            content: '""',
                            position: "absolute",
                            right: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 4,
                            height: "60%",
                            bgcolor: "#8CA551",
                            borderRadius: "4px 0 0 4px",
                            boxShadow: "-2px 0 8px rgba(140, 165, 81, 0.3)",
                          }
                        : {},
                      "&:hover": {
                        bgcolor: isActive
                          ? "rgba(140, 165, 81, 0.12)"
                          : "rgba(140, 165, 81, 0.06)",
                        borderColor: "rgba(140, 165, 81, 0.25)",
                        transform: "translateX(4px)",
                        boxShadow: "0 4px 12px rgba(140, 165, 81, 0.12)",
                        "&::before": {
                          left: "100%",
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2.5,
                          bgcolor: isActive
                            ? "rgba(140, 165, 81, 0.15)"
                            : "rgba(112, 111, 111, 0.05)",
                          border: `1px solid ${isActive ? "rgba(140, 165, 81, 0.3)" : "rgba(112, 111, 111, 0.1)"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease",
                          color: isActive ? "#333F1F" : "#706f6f",
                        }}
                      >
                        {item.icon && React.createElement(item.icon)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: "0.95rem",
                        fontWeight: isActive ? 700 : 600,
                        color: isActive ? "#333F1F" : "#706f6f",
                        fontFamily: '"Poppins", sans-serif',
                        letterSpacing: "0.3px",
                      }}
                    />
                  </ListItemButton>
                </motion.div>
              </ListItem>
            );
          })}
        </List>

        {/* TOGGLE BUTTON */}
        <Box
          sx={{
            p: 2.5,
            textAlign: "center",
            borderTop: "2px solid rgba(140, 165, 81, 0.1)",
            background:
              "linear-gradient(180deg, rgba(140, 165, 81, 0.03) 0%, transparent 100%)",
          }}
        >
          <Tooltip title="Close menu" placement="right">
            <IconButton
              onClick={onClose}
              sx={{
                bgcolor: "rgba(51, 63, 31, 0.08)",
                color: "#333F1F",
                width: 44,
                height: 44,
                border: "2px solid rgba(140, 165, 81, 0.2)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "#333F1F",
                  color: "white",
                  borderColor: "#333F1F",
                  transform: "rotate(180deg)",
                  boxShadow: "0 4px 12px rgba(51, 63, 31, 0.25)",
                },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SidebarDrawer;