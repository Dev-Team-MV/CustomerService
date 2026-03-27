// @shared/components/FamilyGroup/AddMemberDialog.jsx
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Autocomplete,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  CircularProgress,
  Avatar,
  Chip
} from '@mui/material'
import { Close, PersonAdd, AdminPanelSettings, Person } from '@mui/icons-material'

/**
 * Dialog for adding a member to a family group
 */
export const AddMemberDialog = ({
  open,
  onClose,
  group,
  availableUsers = [],
  onSubmit,
  loading = false,
  loadingUsers = false,
  onSearchUsers // ← AGREGAR ESTE PROP
}) => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [role, setRole] = useState('member')

   const [searchQuery, setSearchQuery] = useState('') // ← AGREGAR
 

  useEffect(() => {
    if (!open) {
      setSelectedUser(null)
      setRole('member')
    }
  }, [open])

  const handleSubmit = async () => {
    if (!selectedUser) return
    
    const success = await onSubmit(group._id, selectedUser._id, role)
    if (success) {
      setSelectedUser(null)
      setRole('member')
    }
  }

  // Filter out users already in the group
const filteredUsers = group ? availableUsers.filter(user => {
  const isCreator = group.createdBy?._id === user._id
  const isMember = group.members?.some(m => m.user?._id === user._id)
  return !isCreator && !isMember
}) : availableUsers
 

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PersonAdd sx={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Add Member
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Add a member to {group?.name}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* User Selection */}
<Autocomplete
  value={selectedUser}
  onChange={(_, newValue) => setSelectedUser(newValue)}
  onInputChange={(_, newInputValue) => {
    setSearchQuery(newInputValue)
    // Búsqueda dinámica si hay función de búsqueda
    if (onSearchUsers && newInputValue.length >= 2) {
      onSearchUsers(newInputValue)
    } else if (onSearchUsers && newInputValue.length < 2) {
      onSearchUsers('') // Reset to show all
    }
  }}
  options={filteredUsers}
  getOptionLabel={(option) => 
    `${option.firstName} ${option.lastName} (${option.email})` 
  }
  loading={loadingUsers}
  disabled={loading}
  filterOptions={(x) => x} // Deshabilitar filtro local, usar búsqueda del servidor
  renderInput={(params) => (
    <TextField
      {...params}
      label="Select User"
      placeholder="Search by name or email (min 2 chars)"
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <>
            {loadingUsers ? <CircularProgress size={20} /> : null}
            {params.InputProps.endAdornment}
          </>
        )
      }}
    />
  )}
  renderOption={(props, option) => (
    <Box component="li" {...props} display="flex" alignItems="center" gap={2}>
      <Avatar sx={{ width: 32, height: 32 }}>
        {option.firstName?.[0]}{option.lastName?.[0]}
      </Avatar>
      <Box>
        <Typography variant="body2">
          {option.firstName} {option.lastName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {option.email}
        </Typography>
      </Box>
    </Box>
  )}
/>

          {/* Role Selection */}
          <FormControl component="fieldset" sx={{ mt: 3 }}>
            <FormLabel component="legend">Member Role</FormLabel>
            <RadioGroup
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <Box display="flex" flexDirection="column" gap={1} mt={1}>
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: role === 'member' ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => setRole('member')}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Person color={role === 'member' ? 'primary' : 'action'} />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Member
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Can view shared resources
                        </Typography>
                      </Box>
                    </Box>
                    <Radio value="member" checked={role === 'member'} />
                  </Box>
                </Box>

                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: role === 'admin' ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => setRole('admin')}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <AdminPanelSettings color={role === 'admin' ? 'primary' : 'action'} />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Admin
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Can manage group and share resources
                        </Typography>
                      </Box>
                    </Box>
                    <Radio value="admin" checked={role === 'admin'} />
                  </Box>
                </Box>
              </Box>
            </RadioGroup>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !selectedUser}
          startIcon={loading ? <CircularProgress size={16} /> : <PersonAdd />}
        >
          {loading ? 'Adding...' : 'Add Member'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddMemberDialog