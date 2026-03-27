// @shared/components/FamilyGroup/MembersList.jsx
import React from 'react'
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Box,
  Typography,
  Divider,
  Tooltip
} from '@mui/material'
import {
  MoreVert,
  AdminPanelSettings,
  Star
} from '@mui/icons-material'

/**
 * Members List Component
 * Displays list of group members with roles and actions
 */
export const MembersList = ({
  group,
  currentUserId,
  onMemberAction,
  showActions = true,
  compact = false
}) => {
  if (!group) return null

  const isCreator = (userId) => group.createdBy?._id === userId || group.createdBy === userId

  return (
    <List disablePadding>
      {/* Creator */}
      <ListItem
        sx={{
          py: compact ? 1 : 2,
          px: compact ? 1 : 2
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: compact ? 36 : 40,
              height: compact ? 36 : 40
            }}
          >
            {group.createdBy?.firstName?.[0]}
            {group.createdBy?.lastName?.[0]}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant={compact ? 'body2' : 'body1'} fontWeight={500}>
                {group.createdBy?.firstName} {group.createdBy?.lastName}
              </Typography>
              {isCreator(currentUserId) && (
                <Chip
                  label="You"
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Box>
          }
          secondary={
            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
              <Star sx={{ fontSize: 14, color: 'warning.main' }} />
              <Typography variant="caption" color="text.secondary">
                Creator
              </Typography>
            </Box>
          }
        />
        <Chip
          label="Creator"
          color="primary"
          size="small"
          icon={<Star />}
        />
      </ListItem>

      {group.members?.length > 0 && <Divider />}

      {/* Members */}
      {group.members?.map((member, index) => {
        const userId = member.user?._id || member.user
        const isCurrentUser = userId === currentUserId

        return (
          <React.Fragment key={userId || index}>
            <ListItem
              sx={{
                py: compact ? 1 : 2,
                px: compact ? 1 : 2
              }}
              secondaryAction={
                showActions && onMemberAction && (
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => onMemberAction(e, member)}
                  >
                    <MoreVert />
                  </IconButton>
                )
              }
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: member.role === 'admin' ? 'secondary.main' : 'grey.400',
                    width: compact ? 36 : 40,
                    height: compact ? 36 : 40
                  }}
                >
                  {member.user?.firstName?.[0]}
                  {member.user?.lastName?.[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant={compact ? 'body2' : 'body1'} fontWeight={500}>
                      {member.user?.firstName} {member.user?.lastName}
                    </Typography>
                    {isCurrentUser && (
                      <Chip
                        label="You"
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  !compact && (
                    <Typography variant="caption" color="text.secondary">
                      {member.user?.email}
                    </Typography>
                  )
                }
              />
              {member.role === 'admin' && (
                <Tooltip title="Group Admin">
                  <Chip
                    icon={<AdminPanelSettings />}
                    label="Admin"
                    color="secondary"
                    size="small"
                    sx={{ mr: showActions ? 1 : 0 }}
                  />
                </Tooltip>
              )}
            </ListItem>
            {index < group.members.length - 1 && <Divider />}
          </React.Fragment>
        )
      })}

      {/* Empty State */}
      {(!group.members || group.members.length === 0) && (
        <>
          <Divider />
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary" align="center">
                  No members yet
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary" align="center">
                  Add members to start sharing resources
                </Typography>
              }
            />
          </ListItem>
        </>
      )}
    </List>
  )
}

export default MembersList