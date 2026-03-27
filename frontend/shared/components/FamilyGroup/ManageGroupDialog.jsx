// @shared/components/FamilyGroup/ManageGroupDialog.jsx
import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Alert
} from '@mui/material'
import {
  Close,
  Group,
  MoreVert,
  PersonRemove,
  AdminPanelSettings,
  Person
} from '@mui/icons-material'

/**
 * Dialog for managing group members
 */
export const ManageGroupDialog = ({
  open,
  onClose,
  group,
  currentUserId,
  onRemoveMember,
  onUpdateRole,
  loading = false
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)

  const handleMenuOpen = (event, member) => {
    event.stopPropagation()
    setMenuAnchor(event.currentTarget)
    setSelectedMember(member)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedMember(null)
  }

  const handleRemove = async () => {
    if (selectedMember) {
      await onRemoveMember(group._id, selectedMember.user._id)
      handleMenuClose()
    }
  }

  const handleToggleRole = async () => {
    if (selectedMember) {
      const newRole = selectedMember.role === 'admin' ? 'member' : 'admin'
      await onUpdateRole(group._id, selectedMember.user._id, newRole)
      handleMenuClose()
    }
  }

  if (!group) return null

  const isCreator = (userId) => group.createdBy?._id === userId || group.createdBy === userId
  const canManage = isCreator(currentUserId)

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
              <Group sx={{ color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {group.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manage group members
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {!canManage && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Only the group creator can manage members
          </Alert>
        )}

        <List>
          {/* Creator */}
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {group.createdBy?.firstName?.[0]}
                {group.createdBy?.lastName?.[0]}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${group.createdBy?.firstName} ${group.createdBy?.lastName}`}
              secondary={group.createdBy?.email}
            />
            <Chip label="Creator" color="primary" size="small" />
          </ListItem>

          <Divider sx={{ my: 1 }} />

          {/* Members */}
          {group.members?.length > 0 ? (
            group.members.map((member) => (
              <ListItem
                key={member.user?._id || member._id}
                secondaryAction={
                  canManage && (
                    <IconButton
                      edge="end"
                      onClick={(e) => handleMenuOpen(e, member)}
                    >
                      <MoreVert />
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: member.role === 'admin' ? 'secondary.main' : 'grey.400'
                    }}
                  >
                    {member.user?.firstName?.[0]}
                    {member.user?.lastName?.[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${member.user?.firstName} ${member.user?.lastName}`}
                  secondary={member.user?.email}
                />
                {member.role === 'admin' && (
                  <Chip
                    icon={<AdminPanelSettings />}
                    label="Admin"
                    color="secondary"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                )}
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No members yet"
                secondary="Add members to start sharing resources"
              />
            </ListItem>
          )}
        </List>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      {/* Member Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleToggleRole}>
          <Box display="flex" alignItems="center" gap={1}>
            {selectedMember?.role === 'admin' ? <Person /> : <AdminPanelSettings />}
            <Typography>
              {selectedMember?.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleRemove} sx={{ color: 'error.main' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonRemove />
            <Typography>Remove from Group</Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Dialog>
  )
}

export default ManageGroupDialog