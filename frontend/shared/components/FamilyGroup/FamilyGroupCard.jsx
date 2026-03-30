// @shared/components/FamilyGroup/FamilyGroupCard.jsx
import React from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Avatar,
  AvatarGroup,
  IconButton,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  MoreVert,
  Edit,
  Delete,
  PersonAdd,
  Group,
  AdminPanelSettings,
  Share
} from '@mui/icons-material'
import { useState } from 'react'

/**
 * Family Group Card Component
 * Displays a single family group with members and actions
 */
export const FamilyGroupCard = ({
  group,
  isAdmin = false,
  onEdit,
  onDelete,
  onAddMember,
  onManageMembers,
  onShare,
  sx = {}
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const menuOpen = Boolean(anchorEl)

  const handleMenuOpen = (event) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleAction = (action) => {
    handleMenuClose()
    action?.()
  }

  const memberCount = (group.members?.length || 0) + 1 // +1 for creator
  const adminCount = group.members?.filter(m => m.role === 'admin').length || 0

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        },
        ...sx
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 48,
                height: 48
              }}
            >
              <Group />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {group.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Created by {group.createdBy?.firstName} {group.createdBy?.lastName}
              </Typography>
            </Box>
          </Box>

          {isAdmin && (
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ mt: -1, mr: -1 }}
            >
              <MoreVert />
            </IconButton>
          )}
        </Box>

        {/* Stats */}
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip
            icon={<Group />}
            label={`${memberCount} member${memberCount !== 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
          />
          {adminCount > 0 && (
            <Chip
              icon={<AdminPanelSettings />}
              label={`${adminCount} admin${adminCount !== 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
              color="primary"
            />
          )}
        </Box>

        {/* Members Avatars */}
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            Members
          </Typography>
          <AvatarGroup max={5} sx={{ justifyContent: 'flex-start' }}>
            {/* Creator */}
            <Tooltip title={`${group.createdBy?.firstName} ${group.createdBy?.lastName} (Creator)`}>
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
              >
                {group.createdBy?.firstName?.[0]}
                {group.createdBy?.lastName?.[0]}
              </Avatar>
            </Tooltip>

            {/* Members */}
            {group.members?.map((member) => (
              <Tooltip
                key={member.user?._id || member._id}
                title={`${member.user?.firstName} ${member.user?.lastName} ${member.role === 'admin' ? '(Admin)' : ''}`}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: member.role === 'admin' ? 'secondary.main' : 'grey.400'
                  }}
                >
                  {member.user?.firstName?.[0]}
                  {member.user?.lastName?.[0]}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
        </Box>
      </CardContent>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleAction(onManageMembers)}>
          <ListItemIcon>
            <Group fontSize="small" />
          </ListItemIcon>
          <ListItemText>Manage Members</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleAction(onAddMember)}>
          <ListItemIcon>
            <PersonAdd fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Member</ListItemText>
        </MenuItem>

        {onShare && (
          <MenuItem onClick={() => handleAction(onShare)}>
            <ListItemIcon>
              <Share fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share Resource</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={() => handleAction(onEdit)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Group</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleAction(onDelete)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Group</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  )
}

export default FamilyGroupCard