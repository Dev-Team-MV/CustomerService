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
import PrimaryButton from '../../constants/PrimaryButton'
import { useTranslation } from 'react-i18next'

const FamilyGroupCard = ({
  group,
  currentUser,
  isAdmin,
  onAddMember,
  onRemoveMember,
  onDeleteGroup,
  index = 0
}) => {
  const { t } = useTranslation('familyGroup')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  // El admin del grupo es quien lo creó (createdBy) o quien tiene rol admin en members
  // También superadmin ve todo
  // Soporte para _id o id (depende del AuthContext)
  const currentUserId = currentUser?._id || currentUser?.id

  const isGroupOwner = group.createdBy._id === currentUserId
  const isMemberAdmin = group.members.some(
    (m) => m.user._id === currentUserId && m.role === 'admin'
  )
  const canManage = isGroupOwner || isMemberAdmin
  const creatorName = group.createdBy?.firstName || group.createdBy?.name || '';

  // DEBUG — quitar después de verificar

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
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
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
              <Typography variant="h6">
                {group.name}
              </Typography>
            </Box>
            {isGroupOwner && (
              <Chip label={t('owner')} size="small" color="primary" sx={{ height: 24 }} />
            )}
          </Box>

          {/* Created By */}
          <Typography variant="caption" sx={{ color: '#706f6f', display: 'block', mb: 2 }}>
            {t('createdBy', { name: creatorName })}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Members Section */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            {t('members', { count: group.members.length })}
          </Typography>

          <List
            dense
            sx={{
              maxHeight: 200,
              overflow: 'auto',
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-thumb': { bgcolor: '#8CA551', borderRadius: 3 },
            }}
          >
            {group.members.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3, color: '#706f6f' }}>
                <Typography variant="caption">
                  {t('noMembers')}
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
                  <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: '#8CA551', fontSize: '0.875rem', fontWeight: 600 }}>
                    {member.user.firstName[0]}
                  </Avatar>
                  <ListItemText
                    primary={`${member.user.firstName} ${member.user.lastName}`}
                    secondary={member.user.email}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Chip
                      icon={member.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                      label={t(member.role)}
                      size="small"
                      color={member.role === 'admin' ? "primary" : "default"}
                      sx={{ height: 24 }}
                    />
                    {canManage && member.user._id !== group.createdBy._id && (
                      <IconButton
                        size="small"
                        onClick={() => onRemoveMember(group._id, member.user._id)}
                        sx={{ ml: 1, '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' } }}
                        aria-label={t('removeMember')}
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
          {canManage ? (
            <Stack direction="column" spacing={1} width="100%">
              <Stack direction="row" spacing={1} width="100%">
                {/* Agregar Miembro: fondo verde */}
                <PrimaryButton
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => onAddMember(group)}
                  fullWidth
                  color="primary"
                  variant="contained"
                >
                  {t('addMember')}
                </PrimaryButton>
                {/* Delete: fondo blanco, borde rojo, texto rojo */}
                <PrimaryButton
                  size="small"
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDeleteGroup(group._id)}
                  fullWidth
                >
                  {t('delete')}
                </PrimaryButton>
              </Stack>
              {/* Compartir: fondo blanco, borde verde, texto verde */}
              <PrimaryButton
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={<ShareIcon />}
                onClick={() => setShareDialogOpen(true)}
                fullWidth
              >
                {t('shareProperty')}
              </PrimaryButton>
            </Stack>
          ) : (
            <Typography variant="caption" sx={{ color: '#706f6f', px: 1 }}>
              {t('memberOfGroup')}
            </Typography>
          )}
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