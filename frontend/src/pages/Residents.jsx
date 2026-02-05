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
} from "@mui/material";
import { Add, Edit, Delete, PersonAdd } from "@mui/icons-material";
import api from "../services/api";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Alert } from "@mui/material";

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
        // Editar usuario - usar endpoint de users
        if (!payload.password) {
          delete payload.password;
        }
        await api.put(`/users/${selectedUser._id}`, payload);
      } else {
        // Crear usuario - usar endpoint de register
        await api.post("/auth/register", payload);
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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "superadmin":
        return "error";
      case "admin":
        return "primary";
      case "user":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Residents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage resident accounts and information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>NAME</TableCell>
                <TableCell>EMAIL</TableCell>
                <TableCell>PHONE</TableCell>
                <TableCell>ROLE</TableCell>
                <TableCell>PROPERTIES</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar>
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user._id.slice(-6)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.phoneNumber || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleBadgeColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.lots?.length || 0} properties
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user._id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
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
                background: "linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PersonAdd sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {selectedUser ? "Edit User" : "Invite New User"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6c757d" }}>
                The user will receive an invitation to set their password
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
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
                    "&.Mui-focused fieldset": { borderColor: "#4a7c59" },
                  },
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
                    "&.Mui-focused fieldset": { borderColor: "#4a7c59" },
                  },
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
                    "&.Mui-focused fieldset": { borderColor: "#4a7c59" },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5, display: "block" }}
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
                    border: "1px solid #c4c4c4",
                    borderRadius: 6,
                  }}
                  buttonStyle={{
                    border: "1px solid #c4c4c4",
                    borderRight: "none",
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
                    "&.Mui-focused fieldset": { borderColor: "#4a7c59" },
                  },
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
                    "&.Mui-focused fieldset": { borderColor: "#4a7c59" },
                  },
                }}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="superadmin">Super Admin</MenuItem>
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
                      "&.Mui-focused fieldset": { borderColor: "#4a7c59" },
                    },
                  }}
                />
              </Grid>
            )}

            {selectedUser && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body2" color="text.secondary">
                    User ID: {selectedUser._id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
              background: "linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)",
              color: "white",
              fontWeight: 700,
              textTransform: "none",
              px: 4,
              py: 1.5,
              boxShadow: "0 8px 20px rgba(74, 124, 89, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #3d664a 0%, #7ba843 100%)",
                boxShadow: "0 12px 28px rgba(74, 124, 89, 0.4)",
              },
              "&:disabled": {
                background: "#ccc",
              },
            }}
          >
            {selectedUser ? "Update" : "Send Invitation"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Residents;
