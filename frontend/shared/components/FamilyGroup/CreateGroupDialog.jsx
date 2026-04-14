import React, { useState, useEffect } from 'react'
import { TextField, Box } from '@mui/material'
import GroupIcon from '@mui/icons-material/Group'
import ModalWrapper from '../../constants/ModalWrapper'
import PrimaryButton from '../../constants/PrimaryButton'
import { useTranslation } from 'react-i18next'

export const CreateGroupDialog = ({
  open,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [groupName, setGroupName] = useState('')
  const [error, setError] = useState('')
  const { t } = useTranslation(['family', 'common'])

  useEffect(() => {
    if (!open) {
      setGroupName('')
      setError('')
    }
  }, [open])

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      setError(t('family:groupNameRequired', 'Group name is required'))
      return
    }
    const success = await onSubmit(groupName.trim())
    if (success) {
      setGroupName('')
      setError('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={GroupIcon}
      title={t('family:createGroupTitle', 'Create Family Group')}
      subtitle={t('family:createGroupSubtitle', 'Create a group to share resources with family members')}
      actions={[
        <PrimaryButton key="cancel" onClick={onClose} disabled={loading} variant="outlined">
          {t('common:cancel', 'Cancel')}
        </PrimaryButton>,
        <PrimaryButton
          key="create"
          loading={loading}
          onClick={handleSubmit}
          disabled={loading || !groupName.trim()}
          startIcon={<GroupIcon />}
        >
          {t('family:createGroup', 'Create Group')}
        </PrimaryButton>
      ]}
      maxWidth="sm"
    >
      <TextField
        autoFocus
        fullWidth
        label={t('family:groupName', 'Group Name')}
        placeholder={t('family:groupNamePlaceholder', 'e.g., García Family')}
        value={groupName}
        onChange={(e) => {
          setGroupName(e.target.value)
          setError('')
        }}
        onKeyPress={handleKeyPress}
        error={!!error}
        helperText={error || t('family:groupNameHelper', 'Choose a descriptive name for your family group')}
        disabled={loading}
        sx={{ mt: 2 }}
      />
    </ModalWrapper>
  )
}

export default CreateGroupDialog