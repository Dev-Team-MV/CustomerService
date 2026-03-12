import React from 'react'
import {
  Box,
  Container,
  Grid,
  Alert,
  Paper,
  Typography
} from '@mui/material'
import {
  Add as AddIcon,
  Group as GroupIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/PageHeader'
import FamilyGroupCard from '../components/FamilyGroup/FamilyGroupCard'
import CreateGroupDialog from '../components/FamilyGroup/CreateGroup'
import AddMemberDialog from '../components/FamilyGroup/AddMemberFamily'
import Loader from '../components/Loader'
import { useTranslation } from 'react-i18next'
import useModalState from '@shared/hooks/useModalState'
import { useResidents } from '@shared/hooks/useResidents'
import { useFamilyGroup } from '../hooks/useFamilyGroup'

const FamilyGroup = () => {
  const { t } = useTranslation('familyGroup')
  const createGroupModal = useModalState('')
  const addMemberModal = useModalState({ group: null, user: null, role: 'member' })
  
  const {
    groups,
    loading,
    error,
    success,
    handleCreateGroup,
    handleAddMember,
    handleRemoveMember,
    handleDeleteGroup,
    isGroupAdmin,
    clearAlerts,
  } = useFamilyGroup()

  const { users, loading: usersLoading, getAvailableUsers } = useResidents()

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Loader
          size="large"
          message={t('loading')}
          fullHeight={false}
        />
      </Box>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageHeader
          icon={GroupIcon}
          title={t('title')}
          subtitle={t('subtitle')}
          actionButton={{
            label: t('createGroup'),
            onClick: () => createGroupModal.openModal(),
            icon: <AddIcon />,
            tooltip: t('createGroupTooltip')
          }}
        />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert
                severity="error"
                onClose={clearAlerts}
                sx={{ mb: 3 }}
              >
                {t(error)}
              </Alert>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert
                severity="success"
                onClose={clearAlerts}
                sx={{ mb: 3 }}
              >
                {t(success)}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {groups.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <GroupIcon
                sx={{ fontSize: 80, color: '#8CA551', mb: 2, opacity: 0.7 }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: '#333F1F',
                  fontWeight: 600,
                  mb: 1,
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {t('noGroups')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#706f6f',
                  mb: 3,
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                {t('noGroupsDescription')}
              </Typography>
              <button
                variant="contained"
                starticon={<AddIcon />}
                onClick={() => createGroupModal.openModal()}
                style={{
                  borderRadius: 12,
                  background: '#333F1F',
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'none',
                  padding: '12px 24px',
                  marginTop: '16px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {t('createFirstGroup')}
              </button>
            </motion.div>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {groups.map((group, index) => (
              <Grid item xs={12} md={6} lg={4} key={group._id}>
                <FamilyGroupCard
                  group={group}
                  currentUser={group.createdBy}
                  isAdmin={isGroupAdmin(group)}
                  onAddMember={g => addMemberModal.openModal({ group: g, user: null, role: 'member' })}
                  onRemoveMember={handleRemoveMember}
                  onDeleteGroup={handleDeleteGroup}
                  index={index}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <CreateGroupDialog
          open={createGroupModal.open}
          onClose={createGroupModal.closeModal}
          groupName={createGroupModal.data}
          onGroupNameChange={e => createGroupModal.setData(e.target.value)}
          onSubmit={() => handleCreateGroup(createGroupModal.data, createGroupModal.closeModal)}
          title={t('createGroupDialogTitle')}
          submitLabel={t('createGroupDialogSubmit')}
        />

        <AddMemberDialog
          open={addMemberModal.open}
          onClose={addMemberModal.closeModal}
          groupName={addMemberModal.data.group?.name}
          existingMembers={addMemberModal.data.group?.members || []}
          selectedUser={addMemberModal.data.user}
          onUserChange={(e, newValue) => addMemberModal.setData({ ...addMemberModal.data, user: newValue })}
          memberRole={addMemberModal.data.role}
          onRoleChange={e => addMemberModal.setData({ ...addMemberModal.data, role: e.target.value })}
          onSubmit={() =>
            handleAddMember(
              addMemberModal.data.group,
              addMemberModal.data.user,
              addMemberModal.data.role,
              addMemberModal.closeModal
            )
          }
          title={t('addMemberDialogTitle')}
          submitLabel={t('addMemberDialogSubmit')}
          users={getAvailableUsers(addMemberModal.data.group)}
          usersLoading={usersLoading}
        />
      </motion.div>
    </Container>
  )
}

export default FamilyGroup