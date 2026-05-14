import { useState, useEffect } from 'react'
import {
  Box, Autocomplete, TextField, Chip, CircularProgress
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { People as PeopleIcon } from '@mui/icons-material'
import api from '@shared/services/api'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'

const CrossProjectResidentDialog = ({ open, onClose, currentProjectId, onSelectUser }) => {
  const { t } = useTranslation(['residents', 'common'])
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Cargar proyectos al abrir
  useEffect(() => {
    if (open) {
      fetchProjects()
    } else {
      // Reset al cerrar
      setSelectedProject(null)
      setSelectedUser(null)
      setUsers([])
    }
  }, [open])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await api.get('/projects')
      // Filtrar proyectos diferentes al actual
      const otherProjects = res.data.filter(p => p._id !== currentProjectId)
      setProjects(otherProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar usuarios cuando se selecciona un proyecto
  useEffect(() => {
    if (selectedProject?._id) {
      fetchUsers(selectedProject._id)
    } else {
      setUsers([])
      setSelectedUser(null)
    }
  }, [selectedProject])

  const fetchUsers = async (projectId) => {
    setLoadingUsers(true)
    try {
      const res = await api.get('/users', { params: { projectId } })
      setUsers(res.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleConfirm = async () => {
    if (selectedUser) {
      setSubmitting(true)
      try {
        onSelectUser(selectedUser)
        onClose()
      } finally {
        setSubmitting(false)
      }
    }
  }

  const actions = [
    <PrimaryButton
      key="cancel"
      variant="outlined"
      onClick={onClose}
      sx={{
        borderColor: '#706f6f',
        color: '#706f6f',
        '&:hover': {
          bgcolor: 'rgba(112, 111, 111, 0.08)',
          borderColor: '#706f6f'
        }
      }}
    >
      {t('common:cancel', 'Cancelar')}
    </PrimaryButton>,
    <PrimaryButton
      key="confirm"
      loading={submitting}
      disabled={!selectedUser || loadingUsers}
      onClick={handleConfirm}
    >
      {t('residents:selectResident', 'Seleccionar')}
    </PrimaryButton>
  ]

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={PeopleIcon}
      title={t('residents:selectFromOtherProject', 'Seleccionar Residente de Otro Proyecto')}
      subtitle={t('residents:selectFromOtherProjectDesc', 'Asignar un residente que pertenece a otro proyecto')}
      actions={actions}
      maxWidth="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Autocomplete de proyecto */}
        <Autocomplete
          fullWidth
          options={projects}
          getOptionLabel={(option) => option.name || ''}
          value={selectedProject}
          onChange={(event, newValue) => setSelectedProject(newValue)}
          loading={loading}
          disabled={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('residents:project', 'Proyecto')}
              helperText={t('residents:selectProjectResident', 'Selecciona el proyecto del residente')}
              placeholder={t('residents:searchByName', 'Busca por nombre...')}
            />
          )}
          filterOptions={(options, state) => {
            const inputValue = state.inputValue.toLowerCase()
            return options.filter(option =>
              option.name.toLowerCase().includes(inputValue) ||
              (option.slug && option.slug.toLowerCase().includes(inputValue))
            )
          }}
          noOptionsText={t('residents:noOtherProjects', 'No hay otros proyectos disponibles')}
          isOptionEqualToValue={(option, value) => option._id === value?._id}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Box>{option.name}</Box>
                {option.slug && (
                  <Chip 
                    label={option.slug} 
                    size="small" 
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}
        />

        {/* Autocomplete de usuario */}
        {selectedProject && (
          <Autocomplete
            fullWidth
            options={users}
            getOptionLabel={(option) => 
              `${option.firstName} ${option.lastName} - ${option.email}${option.phoneNumber ? ` 📱 ${option.phoneNumber}` : ''}`
            }
            value={selectedUser}
            onChange={(event, newValue) => setSelectedUser(newValue)}
            loading={loadingUsers}
            disabled={loadingUsers}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('residents:resident', 'Residente')}
                helperText={t('residents:selectResidentToAssign', 'Selecciona el residente a asignar')}
                placeholder={t('residents:searchByNameOrEmail', 'Busca por nombre o correo...')}
              />
            )}
            filterOptions={(options, state) => {
              const inputValue = state.inputValue.toLowerCase()
              return options.filter(option =>
                `${option.firstName} ${option.lastName}`.toLowerCase().includes(inputValue) ||
                option.email.toLowerCase().includes(inputValue) ||
                (option.phoneNumber && option.phoneNumber.includes(inputValue))
              )
            }}
            noOptionsText={t('residents:noResidentsInProject', 'No hay residentes en este proyecto')}
            isOptionEqualToValue={(option, value) => option._id === value?._id}
          />
        )}
      </Box>
    </ModalWrapper>
  )
}

export default CrossProjectResidentDialog