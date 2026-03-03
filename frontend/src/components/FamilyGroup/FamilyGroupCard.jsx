import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Divider,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button
} from '@mui/material'
import {
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Share as ShareIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import PropertyShareDialog from './PropertyShare'

const FamilyGroupCard = ({
  group,
  currentUser,
  isAdmin,
  onAddMember,
  onRemoveMember,
  onDeleteGroup,
  index = 0
}) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  // El admin del grupo es quien lo creó (createdBy) o quien tiene rol admin en members
  // También superadmin ve todo
  // Soporte para _id o id (depende del AuthContext)
  const currentUserId = currentUser?._id || currentUser?.id

  const isGroupOwner = group.createdBy._id === currentUserId
  const isSuperAdmin = currentUser?.role === 'superadmin'
  const isMemberAdmin = group.members.some(
    (m) => m.user._id === currentUserId && m.role === 'admin'
  )
  const canManage = isGroupOwner || isSuperAdmin || isMemberAdmin

  // DEBUG — quitar después de verificar
  console.log('🔍 canManage debug:', {
    groupName: group.name,
    createdById: group.createdBy._id,
    currentUserId,
    currentUserRaw: currentUser,
    isGroupOwner,
    isSuperAdmin,
    isMemberAdmin,
    canManage
  })
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(51, 63, 31, 0.15)',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="start"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GroupIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {group.name}
              </Typography>
            </Box>
            {isGroupOwner && (
              <Chip
                label="Owner"
                size="small"
                sx={{
                  bgcolor: '#333F1F',
                  color: 'white',
                  fontWeight: 600,
                  height: 24,
                }}
              />
            )}
          </Box>

          {/* Created By */}
          <Typography
            variant="caption"
            sx={{
              color: '#706f6f',
              display: 'block',
              mb: 2,
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Created by {group.createdBy.firstName} {group.createdBy.lastName}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Members Section */}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 1.5,
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Members ({group.members.length})
          </Typography>

          <List
            dense
            sx={{
              maxHeight: 200,
              overflow: 'auto',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: '#8CA551',
                borderRadius: 3,
              },
            }}
          >
            {group.members.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3, color: '#706f6f' }}>
                <Typography variant="caption">
                  No members yet. Add your first member!
                </Typography>
              </Box>
            ) : (
              group.members.map((member) => (
                <ListItem
                  key={member.user._id}
                  sx={{
                    bgcolor: '#f8f9fa',
                    borderRadius: 2,
                    mb: 0.5,
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 1.5,
                      bgcolor: '#8CA551',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {member.user.firstName[0]}
                  </Avatar>
                  <ListItemText
                    primary={`${member.user.firstName} ${member.user.lastName}`}
                    secondary={member.user.email}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  />
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Chip
                      icon={member.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                      label={member.role}
                      size="small"
                      sx={{
                        height: 24,
                        bgcolor: member.role === 'admin' ? '#333F1F' : '#e0e0e0',
                        color: member.role === 'admin' ? 'white' : '#666',
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: member.role === 'admin' ? 'white' : '#666',
                        },
                      }}
                    />
                    {canManage && member.user._id !== group.createdBy._id && (
                      <IconButton
                        size="small"
                        onClick={() => onRemoveMember(group._id, member.user._id)}
                        sx={{
                          ml: 1,
                          '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' },
                        }}
                      >
                        <DeleteIcon fontSize="small" sx={{ color: '#d32f2f' }} />
                      </IconButton>
                    )}
                  </Stack>
                </ListItem>
              ))
            )}
          </List>
        </CardContent>

        {/* Actions */}
        <CardActions sx={{ p: 2, pt: 0, bgcolor: '#fafafa' }}>
          <Stack direction="column" spacing={1} width="100%">
            {/* Fila 1: Add Member + Delete */}
            <Stack direction="row" spacing={1} width="100%">
              <Button
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => onAddMember(group)}
                fullWidth
                variant="contained"
                sx={{
                  borderRadius: 2,
                  bgcolor: '#8CA551',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#333F1F' },
                }}
              >
                Add Member
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => onDeleteGroup(group._id)}
                fullWidth
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  '&:hover': {
                    borderColor: '#c62828',
                    bgcolor: 'rgba(211, 47, 47, 0.04)',
                  },
                }}
              >
                Delete
              </Button>
            </Stack>

            {/* Fila 2: Share Property — solo si puede gestionar */}
            {canManage && (
              <Button
                size="small"
                startIcon={<ShareIcon />}
                onClick={() => setShareDialogOpen(true)}
                fullWidth
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#8CA551',
                  color: '#333F1F',
                  '&:hover': {
                    borderColor: '#333F1F',
                    bgcolor: 'rgba(140, 165, 81, 0.08)',
                  },
                }}
              >
                Share a Property with this Group
              </Button>
            )}
          </Stack>
        </CardActions>
      </Card>

      {/* Property Share Dialog */}
      <PropertyShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        group={group}
        currentUser={currentUser}
      />
    </motion.div>
  )
}

export default FamilyGroupCard