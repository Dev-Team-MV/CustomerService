import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Container,
  Grid,
  IconButton,
  Tooltip,
  Chip,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  CircularProgress
} from '@mui/material'
import {
  People,
  Add,
  AdminPanelSettings,
  VerifiedUser,
  Home,
  Edit,
  Delete,
  PersonAdd,
  Sms
} from '@mui/icons-material'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import StatsCards from '../components/statscard'
import DataTable from '../components/table/DataTable'
import EmptyState from '../components/table/EmptyState'

const Residents = () => {
  const { t } = useTranslation(['residents', 'common'])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, superadmins: 0, admins: 0, residents: 0 })
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'user'
  })
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [sendingSMS, setSendingSMS] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/users')
      setUsers(res.data)
      // Stats
      const total = res.data.length
      const superadmins = res.data.filter(u => u.role === 'superadmin').length
      const admins = res.data.filter(u => u.role === 'admin').length
      const residents = res.data.filter(u => u.role === 'user').length
      setStats({ total, superadmins, admins, residents })
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user)
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role || 'user'
      })
    } else {
      setSelectedUser(null)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        role: 'user'
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedUser(null)
  }

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser._id}`, formData)
      } else {
        await api.post('/users', formData)
      }
      handleCloseDialog()
      fetchData()
      setSnackbar({ open: true, message: t('common:actions.saved'), severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' })
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('residents:confirmDelete'))) {
      try {
        await api.delete(`/users/${id}`)
        fetchData()
        setSnackbar({ open: true, message: t('common:actions.deleted'), severity: 'success' })
      } catch (error) {
        setSnackbar({ open: true, message: error.message, severity: 'error' })
      }
    }
  }

  const handleSendPasswordSMS = async (user) => {
    if (!user.phoneNumber) {
      setSnackbar({ open: true, message: t('residents:snackbar.noPhone'), severity: 'error' })
      return
    }
    setSendingSMS(true)
    try {
      // Simulación de envío de SMS
      await api.post(`/users/${user._id}/send-password-sms`)
      setSnackbar({ open: true, message: t('residents:snackbar.smsSent', { phone: user.phoneNumber }), severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: t('residents:snackbar.smsError'), severity: 'error' })
    }
    setSendingSMS(false)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'superadmin': return { color: '#E5863C', icon: AdminPanelSettings }
      case 'admin': return { color: '#8CA551', icon: VerifiedUser }
      default: return { color: '#1976d2', icon: Home }
    }
  }

  const residentsStats = useMemo(() => [
    {
      title: t('residents:stats.total'),
      value: stats.total,
      icon: People,
      gradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
      color: '#333F1F',
      delay: 0
    },
    {
      title: t('residents:stats.superadmins'),
      value: stats.superadmins,
      icon: AdminPanelSettings,
      gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)',
      color: '#E5863C',
      delay: 0.1
    },
    {
      title: t('residents:stats.admins'),
      value: stats.admins,
      icon: VerifiedUser,
      gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)',
      color: '#8CA551',
      delay: 0.2
    },
    {
      title: t('residents:stats.residents'),
      value: stats.residents,
      icon: Home,
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      color: '#1976d2',
      delay: 0.3
    }
  ], [stats, t])

  const columns = useMemo(() => [
    {
      field: 'name',
      headerName: t('residents:table.name'),
      minWidth: 180,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar             
          sx={{
              width: 48,
              height: 48,
              bgcolor: 'transparent',
              background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              fontFamily: '"Poppins", sans-serif',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
            }}>
            {row.firstName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography fontWeight={600} fontFamily='"Poppins", sans-serif'>
              {row.firstName} {row.lastName}
            </Typography>
            <Typography variant="caption" color="#706f6f" fontFamily='"Poppins", sans-serif'>
              {row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'email',
      headerName: t('residents:table.email'),
      minWidth: 180,
      renderCell: ({ row }) => row.email
    },
    {
      field: 'phoneNumber',
      headerName: t('residents:table.phone'),
      minWidth: 140,
      renderCell: ({ row }) => row.phoneNumber || '-'
    },
    {
      field: 'role',
      headerName: t('residents:table.role'),
      minWidth: 120,
      renderCell: ({ row }) => {
        const { color, icon: Icon } = getRoleColor(row.role)
        return (
          <Chip
            label={t(`residents:role.${row.role}`)}
            icon={<Icon sx={{ color }} />}
            sx={{
              bgcolor: `${color}10`,
              color,
              fontWeight: 600,
              fontFamily: '"Poppins", sans-serif',
              border: `1px solid ${color}40`
            }}
            size="small"
          />
        )
      }
    },
    {
      field: 'lots',
      headerName: t('residents:table.properties'),
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
      headerName: t('residents:table.actions'),
      align: 'center',
      minWidth: 120,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('residents:actions.sendSMS')} placement="top">
            <span>
              <IconButton
                size="small"
                onClick={() => handleSendPasswordSMS(row)}
                disabled={sendingSMS}
                sx={{
                  bgcolor: 'rgba(140, 165, 81, 0.08)',
                  border: '1px solid rgba(140, 165, 81, 0.2)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#8CA551',
                    borderColor: '#8CA551',
                    transform: 'scale(1.1)',
                    '& .MuiSvgIcon-root': { color: 'white' }
                  }
                }}
              >
                {sendingSMS ? <CircularProgress size={16} /> : <Sms sx={{ fontSize: 18, color: '#8CA551' }} />}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('residents:actions.edit')} placement="top">
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(row)}
              sx={{
                bgcolor: 'rgba(140, 165, 81, 0.08)',
                border: '1px solid rgba(140, 165, 81, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#8CA551',
                  borderColor: '#8CA551',
                  transform: 'scale(1.1)',
                  '& .MuiSvgIcon-root': { color: 'white' }
                }
              }}
            >
              <Edit sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('residents:actions.delete')} placement="top">
            <IconButton
              size="small"
              onClick={() => handleDelete(row._id)}
              sx={{
                bgcolor: 'rgba(229, 134, 60, 0.08)',
                border: '1px solid rgba(229, 134, 60, 0.2)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#E5863C',
                  borderColor: '#E5863C',
                  transform: 'scale(1.1)',
                  '& .MuiSvgIcon-root': { color: 'white' }
                }
              }}
            >
              <Delete sx={{ fontSize: 18, color: '#E5863C' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ], [t, sendingSMS])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        <PageHeader
          icon={People}
          title={t('residents:title')}
          subtitle={t('residents:subtitle')}
          actionButton={{
            label: t('residents:actions.add'),
            onClick: () => handleOpenDialog(),
            icon: <Add />,
            tooltip: t('residents:actions.add')
          }}
        />

        <StatsCards stats={residentsStats} loading={loading} />

        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyState={
            <EmptyState
              icon={PersonAdd}
              title={t('residents:empty.title')}
              description={t('residents:empty.description')}
              actionLabel={t('residents:empty.action')}
              onAction={() => handleOpenDialog()}
            />
          }
          onRowClick={(row) => console.log('User clicked:', row)}
        />

        {/* Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)'
            }
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: '#333F1F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
                }}
              >
                <People sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {selectedUser ? t('residents:actions.edit') : t('residents:actions.add')}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {t('residents:subtitle')}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('common:form.firstName')}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  sx={{ borderRadius: 3 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('common:form.lastName')}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  sx={{ borderRadius: 3 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('residents:table.email')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  sx={{ borderRadius: 3 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('residents:table.phone')}
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  sx={{ borderRadius: 3 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label={t('residents:table.role')}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  SelectProps={{ native: true }}
                  sx={{ borderRadius: 3 }}
                >
                  <option value="superadmin">{t('residents:role.superadmin')}</option>
                  <option value="admin">{t('residents:role.admin')}</option>
                  <option value="user">{t('residents:role.user')}</option>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.2,
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif',
                border: '2px solid #e0e0e0',
                '&:hover': {
                  bgcolor: 'rgba(112, 111, 111, 0.05)',
                  borderColor: '#706f6f'
                }
              }}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.firstName || !formData.lastName || !formData.email}
              sx={{
                borderRadius: 3,
                bgcolor: '#333F1F',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '1px',
                fontFamily: '"Poppins", sans-serif',
                px: 4,
                py: 1.5,
                boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  bgcolor: '#333F1F',
                  boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)'
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e',
                  boxShadow: 'none'
                }
              }}
            >
              <span>{selectedUser ? t('common:actions.update') : t('common:actions.create')}</span>
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

export default Residents