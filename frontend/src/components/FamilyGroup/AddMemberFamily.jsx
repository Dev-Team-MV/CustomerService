import React, { useState, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Button,
  Box,
  Stack,
  Autocomplete,
  Typography,
  CircularProgress
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import api from '../../services/api'

const AddMemberDialog = ({
  open,
  onClose,
  groupName,
  existingMembers,
  selectedUser,
  onUserChange,
  memberRole,
  onRoleChange,
  onSubmit
}) => {
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const searchUsers = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }
    try {
      setSearching(true)
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
      // Filtrar miembros que ya están en el grupo
      const filtered = response.data.filter(
        (u) => !existingMembers.some((m) => m.user._id === u._id)
      )
      setSearchResults(filtered)
    } catch (err) {
      console.error('Error searching users:', err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [existingMembers])

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue)
    searchUsers(newInputValue)
  }

  const handleClose = () => {
    setSearchResults([])
    setInputValue('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Add Member to {groupName}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Autocomplete
            options={searchResults}
            getOptionLabel={(option) =>
              `${option.firstName} ${option.lastName} (${option.email})`
            }
            value={selectedUser}
            onChange={onUserChange}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            loading={searching}
            noOptionsText={
              inputValue.length < 2
                ? 'Type at least 2 characters to search'
                : 'No users found'
            }
            filterOptions={(x) => x} // desactivar filtrado local, el backend ya filtra
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search User"
                placeholder="Search by name or email..."
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searching ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          <TextField
            select
            label="Role"
            value={memberRole}
            onChange={onRoleChange}
            SelectProps={{ native: true }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!selectedUser}
          sx={{
            borderRadius: 2,
            bgcolor: '#333F1F',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: '#8CA551' },
          }}
        >
          Add Member
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddMemberDialog