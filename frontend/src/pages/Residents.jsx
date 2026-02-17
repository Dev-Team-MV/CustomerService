import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
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
  Button,
  Alert
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
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import StatsCards from "../components/statscard";
import DataTable from "../components/table/DataTable";
import EmptyState from "../components/table/EmptyState";

import ResidentDialog from '../components/ResidentDialog'

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

  // ✅ HANDLERS CON useCallback
  const handleOpenDialog = useCallback((user = null) => {
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
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setSelectedUser(null);
  }, []);

  const handleSubmit = useCallback(async () => {
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
  }, [selectedUser, formData, handleCloseDialog]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert(error.response?.data?.message || "Error deleting user");
      }
    }
  }, []);

  const getRoleColor = useCallback((role) => {
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
  }, []);

  // ✅ STATS
  const stats = useMemo(() => ({
    total: users.length,
    superadmins: users.filter(u => u.role === 'superadmin').length,
    admins: users.filter(u => u.role === 'admin').length,
    residents: users.filter(u => u.role === 'user').length
  }), [users]);

  const residentsStats = useMemo(() => [
    {
      title: 'Total Users',
      value: stats.total,
      icon: People,
      gradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
      color: '#333F1F',
      delay: 0
    },
    {
      title: 'Super Admins',
      value: stats.superadmins,
      icon: AdminPanelSettings,
      gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)',
      color: '#E5863C',
      delay: 0.1
    },
    {
      title: 'Admins',
      value: stats.admins,
      icon: VerifiedUser,
      gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)',
      color: '#8CA551',
      delay: 0.2
    },
    {
      title: 'Residents',
      value: stats.residents,
      icon: Home,
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      color: '#1976d2',
      delay: 0.3
    }
  ], [stats]);

  // ✅ DEFINIR COLUMNAS
  const columns = useMemo(() => [
    {
      field: 'name',
      headerName: 'NAME',
      minWidth: 220,
      renderCell: ({ row }) => (
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
            {row.firstName?.charAt(0)}
            {row.lastName?.charAt(0)}
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
              {row.firstName} {row.lastName}
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
              ID: {row._id.slice(-6)}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'email',
      headerName: 'EMAIL',
      minWidth: 200,
      renderCell: ({ value }) => (
        <Typography
          variant="body2"
          sx={{
            color: '#333F1F',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 500
          }}
        >
          {value}
        </Typography>
      )
    },
    {
      field: 'phoneNumber',
      headerName: 'PHONE',
      minWidth: 150,
      renderCell: ({ value }) => (
        <Typography
          variant="body2"
          sx={{
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 500
          }}
        >
          {value || "N/A"}
        </Typography>
      )
    },
    {
      field: 'role',
      headerName: 'ROLE',
      minWidth: 130,
      renderCell: ({ row }) => {
        const roleColors = getRoleColor(row.role);
        return (
          <Chip
            label={row.role}
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
        );
      }
    },
    {
      field: 'lots',
      headerName: 'PROPERTIES',
      minWidth: 120,
      renderCell: ({ row }) => (
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
            {row.lots?.length || 0}
          </Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      align: 'center',
      minWidth: 120,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit" placement="top">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDialog(row);
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row._id);
              }}
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
      )
    }
  ], [getRoleColor, handleOpenDialog, handleDelete]);

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
        <PageHeader
          icon={People}
          title="Residents"
          subtitle="Manage resident accounts and information"
          actionButton={{
            label: 'Add User',
            onClick: () => handleOpenDialog(),
            icon: <Add />,
            tooltip: 'Add User'
          }}
        />

        {/* Stats Cards */}
        <StatsCards stats={residentsStats} loading={loading} />

        {/* ✅ TABLA REUTILIZABLE */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyState={
            <EmptyState
              icon={PersonAdd}
              title="No residents yet"
              description="Start by inviting your first resident"
              actionLabel="Add First Resident"
              onAction={() => handleOpenDialog()}
            />
          }
          onRowClick={(row) => console.log('User clicked:', row)}
          stickyHeader
          maxHeight={600}
        />



<ResidentDialog
  open={openDialog}
  onClose={handleCloseDialog}
  onSubmit={handleSubmit}
  formData={formData}
  setFormData={setFormData}
  selectedUser={selectedUser}
/>
      </Container>
    </Box>
  );
};

export default Residents;