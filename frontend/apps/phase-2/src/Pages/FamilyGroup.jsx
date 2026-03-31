// @phase-2/src/Pages/FamilyGroup.jsx
import React, { useState } from 'react'
import {
  Container,
  Grid,
  Box,
  Typography,
  Alert,
  Snackbar,
  Paper,
  Button
} from '@mui/material'
import {
  Group as GroupIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// Shared components
import PageHeader from '@shared/components/PageHeader'
import FamilyGroupCard from '@shared/components/FamilyGroup/FamilyGroupCard'
import CreateGroupDialog from '@shared/components/FamilyGroup/CreateGroupDialog'
import ManageGroupDialog from '@shared/components/FamilyGroup/ManageGroupDialog'
import AddMemberDialog from '@shared/components/FamilyGroup/AddMemberDialog'
import ShareDialog from '@shared/components/ResourceShare/ShareDialog'
// Shared hooks
import { useFamilyGroups } from '@shared/hooks/useFamilyGroups'
import { useResidents } from '@shared/hooks/useResidents'
import { useAuth } from '@shared/context/AuthContext'

/**
 * Family Group Management Page for Phase-2
 * Allows users to create and manage family groups for sharing apartments
 */
const FamilyGroup = () => {
  const { t } = useTranslation(['familyGroup', 'common'])
  const { user } = useAuth()

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)

  // Family groups hook
  const {
    groups,
    loading,
    error,
    success,
    operationLoading,
    createGroup,
    deleteGroup,
    addMember,
    removeMember,
    updateMemberRole,
    isGroupAdmin,
    clearAlerts
  } = useFamilyGroups()

  // Residents hook for user selection
  const { users, loading: loadingUsers } = useResidents()

  // Handlers
  const handleCreateGroup = async (name) => {
    const newGroup = await createGroup(name)
    if (newGroup) {
      setCreateDialogOpen(false)
      return true
    }
    return false
  }

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm(t('confirmDeleteGroup', 'Are you sure you want to delete this group?'))) {
      await deleteGroup(groupId)
    }
  }

  const handleOpenManageDialog = (group) => {
    setSelectedGroup(group)
    setManageDialogOpen(true)
  }

  const handleOpenAddMemberDialog = (group) => {
    setSelectedGroup(group)
    setAddMemberDialogOpen(true)
  }

  const handleOpenShareDialog = (group) => {
    setSelectedGroup(group)
    setShareDialogOpen(true)
  }

  const handleAddMember = async (groupId, userId, role) => {
    const result = await addMember(groupId, userId, role)
    if (result) {
      setAddMemberDialogOpen(false)
      return true
    }
    return false
  }

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <Typography variant="h6" color="text.secondary">
            {t('common:loading', 'Loading...')}
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page Header */}
        <PageHeader
          icon={GroupIcon}
          title={t('title', 'Family Groups')}
          subtitle={t('subtitle', 'Manage family groups to share apartments with your loved ones')}
          actionButton={{
            label: t('createGroup', 'Create Group'),
            onClick: () => setCreateDialogOpen(true),
            icon: <AddIcon />,
            tooltip: t('createGroupTooltip', 'Create a new family group')
          }}
        />

        {/* Alerts */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={clearAlerts}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={clearAlerts} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={4000}
          onClose={clearAlerts}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={clearAlerts} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>

        {/* Content */}
        {groups.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 8,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)'
              }}
            >
              <GroupIcon
                sx={{
                  fontSize: 80,
                  color: 'primary.main',
                  opacity: 0.5,
                  mb: 3
                }}
              />
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {t('noGroups', 'No Family Groups Yet')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                {t('noGroupsDescription', 'Create your first family group to start sharing apartments with your family members.')}
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{ borderRadius: 2 }}
              >
                {t('createFirstGroup', 'Create Your First Group')}
              </Button>
            </Paper>
          </motion.div>
        ) : (
          // Groups Grid
          <Grid container spacing={3}>
            <AnimatePresence>
{groups.map((group, index) => {
  const isAdmin = isGroupAdmin(group)
  
  // DEBUG - Temporal para verificar
  console.log('Group:', group.name)
  console.log('Current user ID:', user?._id)
  console.log('Group creator ID:', group.createdBy?._id)
  console.log('Is admin?:', isAdmin)
  console.log('---')
  
  return (
    <Grid item xs={12} sm={6} lg={4} key={group._id}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <FamilyGroupCard
          group={group}
          isAdmin={isAdmin}
          onEdit={() => handleOpenManageDialog(group)}
          onDelete={() => handleDeleteGroup(group._id)}
          onAddMember={() => handleOpenAddMemberDialog(group)}
          onManageMembers={() => handleOpenManageDialog(group)}
          onShare={() => handleOpenShareDialog(group)}
        />
      </motion.div>
    </Grid>
  )
})}
            </AnimatePresence>
          </Grid>
        )}

        {/* Dialogs */}
        
        {/* Create Group Dialog */}
        <CreateGroupDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSubmit={handleCreateGroup}
          loading={operationLoading}
        />

        {/* Manage Group Dialog */}
        <ManageGroupDialog
          open={manageDialogOpen}
          onClose={() => {
            setManageDialogOpen(false)
            setSelectedGroup(null)
          }}
          group={selectedGroup}
          currentUserId={user?._id}
          onRemoveMember={removeMember}
          onUpdateRole={updateMemberRole}
          loading={operationLoading}
        />

        {/* Add Member Dialog */}
        <AddMemberDialog
          open={addMemberDialogOpen}
          onClose={() => {
            setAddMemberDialogOpen(false)
            setSelectedGroup(null)
          }}
          group={selectedGroup}
          availableUsers={users}
          onSubmit={handleAddMember}
          loading={operationLoading}
          loadingUsers={loadingUsers}
        />

        {/* Share Apartment Dialog */}
        <ShareDialog
          open={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false)
            setSelectedGroup(null)
          }}
          resourceType="apartment"
          preSelectedGroup={selectedGroup}
        />
      </motion.div>
    </Container>
  )
}

export default FamilyGroup