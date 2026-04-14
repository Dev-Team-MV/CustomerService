// import React, { useState, useEffect } from 'react'
// import {
//   Box, Typography, Autocomplete, TextField, FormControl, FormLabel, RadioGroup, Radio, Avatar, CircularProgress
// } from '@mui/material'
// import { PersonAdd, AdminPanelSettings, Person } from '@mui/icons-material'
// import ModalWrapper from '../../constants/ModalWrapper'
// import PrimaryButton from '../../constants/PrimaryButton'
// import { useTranslation } from 'react-i18next'

// export const AddMemberDialog = ({
//   open,
//   onClose,
//   group,
//   availableUsers = [],
//   onSubmit,
//   loading = false,
//   loadingUsers = false,
//   onSearchUsers
// }) => {
//   const [selectedUser, setSelectedUser] = useState(null)
//   const [role, setRole] = useState('member')
//   const [searchQuery, setSearchQuery] = useState('')
//   const { t } = useTranslation(['familyGroup', 'common'])

//   useEffect(() => {
//     if (!open) {
//       setSelectedUser(null)
//       setRole('member')
//     }
//   }, [open])

//   const handleSubmit = async () => {
//     if (!selectedUser) return
//     const success = await onSubmit(group._id, selectedUser._id, role)
//     if (success) {
//       setSelectedUser(null)
//       setRole('member')
//     }
//   }

//   // Filter out users already in the group
//   const filteredUsers = group ? availableUsers.filter(user => {
//     const isCreator = group.createdBy?._id === user._id
//     const isMember = group.members?.some(m => m.user?._id === user._id)
//     return !isCreator && !isMember
//   }) : availableUsers

//   return (
//     <ModalWrapper
//       open={open}
//       onClose={onClose}
//       icon={PersonAdd}
//       title={t('familyGroup:addMemberTitle', 'Add Member')}
//       subtitle={t('familyGroup:addMemberSubtitle', { group: group?.name }, 'Add a member to {{group}}')}
//       actions={[
//         <PrimaryButton key="cancel" onClick={onClose} disabled={loading} variant="outlined">
//           {t('common:cancel', 'Cancel')}
//         </PrimaryButton>,
//         <PrimaryButton
//           key="add"
//           loading={loading}
//           onClick={handleSubmit}
//           disabled={loading || !selectedUser}
//           startIcon={<PersonAdd />}
//         >
//           {t('familyGroup:addMember', 'Add Member')}
//         </PrimaryButton>
//       ]}
//       maxWidth="sm"
//     >
//       <Box sx={{ mt: 2 }}>
//         {/* User Selection */}
//         <Autocomplete
//           value={selectedUser}
//           onChange={(_, newValue) => setSelectedUser(newValue)}
//           onInputChange={(_, newInputValue) => {
//             setSearchQuery(newInputValue)
//             if (onSearchUsers && newInputValue.length >= 2) {
//               onSearchUsers(newInputValue)
//             } else if (onSearchUsers && newInputValue.length < 2) {
//               onSearchUsers('')
//             }
//           }}
//           options={filteredUsers}
//           getOptionLabel={(option) =>
//             `${option.firstName} ${option.lastName} (${option.email})`
//           }
//           loading={loadingUsers}
//           disabled={loading}
//           // filterOptions={(x) => x}
//           filterOptions={onSearchUsers ? (x) => x : undefined}
//           renderInput={(params) => (
//             <TextField
//               {...params}
//               label={t('familyGroup:selectUser', 'Select User')}
//               placeholder={t('familyGroup:searchUserPlaceholder', 'Search by name or email (min 2 chars)')}
//               InputProps={{
//                 ...params.InputProps,
//                 endAdornment: (
//                   <>
//                     {loadingUsers ? <CircularProgress size={20} /> : null}
//                     {params.InputProps.endAdornment}
//                   </>
//                 )
//               }}
//             />
//           )}
//           renderOption={(props, option) => (
//             <Box component="li" {...props} display="flex" alignItems="center" gap={2}>
//               <Avatar sx={{ width: 32, height: 32 }}>
//                 {option.firstName?.[0]}{option.lastName?.[0]}
//               </Avatar>
//               <Box>
//                 <Typography variant="body2">
//                   {option.firstName} {option.lastName}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {option.email}
//                 </Typography>
//               </Box>
//             </Box>
//           )}
//         />

//         {/* Role Selection */}
//         <FormControl component="fieldset" sx={{ mt: 3 }}>
//           <FormLabel component="legend">{t('familyGroup:memberRole', 'Member Role')}</FormLabel>
//           <RadioGroup
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//           >
//             <Box display="flex" flexDirection="column" gap={1} mt={1}>
//               <Box
//                 sx={{
//                   border: '1px solid',
//                   borderColor: role === 'member' ? 'primary.main' : 'divider',
//                   borderRadius: 2,
//                   p: 2,
//                   cursor: 'pointer',
//                   transition: 'all 0.2s',
//                   '&:hover': { borderColor: 'primary.main' }
//                 }}
//                 onClick={() => setRole('member')}
//               >
//                 <Box display="flex" alignItems="center" justifyContent="space-between">
//                   <Box display="flex" alignItems="center" gap={2}>
//                     <Person color={role === 'member' ? 'primary' : 'action'} />
//                     <Box>
//                       <Typography variant="body1" fontWeight={600}>
//                         {t('familyGroup:member', 'Member')}
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         {t('familyGroup:memberDesc', 'Can view shared resources')}
//                       </Typography>
//                     </Box>
//                   </Box>
//                   <Radio value="member" checked={role === 'member'} />
//                 </Box>
//               </Box>

//               <Box
//                 sx={{
//                   border: '1px solid',
//                   borderColor: role === 'admin' ? 'primary.main' : 'divider',
//                   borderRadius: 2,
//                   p: 2,
//                   cursor: 'pointer',
//                   transition: 'all 0.2s',
//                   '&:hover': { borderColor: 'primary.main' }
//                 }}
//                 onClick={() => setRole('admin')}
//               >
//                 <Box display="flex" alignItems="center" justifyContent="space-between">
//                   <Box display="flex" alignItems="center" gap={2}>
//                     <AdminPanelSettings color={role === 'admin' ? 'primary' : 'action'} />
//                     <Box>
//                       <Typography variant="body1" fontWeight={600}>
//                         {t('familyGroup:admin', 'Admin')}
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         {t('familyGroup:adminDesc', 'Can manage group and share resources')}
//                       </Typography>
//                     </Box>
//                   </Box>
//                   <Radio value="admin" checked={role === 'admin'} />
//                 </Box>
//               </Box>
//             </Box>
//           </RadioGroup>
//         </FormControl>
//       </Box>
//     </ModalWrapper>
//   )
// }

// export default AddMemberDialog

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Autocomplete, TextField, FormControl, FormLabel, RadioGroup, Radio, Avatar, CircularProgress
} from '@mui/material'
import { PersonAdd, AdminPanelSettings, Person } from '@mui/icons-material'
import ModalWrapper from '../../constants/ModalWrapper'
import PrimaryButton from '../../constants/PrimaryButton'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

export const AddMemberDialog = ({
  open,
  onClose,
  group,
  availableUsers = [],
  onSubmit,
  loading = false,
  loadingUsers = false,
  onSearchUsers,
  projectId
}) => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [role, setRole] = useState('member')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const { t } = useTranslation(['familyGroup', 'common'])

  useEffect(() => {
    if (!open) {
      setSelectedUser(null)
      setRole('member')
      setSearchQuery('')
      setSearchResults([])
    }
  }, [open])

  useEffect(() => {
    if (open && projectId) {
      setSearching(true)
      api.get('/users/search', { params: { projectId } })
        .then(res => setSearchResults(res.data))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false))
    }
  }, [open, projectId])
  const handleInputChange = useCallback(async (query) => {
    setSearchQuery(query)
    if (!query || query.length < 2) {
      if (projectId && open) {
        setSearching(true)
        api.get('/users/search', { params: { projectId } })
          .then(res => setSearchResults(res.data))
          .catch(() => setSearchResults([]))
          .finally(() => setSearching(false))
      }
      return
    }
    if (onSearchUsers) {
      onSearchUsers(query)
      return
    }
    if (projectId) {
      setSearching(true)
      try {
        const res = await api.get('/users/search', { params: { projectId, query } })
        setSearchResults(res.data)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }
  }, [projectId, onSearchUsers, open])

  const handleSubmit = async () => {
    if (!selectedUser) return
    const success = await onSubmit(group._id, selectedUser._id, role)
    if (success) {
      setSelectedUser(null)
      setRole('member')
    }
  }

  const baseOptions = searchResults.length > 0 ? searchResults : availableUsers

  const filteredUsers = group ? baseOptions.filter(user => {
    const isCreator = group.createdBy?._id === user._id
    const isMember = group.members?.some(m => m.user?._id === user._id)
    return !isCreator && !isMember
  }) : baseOptions

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={PersonAdd}
      title={t('familyGroup:addMemberTitle', 'Add Member')}
      subtitle={t('familyGroup:addMemberSubtitle', { group: group?.name }, 'Add a member to {{group}}')}
      actions={[
        <PrimaryButton key="cancel" onClick={onClose} disabled={loading} variant="outlined">
          {t('common:cancel', 'Cancel')}
        </PrimaryButton>,
        <PrimaryButton
          key="add"
          loading={loading}
          onClick={handleSubmit}
          disabled={loading || !selectedUser}
          startIcon={<PersonAdd />}
        >
          {t('familyGroup:addMember', 'Add Member')}
        </PrimaryButton>
      ]}
      maxWidth="sm"
    >
      <Box sx={{ mt: 2 }}>
        {/* User Selection */}
        <Autocomplete
          value={selectedUser}
          onChange={(_, newValue) => setSelectedUser(newValue)}
          onInputChange={(_, newInputValue) => handleInputChange(newInputValue)}
          options={filteredUsers}
          getOptionLabel={(option) =>
            `${option.firstName} ${option.lastName} (${option.email})`
          }
          loading={loadingUsers || searching}
          disabled={loading}
          filterOptions={(x) => x}
          noOptionsText={
            searching
              ? t('common:searching', 'Searching...')
              : t('familyGroup:noUsersFound', 'No users found')
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('familyGroup:selectUser', 'Select User')}
              placeholder={t('familyGroup:searchUserPlaceholder', 'Search by name or email')}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {(loadingUsers || searching) ? <CircularProgress size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props} display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {option.firstName?.[0]}{option.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body2">
                  {option.firstName} {option.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.email}
                </Typography>
              </Box>
            </Box>
          )}
        />

        {/* Role Selection */}
        <FormControl component="fieldset" sx={{ mt: 3 }}>
          <FormLabel component="legend">{t('familyGroup:memberRole', 'Member Role')}</FormLabel>
          <RadioGroup
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <Box display="flex" flexDirection="column" gap={1} mt={1}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: role === 'member' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.main' }
                }}
                onClick={() => setRole('member')}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={2}>
                    <Person color={role === 'member' ? 'primary' : 'action'} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {t('familyGroup:member', 'Member')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('familyGroup:memberDesc', 'Can view shared resources')}
                      </Typography>
                    </Box>
                  </Box>
                  <Radio value="member" checked={role === 'member'} />
                </Box>
              </Box>

              <Box
                sx={{
                  border: '1px solid',
                  borderColor: role === 'admin' ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  p: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.main' }
                }}
                onClick={() => setRole('admin')}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={2}>
                    <AdminPanelSettings color={role === 'admin' ? 'primary' : 'action'} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {t('familyGroup:admin', 'Admin')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('familyGroup:adminDesc', 'Can manage group and share resources')}
                      </Typography>
                    </Box>
                  </Box>
                  <Radio value="admin" checked={role === 'admin'} />
                </Box>
              </Box>
            </Box>
          </RadioGroup>
        </FormControl>
      </Box>
    </ModalWrapper>
  )
}

export default AddMemberDialog