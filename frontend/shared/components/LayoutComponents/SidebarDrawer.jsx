import React from "react";
import { useTranslation } from 'react-i18next'
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
import { useTheme } from "@mui/material/styles";

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
  logoSrc = "/images/logos/Logo_LakewoodOaks-05.png", // logo dinámico
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

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
          bgcolor: theme.palette.cardBg, 
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: drawerWidth,
          bgcolor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: theme.shadows[2],
        }}
      >
        {/* LOGO */}
        <Box
      sx={{
        p: 3,
        textAlign: "center",
        position: "relative",
        borderBottom: `2px solid ${theme.palette.cardBorder}`,
        background: theme.palette.gradientSection, // Gradiente principal para el header del Drawer
      }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              component="img"
              src={logoSrc}
              alt="App Logo"
              sx={{
                width: "100%",
                maxWidth: "220px",
                height: "auto",
                objectFit: "contain",
                filter: theme.shadows[1],
              }}
            />
          </motion.div>
        </Box>

        {/* NAVIGATION */}
        <List sx={{ flex: 1, px: 2, py: 3, overflowY: "auto" }}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.textKey} disablePadding sx={{ mb: 1.5 }}>
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
                        ? theme.palette.action.selected
                        : "transparent",
                      border: `2px solid ${isActive ? theme.palette.secondary.light : "transparent"}`,
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
                          `linear-gradient(90deg, transparent, ${theme.palette.secondary.light}, transparent)`,
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
                            bgcolor: theme.palette.secondary.main,
                            borderRadius: "4px 0 0 4px",
                            boxShadow: `-2px 0 8px ${theme.palette.secondary.light}`,
                          }
                        : {},
                      "&:hover": {
                        bgcolor: isActive
                          ? theme.palette.action.selected
                          : theme.palette.action.hover,
                        borderColor: theme.palette.secondary.light,
                        transform: "translateX(4px)",
                        boxShadow: theme.shadows[2],
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
                            ? theme.palette.secondary.light
                            : theme.palette.action.hover,
                          border: `1px solid ${isActive ? theme.palette.secondary.main : theme.palette.divider}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease",
                          color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                        }}
                      >
                        {item.icon && React.createElement(item.icon)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={t(item.textKey)}
                      primaryTypographyProps={{
                        fontSize: "0.95rem",
                        fontWeight: isActive ? 700 : 600,
                        color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
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
            borderTop: `2px solid ${theme.palette.divider}`,
background: theme.palette.gradientSection,
          }}
        >
          <Tooltip title={t('navigation:tooltips.closeMenu')} placement="right">
            <IconButton
              onClick={onClose}
              sx={{
                bgcolor: theme.palette.action.hover,
                color: theme.palette.primary.main,
                width: 44,
                height: 44,
                border: `2px solid ${theme.palette.secondary.light}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  borderColor: theme.palette.primary.main,
                  transform: "rotate(180deg)",
                  boxShadow: theme.shadows[4],
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