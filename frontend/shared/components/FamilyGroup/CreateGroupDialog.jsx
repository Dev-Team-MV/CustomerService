// @shared/components/FamilyGroup/CreateGroupDialog.jsx
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material'
import { Close, Group } from '@mui/icons-material'

/**
 * Dialog for creating a new family group
 */
export const CreateGroupDialog = ({
  open,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [groupName, setGroupName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setGroupName('')
      setError('')
    }
  }, [open])

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      setError('Group name is required')
      return
    }

    const success = await onSubmit(groupName.trim())
    if (success) {
      setGroupName('')
      setError('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
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
              <Group sx={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Create Family Group
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Create a group to share resources with family members
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Group Name"
          placeholder="e.g., García Family"
          value={groupName}
          onChange={(e) => {
            setGroupName(e.target.value)
            setError('')
          }}
          onKeyPress={handleKeyPress}
          error={!!error}
          helperText={error || 'Choose a descriptive name for your family group'}
          disabled={loading}
          sx={{ mt: 2 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !groupName.trim()}
          startIcon={loading ? <CircularProgress size={16} /> : <Group />}
        >
          {loading ? 'Creating...' : 'Create Group'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateGroupDialog