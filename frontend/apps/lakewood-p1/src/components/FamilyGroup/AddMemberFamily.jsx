import React, { useState, useCallback } from 'react'
import {
  TextField,
  Stack,
  Autocomplete,
  Typography,
  CircularProgress
} from '@mui/material'
import { PersonAdd as PersonAddIcon } from '@mui/icons-material'
import api from '@shared/services/api'
import { useTranslation } from 'react-i18next'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'

const AddMemberDialog = ({
  open,
  onClose,
  groupName,
  existingMembers,
  selectedUser,
  onUserChange,
  memberRole,
  onRoleChange,
  onSubmit
}) => {
  const { t } = useTranslation('familyGroup')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const searchUsers = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }
    try {
      setSearching(true)
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`)
      const filtered = response.data.filter(
        (u) => !existingMembers.some((m) => m.user._id === u._id)
      )
      setSearchResults(filtered)
    } catch (err) {
      console.error('Error searching users:', err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [existingMembers])

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue)
    searchUsers(newInputValue)
  }

  const handleClose = () => {
    setSearchResults([])
    setInputValue('')
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      icon={PersonAddIcon}
      title={t('addMemberToGroup', { group: groupName })}
      actions={
        <>
          <PrimaryButton
            onClick={onSubmit}
            disabled={!selectedUser}
          >
            {t('addMember')}
          </PrimaryButton>
        </>
      }
      maxWidth="sm"
      fullWidth
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        <Autocomplete
          options={searchResults}
          getOptionLabel={(option) =>
            `${option.firstName} ${option.lastName} (${option.email})`
          }
          value={selectedUser}
          onChange={onUserChange}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          loading={searching}
          noOptionsText={
            inputValue.length < 2
              ? t('typeAtLeast2Chars')
              : t('noUsersFound')
          }
          filterOptions={(x) => x}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('searchUser')}
              placeholder={t('searchUserPlaceholder')}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {searching ? <CircularProgress size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <TextField
          select
          label="Role"
          value={memberRole}
          onChange={onRoleChange}
          SelectProps={{ native: true }}
        >
          <option value="member">{t('member')}</option>
          <option value="admin">{t('admin')}</option>
        </TextField>
      </Stack>
    </ModalWrapper>
  )
}

export default AddMemberDialog