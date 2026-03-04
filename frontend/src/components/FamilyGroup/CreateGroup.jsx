import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Button,
  Box,
  Typography
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

const CreateGroupDialog = ({
  open,
  onClose,
  groupName,
  onGroupNameChange,
  onSubmit
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && groupName.trim()) {
      onSubmit()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Create Family Group
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Group Name"
          fullWidth
          value={groupName}
          onChange={onGroupNameChange}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Smith Family"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
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
          disabled={!groupName.trim()}
          sx={{
            borderRadius: 2,
            bgcolor: '#333F1F',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#8CA551',
            },
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateGroupDialog