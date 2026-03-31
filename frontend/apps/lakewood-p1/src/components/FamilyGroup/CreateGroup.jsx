import React from 'react'
import { TextField, Typography } from '@mui/material'
import { Close as CloseIcon, Group as GroupIcon } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'

const CreateGroupDialog = ({
  open,
  onClose,
  groupName,
  onGroupNameChange,
  onSubmit
}) => {
  const { t } = useTranslation('familyGroup')
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && groupName.trim()) {
      onSubmit()
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={GroupIcon}
      title={t('createFamilyGroup')}
      actions={
        <>
          <PrimaryButton
            onClick={onSubmit}
            disabled={!groupName.trim()}
          >
            {t('create')}
          </PrimaryButton>
        </>
      }
      maxWidth="sm"
      fullWidth
    >
      <TextField
        autoFocus
        margin="dense"
        label={t('groupName')}
        fullWidth
        value={groupName}
        onChange={onGroupNameChange}
        onKeyPress={handleKeyPress}
        placeholder={t('groupNamePlaceholder')}
      />
    </ModalWrapper>
  )
}

export default CreateGroupDialog