import React from "react"
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import NotificationsIcon from "@mui/icons-material/Notifications"
import PaymentIcon from "@mui/icons-material/Payment"
import ChatIcon from "@mui/icons-material/Chat"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"

const NotificationsDrawer = ({
  open,
  onClose,
  notifications,
  setNotifications,
  width = { xs: "100%", sm: 400 },
}) => {
  const { t } = useTranslation('navigation')

  return (
  <Drawer
    anchor="right"
    variant="temporary"
    open={open}
    onClose={onClose}
    ModalProps={{
      keepMounted: true,
      BackdropProps: {
        sx: {
          bgcolor: "rgba(51, 63, 31, 0.25)",
          backdropFilter: "blur(8px)",
        },
      },
    }}
    sx={{
      zIndex: 1202,
      "& .MuiDrawer-paper": {
        width,
        boxSizing: "border-box",
        border: "none",
      },
    }}
  >
    <Box
      sx={{
        height: "100%",
        bgcolor: "#fafafa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)",
          color: "white",
          boxShadow: "0 4px 12px rgba(51, 63, 31, 0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            bgcolor: "rgba(140, 165, 81, 0.15)",
            borderRadius: "50%",
            filter: "blur(40px)",
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <NotificationsIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  letterSpacing: "0.5px",
                }}
              >
                {t('notifications.title')}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.9,
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {t('unread', { count: notifications.filter((n) => !n.read).length })}
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.25)",
                transform: "rotate(90deg)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Box>
      </Box>

      {/* NOTIFICATIONS LIST */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
        {notifications.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 3,
                bgcolor: "rgba(112, 111, 111, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NotificationsIcon
                sx={{ fontSize: 48, color: "#706f6f", opacity: 0.4 }}
              />
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: "#706f6f",
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 500,
              }}
            >
              {t('noNotifications')}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#9e9e9e",
                fontFamily: '"Poppins", sans-serif',
                textAlign: "center",
                maxWidth: 240,
              }}
            >
              {t('noNotificationsDesc')}
            </Typography>
          </Box>
        ) : (
          notifications.map((n, index) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Box
                sx={{
                  mb: 2,
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: n.read ? "white" : "rgba(140, 165, 81, 0.06)",
                  border: n.read
                    ? "1px solid #e0e0e0"
                    : "2px solid rgba(140, 165, 81, 0.2)",
                  boxShadow: n.read
                    ? "0 2px 8px rgba(0,0,0,0.04)"
                    : "0 4px 12px rgba(140, 165, 81, 0.12)",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: n.read
                      ? "0 4px 16px rgba(0,0,0,0.08)"
                      : "0 6px 20px rgba(140, 165, 81, 0.18)",
                    transform: "translateX(-4px)",
                    borderColor: n.read ? "#706f6f" : "#8CA551",
                  },
                }}
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((notif) =>
                      notif.id === n.id ? { ...notif, read: true } : notif,
                    ),
                  );
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: n.read
                        ? "rgba(112, 111, 111, 0.08)"
                        : "rgba(140, 165, 81, 0.15)",
                      border: `1px solid ${n.read ? "rgba(112, 111, 111, 0.2)" : "rgba(140, 165, 81, 0.3)"}`,
                      flexShrink: 0,
                      transition: "all 0.3s",
                    }}
                  >
                    {n.title.includes("Payment") && (
                      <PaymentIcon
                        sx={{
                          color: n.read ? "#706f6f" : "#333F1F",
                          fontSize: 22,
                        }}
                      />
                    )}
                    {n.title.includes("message") && (
                      <ChatIcon
                        sx={{
                          color: n.read ? "#706f6f" : "#8CA551",
                          fontSize: 22,
                        }}
                      />
                    )}
                    {n.title.includes("Document") && (
                      <CheckCircleIcon
                        sx={{
                          color: n.read ? "#706f6f" : "#8CA551",
                          fontSize: 22,
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={n.read ? 600 : 700}
                      sx={{
                        color: n.read ? "#706f6f" : "#333F1F",
                        mb: 0.5,
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: "0.9rem",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {n.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#9e9e9e",
                        display: "block",
                        mb: 1,
                        fontFamily: '"Poppins", sans-serif',
                        lineHeight: 1.5,
                      }}
                    >
                      {n.description}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: "50%",
                          bgcolor: "#9e9e9e",
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#9e9e9e",
                          fontSize: "0.7rem",
                          fontFamily: '"Poppins", sans-serif',
                        }}
                      >
                        {t('hoursAgo', { count: 2 })}
                      </Typography>
                    </Box>
                  </Box>

                  {!n.read && (
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: "#8CA551",
                        flexShrink: 0,
                        mt: 0.5,
                        boxShadow: "0 0 0 3px rgba(140, 165, 81, 0.2)",
                        animation: "pulse 2s infinite",
                        "@keyframes pulse": {
                          "0%, 100%": {
                            opacity: 1,
                            transform: "scale(1)",
                          },
                          "50%": {
                            opacity: 0.6,
                            transform: "scale(1.1)",
                          },
                        },
                      }}
                    />
                  )}
                </Box>
              </Box>
            </motion.div>
          ))
        )}
      </Box>

      {/* FOOTER */}
      {notifications.length > 0 && (
        <Box
          sx={{
            p: 2.5,
            borderTop: "1px solid #e0e0e0",
            bgcolor: "white",
            boxShadow: "0 -4px 12px rgba(0,0,0,0.04)",
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            size="medium"
            onClick={() => {
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true })),
              );
            }}
            sx={{
              borderRadius: 3,
              border: "2px solid #333F1F",
              color: "#333F1F",
              fontWeight: 600,
              py: 1.2,
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: "0.5px",
              textTransform: "none",
              fontSize: "0.9rem",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                bgcolor: "#333F1F",
                transition: "left 0.4s ease",
                zIndex: 0,
              },
              "&:hover": {
                borderColor: "#333F1F",
                bgcolor: "transparent",
                "&::before": {
                  left: 0,
                },
                "& span": {
                  color: "white",
                },
              },
              "& span": {
                position: "relative",
                zIndex: 1,
                transition: "color 0.3s ease",
              },
            }}
          >
            <span>{t('markAllAsRead')}</span>
          </Button>
        </Box>
      )}
    </Box>
  </Drawer>
  )
}

export default NotificationsDrawer