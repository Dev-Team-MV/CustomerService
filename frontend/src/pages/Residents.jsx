import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Avatar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Tooltip,
  Container,
  Card,
  CardContent,
  CircularProgress
} from "@mui/material";
import { 
  Add, 
  Edit, 
  Delete, 
  PersonAdd,
  People,
  AdminPanelSettings,
  VerifiedUser,
  Home
} from "@mui/icons-material";
import { motion, AnimatePresence } from 'framer-motion';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Alert } from "@mui/material";
import api from "../services/api";

const Residents = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    birthday: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: "",
        phoneNumber: user.phoneNumber || "",
        birthday: user.birthday
          ? new Date(user.birthday).toISOString().split("T")[0]
          : "",
        role: user.role,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phoneNumber: "",
        birthday: "",
        role: "user",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...formData };

      if (selectedUser) {
        if (!payload.password) {
          delete payload.password;
        }
        await api.put(`/users/${selectedUser._id}`, payload);
      } else {
        await api.post("/auth/register", {
          ...payload,
          phoneNumber: `+${payload.phoneNumber}`,
          skipPasswordSetup: true
        });
      }

      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert(error.response?.data?.message || "Error saving user");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert(error.response?.data?.message || "Error deleting user");
      }
    }
  };

  // Calcular estadísticas
  const stats = {
    total: users.length,
    superadmins: users.filter(u => u.role === 'superadmin').length,
    admins: users.filter(u => u.role === 'admin').length,
    residents: users.filter(u => u.role === 'user').length
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin':
        return { bg: 'rgba(229, 134, 60, 0.12)', color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)' }
      case 'admin':
        return { bg: 'rgba(51, 63, 31, 0.12)', color: '#333F1F', border: 'rgba(51, 63, 31, 0.3)' }
      case 'user':
        return { bg: 'rgba(140, 165, 81, 0.12)', color: '#8CA551', border: 'rgba(140, 165, 81, 0.3)' }
      default:
        return { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)' }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              mb: 4,
              borderRadius: 4,
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #333F1F, #8CA551, #333F1F)'
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 56, md: 64 },
                      height: { xs: 56, md: 64 },
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(51, 63, 31, 0.3)'
                    }}
                  >
                    <People sx={{ fontSize: { xs: 28, md: 32 }, color: 'white' }} />
                  </Box>
                </motion.div>

                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: '#333F1F',
                      fontFamily: '"Poppins", sans-serif',
                      letterSpacing: '0.5px',
                      fontSize: { xs: '1.75rem', md: '2.125rem' }
                    }}
                  >
                    Residents
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }}
                  >
                    Manage resident accounts and information
                  </Typography>
                </Box>
              </Box>

              <Tooltip title="Add User" placement="left">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    onClick={() => handleOpenDialog()}
                    startIcon={<Add />}
                    sx={{
                      borderRadius: 3,
                      bgcolor: '#333F1F',
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'none',
                      letterSpacing: '1px',
                      fontFamily: '"Poppins", sans-serif',
                      px: 3,
                      py: 1.5,
                      boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        bgcolor: '#8CA551',
                        transition: 'left 0.4s ease',
                        zIndex: 0
                      },
                      '&:hover': {
                        bgcolor: '#333F1F',
                        boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                        color: 'white',
                        '&::before': {
                          left: 0
                        },
                        '& .MuiButton-startIcon': {
                          color: 'white'
                        }
                      },
                      '& .MuiButton-startIcon': {
                        position: 'relative',
                        zIndex: 1,
                        color: 'white',
                        transition: 'color 0.3s ease'
                      }
                    }}
                  >
                    <Box component="span" sx={{ position: 'relative', zIndex: 1, color: 'white' }}>
                      Add User
                    </Box>
                  </Button>
                </motion.div>
              </Tooltip>
            </Box>
          </Paper>
        </motion.div>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          {[
            {
              title: 'Total Users',
              value: stats.total,
              icon: People,
              gradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
              delay: 0
            },
            {
              title: 'Super Admins',
              value: stats.superadmins,
              icon: AdminPanelSettings,
              gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)',
              delay: 0.1
            },
            {
              title: 'Admins',
              value: stats.admins,
              icon: VerifiedUser,
              gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)',
              delay: 0.2
            },
            {
              title: 'Residents',
              value: stats.residents,
              icon: Home,
              gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              delay: 0.3
            }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.delay, duration: 0.5 }}
                whileHover={{ y: -8 }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: stat.gradient,
                    color: 'white',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.85,
                          fontWeight: 600,
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '0.75rem'
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <stat.icon sx={{ fontSize: 20 }} />
                      </Box>
                    </Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        fontFamily: '"Poppins", sans-serif',
                        letterSpacing: '-1px',
                        fontSize: '2.5rem'
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(51, 63, 31, 0.08)',
              border: '1px solid rgba(140, 165, 81, 0.12)',
              background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)'
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: 'linear-gradient(135deg, rgba(51, 63, 31, 0.03) 0%, rgba(140, 165, 81, 0.03) 100%)',
                      borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
                    }}
                  >
                    {['NAME', 'EMAIL', 'PHONE', 'ROLE', 'PROPERTIES', 'ACTIONS'].map((header) => (
                      <TableCell
                        key={header}
                        sx={{
                          fontWeight: 700,
                          color: '#333F1F',
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '0.75rem',
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                          py: 2,
                          borderBottom: 'none'
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Box display="flex" justifyContent="center" p={6}>
                            <CircularProgress sx={{ color: '#333F1F' }} />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Box
                            sx={{
                              py: 8,
                              textAlign: 'center',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 2
                            }}
                          >
                            <Box
                              sx={{
                                width: 80,
                                height: 80,
                                borderRadius: 4,
                                bgcolor: 'rgba(140, 165, 81, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 1
                              }}
                            >
                              <PersonAdd sx={{ fontSize: 40, color: '#8CA551' }} />
                            </Box>
                            <Typography
                              variant="h6"
                              sx={{
                                color: '#333F1F',
                                fontWeight: 600,
                                fontFamily: '"Poppins", sans-serif',
                                mb: 0.5
                              }}
                            >
                              No residents yet
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#706f6f',
                                fontFamily: '"Poppins", sans-serif',
                                mb: 2
                              }}
                            >
                              Start by inviting your first resident
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<Add />}
                              onClick={() => handleOpenDialog()}
                              sx={{
                                borderRadius: 3,
                                bgcolor: '#333F1F',
                                textTransform: 'none',
                                fontFamily: '"Poppins", sans-serif',
                                fontWeight: 600,
                                px: 3,
                                '&:hover': {
                                  bgcolor: '#8CA551'
                                }
                              }}
                            >
                              Add First Resident
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user, index) => {
                        const roleColors = getRoleColor(user.role);

                        return (
                          <motion.tr
                            key={user._id}
                            component={TableRow}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            sx={{
                              transition: 'all 0.3s ease',
                              borderLeft: '3px solid transparent',
                              '&:hover': {
                                bgcolor: 'rgba(140, 165, 81, 0.04)',
                                transform: 'translateX(4px)',
                                boxShadow: '0 2px 8px rgba(51, 63, 31, 0.08)',
                                borderLeftColor: '#8CA551'
                              },
                              '&:last-child td': {
                                borderBottom: 'none'
                              }
                            }}
                          >
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1.5}>
                                <Avatar
                                  sx={{
                                    width: 44,
                                    height: 44,
                                    bgcolor: 'transparent',
                                    background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    fontFamily: '"Poppins", sans-serif',
                                    border: '2px solid rgba(255, 255, 255, 0.9)',
                                    boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
                                  }}
                                >
                                  {user.firstName?.charAt(0)}
                                  {user.lastName?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: '#1a1a1a',
                                      fontFamily: '"Poppins", sans-serif',
                                      mb: 0.3
                                    }}
                                  >
                                    {user.firstName} {user.lastName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#706f6f',
                                      fontFamily: '"Poppins", sans-serif',
                                      fontSize: '0.7rem',
                                      letterSpacing: '0.5px'
                                    }}
                                  >
                                    ID: {user._id.slice(-6)}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#333F1F',
                                  fontFamily: '"Poppins", sans-serif',
                                  fontWeight: 500
                                }}
                              >
                                {user.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#706f6f',
                                  fontFamily: '"Poppins", sans-serif',
                                  fontWeight: 500
                                }}
                              >
                                {user.phoneNumber || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.role}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontFamily: '"Poppins", sans-serif',
                                  height: 28,
                                  px: 1.5,
                                  fontSize: '0.75rem',
                                  letterSpacing: '0.5px',
                                  borderRadius: 2,
                                  textTransform: 'capitalize',
                                  bgcolor: roleColors.bg,
                                  color: roleColors.color,
                                  border: `1px solid ${roleColors.border}`
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Home sx={{ fontSize: 16, color: '#8CA551' }} />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: '#333F1F',
                                    fontFamily: '"Poppins", sans-serif'
                                  }}
                                >
                                  {user.lots?.length || 0}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Edit" placement="top">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDialog(user)}
                                    sx={{
                                      bgcolor: 'rgba(140, 165, 81, 0.08)',
                                      border: '1px solid rgba(140, 165, 81, 0.2)',
                                      borderRadius: 2,
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        bgcolor: '#8CA551',
                                        borderColor: '#8CA551',
                                        transform: 'scale(1.1)',
                                        '& .MuiSvgIcon-root': {
                                          color: 'white'
                                        }
                                      }
                                    }}
                                  >
                                    <Edit sx={{ fontSize: 18, color: '#8CA551' }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete" placement="top">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(user._id)}
                                    sx={{
                                      bgcolor: 'rgba(229, 134, 60, 0.08)',
                                      border: '1px solid rgba(229, 134, 60, 0.2)',
                                      borderRadius: 2,
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        bgcolor: '#E5863C',
                                        borderColor: '#E5863C',
                                        transform: 'scale(1.1)',
                                        '& .MuiSvgIcon-root': {
                                          color: 'white'
                                        }
                                      }
                                    }}
                                  >
                                    <Delete sx={{ fontSize: 18, color: '#E5863C' }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </motion.div>

        {/* Dialog - Ya estaba bien estilizado */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: "0 20px 60px rgba(51, 63, 31, 0.15)",
            },
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: "#333F1F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(51, 63, 31, 0.2)",
                }}
              >
                <PersonAdd sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ 
                    color: "#333F1F",
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {selectedUser ? "Edit User" : "Invite New User"}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: "#706f6f",
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  The user will receive an invitation to set their password
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
        
          <DialogContent sx={{ pt: 3 }}>
            <Alert 
              severity="info" 
              sx={{ 
                mb: 2,
                borderRadius: 3,
                bgcolor: "rgba(140, 165, 81, 0.08)",
                border: "1px solid rgba(140, 165, 81, 0.3)",
                fontFamily: '"Poppins", sans-serif',
                "& .MuiAlert-icon": {
                  color: "#8CA551"
                }
              }}
            >
              The user will receive an invitation to set their password
            </Alert>
        
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      fontFamily: '"Poppins", sans-serif',
                      "&.Mui-focused fieldset": { 
                        borderColor: "#333F1F",
                        borderWidth: "2px"
                      },
                      "&:hover fieldset": {
                        borderColor: "#8CA551"
                      }
                    },
                    "& .MuiInputLabel-root": {
                      fontFamily: '"Poppins", sans-serif',
                      "&.Mui-focused": {
                        color: "#333F1F"
                      }
                    }
                  }}
                />
              </Grid>
        
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      fontFamily: '"Poppins", sans-serif',
                      "&.Mui-focused fieldset": { 
                        borderColor: "#333F1F",
                        borderWidth: "2px"
                      },
                      "&:hover fieldset": {
                        borderColor: "#8CA551"
                      }
                    },
                    "& .MuiInputLabel-root": {
                      fontFamily: '"Poppins", sans-serif',
                      "&.Mui-focused": {
                        color: "#333F1F"
                      }
                    }
                  }}
                />
              </Grid>
        
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      fontFamily: '"Poppins", sans-serif',
                      "&.Mui-focused fieldset": { 
                        borderColor: "#333F1F",
                        borderWidth: "2px"
                      },
                      "&:hover fieldset": {
                        borderColor: "#8CA551"
                      }
                    },
                    "& .MuiInputLabel-root": {
                      fontFamily: '"Poppins", sans-serif',
                      "&.Mui-focused": {
                        color: "#333F1F"
                      }
                    }
                  }}
                />
              </Grid>
        
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ 
                      mb: 0.5, 
                      display: "block",
                      color: "#706f6f",
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    Phone Number *
                  </Typography>
                  <PhoneInput
                    country={"us"}
                    value={formData.phoneNumber}
                    onChange={(value) =>
                      setFormData({ ...formData, phoneNumber: value })
                    }
                    inputProps={{
                      name: "phone",
                      required: true,
                    }}
                    containerStyle={{ width: "100%" }}
                    inputStyle={{
                      width: "100%",
                      height: "56px",
                      fontSize: "16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 12,
                      transition: "all 0.3s",
                      fontFamily: '"Poppins", sans-serif'
                    }}
                    buttonStyle={{
                      border: "2px solid #e0e0e0",
                      borderRight: "none",
                      borderRadius: "12px 0 0 12px"
                    }}
                    dropdownStyle={{
                      borderRadius: 12,
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  />
                </Box>
              </Grid>
        
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Birthday"
                  value={formData.birthday}
                  onChange={(e) =>
                    setFormData({ ...formData, birthday: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      fontFamily: '"Poppins", sans-serif',
                      "&.Mui-focused fieldset": { 
                        borderColor: "#333F1F",
                        borderWidth: "2px"
                      },
                      "&:hover fieldset": {
                        borderColor: "#8CA551"
                      }
                    },
                    "& .MuiInputLabel-root": {
                      fontFamily: '"Poppins", sans-serif',
                      "&.Mui-focused": {
                        color: "#333F1F"
                      }
                    }
                  }}
                />
              </Grid>
        
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      fontFamily: '"Poppins", sans-serif',
                      "&.Mui-focused fieldset": { 
                        borderColor: "#333F1F",
                        borderWidth: "2px"
                      },
                      "&:hover fieldset": {
                        borderColor: "#8CA551"
                      }
                    },
                    "& .MuiInputLabel-root": {
                      fontFamily: '"Poppins", sans-serif',
                      "&.Mui-focused": {
                        color: "#333F1F"
                      }
                    }
                  }}
                >
                  <MenuItem value="user" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    User
                  </MenuItem>
                  <MenuItem value="admin" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    Admin
                  </MenuItem>
                  <MenuItem value="superadmin" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    Super Admin
                  </MenuItem>
                </TextField>
              </Grid>
        
              {selectedUser && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password (leave blank to keep current)"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    helperText="Leave blank to keep current password"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        fontFamily: '"Poppins", sans-serif',
                        "&.Mui-focused fieldset": { 
                          borderColor: "#333F1F",
                          borderWidth: "2px"
                        },
                        "&:hover fieldset": {
                          borderColor: "#8CA551"
                        }
                      },
                      "& .MuiInputLabel-root": {
                        fontFamily: '"Poppins", sans-serif',
                        "&.Mui-focused": {
                          color: "#333F1F"
                        }
                      },
                      "& .MuiFormHelperText-root": {
                        fontFamily: '"Poppins", sans-serif'
                      }
                    }}
                  />
                </Grid>
              )}
        
              {selectedUser && (
                <Grid item xs={12}>
                  <Paper 
                    sx={{ 
                      p: 2.5, 
                      bgcolor: "rgba(112, 111, 111, 0.05)",
                      borderRadius: 3,
                      border: "1px solid rgba(112, 111, 111, 0.1)"
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "#706f6f",
                        fontFamily: '"Poppins", sans-serif',
                        mb: 0.5
                      }}
                    >
                      User ID: {selectedUser._id}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: "#706f6f",
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    >
                      Created:{" "}
                      {new Date(
                        selectedUser.createdAt || Date.now(),
                      ).toLocaleDateString()}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </DialogContent>
        
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1.2,
                color: "#706f6f",
                fontFamily: '"Poppins", sans-serif',
                border: "2px solid #e0e0e0",
                "&:hover": {
                  bgcolor: "rgba(112, 111, 111, 0.05)",
                  borderColor: "#706f6f"
                }
              }}
            >
              Cancel
            </Button>
        
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={
                !formData.firstName ||
                !formData.lastName ||
                !formData.email ||
                !formData.phoneNumber
              }
              sx={{
                borderRadius: 3,
                bgcolor: "#333F1F",
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                letterSpacing: "1px",
                fontFamily: '"Poppins", sans-serif',
                px: 4,
                py: 1.5,
                boxShadow: "0 4px 12px rgba(51, 63, 31, 0.25)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  bgcolor: "#8CA551",
                  transition: "left 0.4s ease",
                  zIndex: 0,
                },
                "&:hover": {
                  bgcolor: "#333F1F",
                  boxShadow: "0 8px 20px rgba(51, 63, 31, 0.35)",
                  "&::before": {
                    left: 0,
                  },
                },
                "&:disabled": {
                  bgcolor: "#e0e0e0",
                  color: "#9e9e9e",
                  boxShadow: "none",
                },
                "& span": {
                  position: "relative",
                  zIndex: 1,
                }
              }}
            >
              <span>{selectedUser ? "Update" : "Send Invitation"}</span>
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Residents;