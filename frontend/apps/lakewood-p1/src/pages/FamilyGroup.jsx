import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Typography
} from '@mui/material'
import {
  Add as AddIcon,
  Group as GroupIcon
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import familyGroupService from '../services/familyGroup'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import FamilyGroupCard from '../components/FamilyGroup/FamilyGroupCard'
import CreateGroupDialog from '../components/FamilyGroup/CreateGroup'
import AddMemberDialog from '../components/FamilyGroup/AddMemberFamily'
import Loader from '../components/Loader'
const FamilyGroup = () => {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)

  // Form states
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [memberRole, setMemberRole] = useState('member')

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const data = await familyGroupService.getFamilyGroups()
      setGroups(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load family groups')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (err) {
      console.error('Failed to load users:', err)
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setError('Group name is required')
      return
    }

    try {
      await familyGroupService.createFamilyGroup(newGroupName)
      setSuccess('Family group created successfully')
      setNewGroupName('')
      setCreateDialogOpen(false)
      loadGroups()
    } catch (err) {
      setError(err.message || 'Failed to create group')
    }
  }

  const handleAddMemberClick = (group) => {
    setSelectedGroup(group)
    setAddMemberDialogOpen(true)
  }

  const handleAddMember = async () => {
    if (!selectedUser) {
      setError('Please select a user')
      return
    }

    try {
      await familyGroupService.addMemberToGroup(
        selectedGroup._id,
        selectedUser._id,
        memberRole
      )
      setSuccess('Member added successfully')
      setSelectedUser(null)
      setMemberRole('member')
      setAddMemberDialogOpen(false)
      loadGroups()
    } catch (err) {
      setError(err.message || 'Failed to add member')
    }
  }

  const handleRemoveMember = async (groupId, userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return

    try {
      await familyGroupService.removeMemberFromGroup(groupId, userId)
      setSuccess('Member removed successfully')
      loadGroups()
    } catch (err) {
      setError(err.message || 'Failed to remove member')
    }
  }

  const handleDeleteGroup = async (groupId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this group? This will remove all shared properties.'
      )
    )
      return

    try {
      await familyGroupService.deleteFamilyGroup(groupId)
      setSuccess('Family group deleted successfully')
      loadGroups()
    } catch (err) {
      setError(err.message || 'Failed to delete group')
    }
  }

  const isGroupAdmin = (group) => {
    if (user?.role === 'superadmin') return true
    if (group.createdBy._id === user?._id) return true
    return group.members.some(
      (m) => m.user._id === user?._id && m.role === 'admin'
    )
  }

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
          message="Loading family groups..."
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
        {/* Page Header */}
        <PageHeader
          icon={GroupIcon}
          title="Family Groups"
          subtitle="Manage your family groups and share properties"
          actionButton={{
            label: 'Create Group',
            onClick: () => setCreateDialogOpen(true),
            icon: <AddIcon />,
            tooltip: 'Create a new family group'
          }}
        />

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{ mb: 3 }}
              >
                {error}
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
                onClose={() => setSuccess(null)}
                sx={{ mb: 3 }}
              >
                {success}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Groups Grid */}
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
                No family groups yet
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#706f6f',
                  mb: 3,
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                Create your first family group to start sharing properties
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  borderRadius: 3,
                  bgcolor: '#333F1F',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#8CA551',
                  },
                }}
              >
                Create Your First Group
              </Button>
            </motion.div>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {groups.map((group, index) => (
              <Grid item xs={12} md={6} lg={4} key={group._id}>
                <FamilyGroupCard
                  group={group}
                  currentUser={user}
                  isAdmin={isGroupAdmin(group)}
                  onAddMember={handleAddMemberClick}
                  onRemoveMember={handleRemoveMember}
                  onDeleteGroup={handleDeleteGroup}
                  index={index}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Dialogs */}
        <CreateGroupDialog
          open={createDialogOpen}
          onClose={() => {
            setCreateDialogOpen(false)
            setNewGroupName('')
          }}
          groupName={newGroupName}
          onGroupNameChange={(e) => setNewGroupName(e.target.value)}
          onSubmit={handleCreateGroup}
        />

    <AddMemberDialog
      open={addMemberDialogOpen}
      onClose={() => {
        setAddMemberDialogOpen(false)
        setSelectedUser(null)
        setMemberRole('member')
      }}
      groupName={selectedGroup?.name}
      existingMembers={selectedGroup?.members || []}
      selectedUser={selectedUser}
      onUserChange={(e, newValue) => setSelectedUser(newValue)}
      memberRole={memberRole}
      onRoleChange={(e) => setMemberRole(e.target.value)}
      onSubmit={handleAddMember}
    />
      </motion.div>
    </Container>
  )
}

export default FamilyGroup