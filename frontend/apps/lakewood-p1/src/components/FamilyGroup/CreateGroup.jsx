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
import { useTranslation } from 'react-i18next'

const CreateGroupDialog = ({
  open,
  onClose,
  groupName,
  onGroupNameChange,
  onSubmit
}) => {
  const { t } = useTranslation('familyGroup')
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
            {t('createFamilyGroup')}
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
          label={t('groupName')}
          fullWidth
          value={groupName}
          onChange={onGroupNameChange}
          onKeyPress={handleKeyPress}
          placeholder={t('groupNamePlaceholder')}
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
          {t('cancel')}
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
          {t('create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateGroupDialog