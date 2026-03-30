// @shared/components/ResourceShare/SharesList.jsx
import React, { useState } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Chip,
  Divider,
  Collapse,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material'
import {
  Person,
  Group,
  ExpandMore,
  ExpandLess,
  MoreVert,
  PersonRemove,
  GroupRemove,
  Share as ShareIcon
} from '@mui/icons-material'

/**
 * Shares List Component
 * Displays list of users/groups with access to a resource
 */
export const SharesList = ({
  shares = [],
  onRevokeUser,
  onRevokeGroup,
  loading = false,
  emptyMessage = 'No shares yet'
}) => {
  const [expandedGroups, setExpandedGroups] = useState({})
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedShare, setSelectedShare] = useState(null)

  // Group shares by family group
  const groupedShares = shares.reduce((acc, share) => {
    if (share.familyGroup) {
      const groupId = share.familyGroup._id || share.familyGroup
      if (!acc.groups[groupId]) {
        acc.groups[groupId] = {
          group: share.familyGroup,
          shares: []
        }
      }
      acc.groups[groupId].shares.push(share)
    } else {
      acc.individual.push(share)
    }
    return acc
  }, { groups: {}, individual: [] })

  const handleToggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  const handleMenuOpen = (event, share) => {
    event.stopPropagation()
    setMenuAnchor(event.currentTarget)
    setSelectedShare(share)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedShare(null)
  }

  const handleRevoke = async () => {
    if (selectedShare) {
      if (selectedShare.familyGroup) {
        const groupId = selectedShare.familyGroup._id || selectedShare.familyGroup
        await onRevokeGroup(groupId)
      } else {
        const userId = selectedShare.sharedWith._id || selectedShare.sharedWith
        await onRevokeUser(userId)
      }
      handleMenuClose()
    }
  }

  if (shares.length === 0) {
    return (
      <Alert severity="info" icon={<ShareIcon />}>
        {emptyMessage}
      </Alert>
    )
  }

  return (
    <Box>
      <List disablePadding>
        {/* Group Shares */}
        {Object.entries(groupedShares.groups).map(([groupId, { group, shares: groupShares }], index) => {
          const isExpanded = expandedGroups[groupId]
          const groupName = typeof group === 'object' ? group.name : 'Unknown Group'

          return (
            <React.Fragment key={groupId}>
              {index > 0 && <Divider />}
              
              {/* Group Header */}
              <ListItem
                button
                onClick={() => handleToggleGroup(groupId)}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleMenuOpen(e, groupShares[0])}
                  >
                    <MoreVert />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Group />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight={500}>
                        {groupName}
                      </Typography>
                      <Chip
                        label="Group"
                        size="small"
                        color="primary"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                  secondary={`${groupShares.length} member${groupShares.length !== 1 ? 's' : ''} with access`}
                />
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </ListItem>

              {/* Group Members */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 4, bgcolor: 'grey.50' }}>
                  {groupShares.map((share, idx) => (
                    <React.Fragment key={share._id || idx}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {share.sharedWith?.firstName?.[0]}
                            {share.sharedWith?.lastName?.[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {share.sharedWith?.firstName} {share.sharedWith?.lastName}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {share.sharedWith?.email}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {idx < groupShares.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          )
        })}

        {/* Individual Shares */}
        {groupedShares.individual.length > 0 && Object.keys(groupedShares.groups).length > 0 && (
          <Divider sx={{ my: 1 }} />
        )}

        {groupedShares.individual.map((share, index) => (
          <React.Fragment key={share._id || index}>
            {index > 0 && <Divider />}
            <ListItem
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => handleMenuOpen(e, share)}
                >
                  <MoreVert />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar>
                  {share.sharedWith?.firstName?.[0]}
                  {share.sharedWith?.lastName?.[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight={500}>
                    {share.sharedWith?.firstName} {share.sharedWith?.lastName}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {share.sharedWith?.email}
                    </Typography>
                    {share.sharedBy && (
                      <Typography variant="caption" color="text.secondary">
                        Shared by {share.sharedBy?.firstName} {share.sharedBy?.lastName}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRevoke} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            {selectedShare?.familyGroup ? (
              <GroupRemove fontSize="small" color="error" />
            ) : (
              <PersonRemove fontSize="small" color="error" />
            )}
          </ListItemIcon>
          <Typography>
            {selectedShare?.familyGroup ? 'Revoke Group Access' : 'Revoke Access'}
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default SharesList