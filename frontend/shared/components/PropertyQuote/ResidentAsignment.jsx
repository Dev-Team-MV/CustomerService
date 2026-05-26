import { useEffect, useState, useMemo } from 'react'
import {
  Box, Paper, Typography, TextField, MenuItem, Collapse, Alert, Button, CircularProgress, Tooltip, Autocomplete
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import PersonIcon from '@mui/icons-material/Person'
import { usePropertyBuilding } from '../../context/ProperyQuoteContext'
import buildingService from '@shared/services/buildingService'
import propertyService from '@shared/services/propertyService'
import ResidentDialog from '@shared/components/Modals/ResidentDialog'
import { useResidents } from '@shared/hooks/useResidents'
import { useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import CrossProjectResidentDialog from '@shared/components/Modals/CroosProjectsResidentDialog'

const ResidentAsignment = ({ expanded, onToggle,onBack, facadeEnabled = true  }) => {
const {
  selectedBuilding,
  selectedApartment,
  apartmentType,
  selectedFloor,
  financials,
  selectedProject, setSelectedProject,
  projects, loadingProjects, refreshProjects, 
  selectedRenderType, setSelectedRenderType,
  selectedOptions  // AGREGAR
} = usePropertyBuilding()

  const theme = useTheme()
  const { t } = useTranslation(['quote', 'common'])
  const navigate = useNavigate()
  const residentsProjectId = selectedProject || import.meta.env.VITE_PROJECT_ID

const {
  users: projectUsers, loading,
  openDialog, selectedUser, setSelectedUser, formData, setFormData,
  handleOpenDialog, handleCloseDialog, handleSubmit,
  handleFieldChange, handlePhoneChange, isFormValid,
  e164Value, displayVal, isPhoneValid
} = useResidents(residentsProjectId)
 
// ✅ Estado para incluir usuarios cross-project
const [crossProjectUsers, setCrossProjectUsers] = useState([])
 
// ✅ Combinar usuarios del proyecto + cross-project
const users = useMemo(() => {
  const allUsers = [...projectUsers, ...crossProjectUsers]
  return Array.from(new Map(allUsers.map(u => [u._id, u])).values())
}, [projectUsers, crossProjectUsers])
 
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [openCrossProjectDialog, setOpenCrossProjectDialog] = useState(false) // ✅ NUEVO


  useEffect(() => {
    if (expanded && (!projects || projects.length === 0)) refreshProjects?.()
  }, [expanded])

// ✅ Detectar si es house usando quoteRef en lugar de floorNumber
const isHouse = Boolean(selectedBuilding?.quoteRef?.lot && selectedBuilding?.quoteRef?.model)
const hasQuoteRef = isHouse
 
// ✅ Validación adaptada para houses y apartments
const isReady = isHouse
  ? (selectedBuilding && hasQuoteRef && selectedUser && financials?.presalePrice)
  : (selectedBuilding && selectedApartment && selectedFloor && selectedUser && selectedProject && financials?.presalePrice)

const handleAssign = async () => {
  setSubmitting(true)
  setError('')
  setSuccess('')
  try {
    if (!isReady) {
      setError(t('quote:missingSelections', 'Missing required selections.'))
      setSubmitting(false)
      return
    }

    let payload

if (isHouse) {
  // ✅ NO transformar selectedOptions - enviar en formato original
  payload = {
    projectId: selectedProject || selectedBuilding.projectId || import.meta.env.VITE_PROJECT_ID,
    buildingId: selectedBuilding._id,
    lot: selectedBuilding.quoteRef.lot,
    model: selectedBuilding.quoteRef.model,
    userId: selectedUser._id,
    users: [selectedUser._id],
    initialPayment: financials.initialDownPayment,
    price: financials.presalePrice,
    status: 'pending',
    selectedRenderType: selectedRenderType || 'basic',
    selectedOptions: selectedOptions || {},  // ✅ Enviar sin transformar
  }
 
  // Solo incluir facade si está habilitado
  if (facadeEnabled && selectedBuilding.quoteRef?.facade) {
    payload.facade = selectedBuilding.quoteRef.facade
  }
 
  console.log('📤 Creando propiedad (house) con selectedOptions transformado:', payload)
  await propertyService.createProperty(payload)
  setSuccess('¡Propiedad creada y asignada exitosamente!')
} else {
      payload = {
        projectId: selectedProject,
        apartmentModelId: selectedApartment.apartmentModel?._id ?? selectedApartment.apartmentModel,
        floorNumber: selectedApartment.floorNumber,
        apartmentNumber: selectedApartment.apartmentNumber,
        user: selectedUser._id,
        users: [selectedUser._id],
        price: financials.presalePrice,
        initialPayment: financials.initialDownPayment,
        floorPlanPolygonId: selectedApartment.floorPlanPolygonId,
        status: 'pending',
        selectedRenderType,
      }

      if (selectedApartment._id) {
        await buildingService.updateApartment(selectedApartment._id, payload)
        setSuccess(t('quote:apartmentAssigned', 'Apartment assigned successfully!'))
      } else {
        await buildingService.createApartment(payload)
        setSuccess(t('quote:apartmentCreatedAssigned', 'Apartment created and assigned successfully!'))
      }
    }

    setTimeout(() => {
      navigate('/properties')
    }, 1200)
  } catch (e) {
    console.error('Error creating/assigning property:', e)
    setError(e.message || t('quote:errorAssigning', 'Error creating or assigning property'))
  } finally {
    setSubmitting(false)
  }
}
  // ✅ Validación adaptada para mostrar el componente
  if (!selectedBuilding || (!selectedApartment && !hasQuoteRef)) {
    return (
      <Paper elevation={0} sx={{
        p: 3,
        bgcolor: theme.palette.background.paper,
        borderRadius: 4,
        border: `1px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
        opacity: 0.6
      }}>
        <Typography variant="subtitle1" textAlign="center" sx={{
          py: 2,
          fontFamily: '"DM Sans", sans-serif',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: theme.palette.text.secondary
        }}>
          {isHouse
            ? 'Selecciona una casa con configuración completa para asignar residente'
            : t('quote:selectBuildingAndApartment', 'Select building and apartment to assign resident')}
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper elevation={0} sx={{
      bgcolor: theme.palette.background.paper,
      borderRadius: 4,
      border: expanded
        ? `2px solid ${theme.palette.secondary.main}`
        : `1px solid ${theme.palette.cardBorder || '#e0e0e0'}`,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      boxShadow: expanded
        ? `0 8px 24px ${theme.palette.secondary.main}26`
        : '0 4px 20px rgba(0,0,0,0.06)'
    }}>
      {/* HEADER */}
      <Box onClick={onToggle} sx={{
        p: 3,
        cursor: 'pointer',
        bgcolor: expanded
          ? theme.palette.secondary.light + '14'
          : theme.palette.background.paper,
        transition: 'all 0.3s ease',
        borderBottom: expanded
          ? `2px solid ${theme.palette.secondary.main}33`
          : 'none',
        '&:hover': {
          bgcolor: expanded
            ? theme.palette.secondary.light + '22'
            : theme.palette.primary.main + '08'
        }
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{
              width: 48, height: 48, borderRadius: 3,
              bgcolor: expanded
                ? theme.palette.primary.main
                : theme.palette.primary.main + '08',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
              boxShadow: expanded
                ? `0 4px 12px ${theme.palette.primary.main}33`
                : 'none'
            }}>
              <PersonIcon sx={{ color: expanded ? 'white' : theme.palette.primary.main, fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{
                color: theme.palette.primary.main,
                fontFamily: '"DM Sans", sans-serif',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontSize: '0.95rem'
              }}>
                {t('quote:residentAssignmentStep', '04 Resident Assignment')}
              </Typography>
              <Typography variant="caption" sx={{
                color: theme.palette.text.secondary,
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.75rem'
              }}>
                {expanded
                  ? t('quote:selectOrCreateResident', 'Select or create a resident')
                  : t('quote:clickToExpand', 'Click to expand')}
              </Typography>
            </Box>
          </Box>
          {expanded
            ? <ExpandLessIcon sx={{ color: theme.palette.secondary.main, fontSize: 28 }} />
            : <ExpandMoreIcon sx={{ color: theme.palette.text.secondary, fontSize: 28 }} />}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* SELECT USER - CON AUTOCOMPLETE */}
          <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
            <Autocomplete
              fullWidth
              options={users}
              getOptionLabel={(option) => 
                `${option.firstName} ${option.lastName} - ${option.email}${option.phoneNumber ? ` 📱 ${option.phoneNumber}` : ''}`
              }
              value={selectedUser || null}
              onChange={(event, newValue) => setSelectedUser(newValue)}
              disabled={loading}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('quote:selectResident', 'Select Resident')}
                  helperText={isHouse 
                    ? 'Elige un residente existente para asignar esta casa'
                    : t('quote:chooseResident', 'Choose an existing resident to assign this apartment')}
                  placeholder={t('quote:searchByNameOrEmail', 'Search by name or email...')}
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
              noOptionsText={t('quote:noUsersFound', 'No users found')}
              isOptionEqualToValue={(option, value) => option._id === value?._id}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderColor: theme.palette.secondary.main
                }
              }}
            />

            <Tooltip title={t('quote:addNewResident', 'Add New Resident')}>
              <Button
                variant="outlined"
                onClick={() => handleOpenDialog(null)}
                sx={{
                  minWidth: 48, height: '56px', borderRadius: 3, ml: 1, px: 0,
                  bgcolor: theme.palette.background.paper,
                  border: `2px solid ${theme.palette.secondary.main}`,
                  color: theme.palette.secondary.main,
                  alignSelf: 'flex-start',
                  '&:hover': { bgcolor: theme.palette.secondary.light + '14' }
                }}>
                <PersonAddIcon />
              </Button>
            </Tooltip>

            {/* ✅ Botón cross-project */}
            <Tooltip title="Seleccionar de otro proyecto">
              <Button
                variant="outlined"
                onClick={() => setOpenCrossProjectDialog(true)}
                sx={{
                  minWidth: 48, height: '56px', borderRadius: 3, px: 0,
                  bgcolor: theme.palette.background.paper,
                  border: `2px solid ${theme.palette.text.secondary}`,
                  color: theme.palette.text.secondary,
                  alignSelf: 'flex-start',
                  '&:hover': { bgcolor: theme.palette.text.secondary + '14' }
                }}>
                <PersonIcon />
              </Button>
            </Tooltip>
          </Box>


          {/* SUMMARY - Adaptado según tipo */}
<Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
  <Typography variant="body2" fontWeight={600} mb={1}>
    {isHouse ? 'Resumen de Casa:' : t('quote:summary', 'Summary:')}
  </Typography>
  <Typography variant="body2">
    <strong>{isHouse ? 'Casa:' : t('quote:building', 'Building')}:</strong> {selectedBuilding?.name}
  </Typography>
 
  {isHouse ? (
    <>
      <Typography variant="body2">
        <strong>Lote:</strong> {selectedBuilding?.quoteRef?.lot || 'N/A'}
      </Typography>
      <Typography variant="body2">
        <strong>Modelo:</strong> {selectedBuilding?.quoteRef?.model || 'N/A'}
      </Typography>
      <Typography variant="body2">
        <strong>Fachada:</strong> {selectedBuilding?.quoteRef?.facade || 'N/A'}
      </Typography>
    </>
  ) : (
    <>
      <Typography variant="body2">
        <strong>{t('quote:floor', 'Floor')}:</strong> {selectedApartment?.floorNumber}
      </Typography>
      <Typography variant="body2">
        <strong>{t('quote:apartment', 'Apartment')}:</strong> {selectedApartment?.apartmentNumber}
      </Typography>
      <Typography variant="body2">
        <strong>{t('quote:model', 'Model')}:</strong> {selectedApartment?.apartmentModel?.name}
      </Typography>
    </>
  )}
 
  <Typography variant="body2">
    <strong>{t('quote:user', 'User')}:</strong> {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'No seleccionado'}
  </Typography>
  <Typography variant="body2">
    <strong>{isHouse ? 'Precio Total:' : t('quote:presalePrice', 'Presale Price')}:</strong> ${financials?.presalePrice?.toLocaleString() || '0'}
  </Typography>
</Box>

          {!isReady && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {isHouse
                ? 'Asegúrate de haber seleccionado una casa con configuración completa y un residente.'
                : t('quote:ensureAllSelected', 'Ensure all required fields are selected.')}
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            onClick={handleAssign}
            disabled={submitting || !isReady}
            sx={{ mt: 2, mb: 1 }}
          >
            {isHouse 
              ? 'Crear & Asignar Propiedad'
              : t('quote:createAndAssign', 'Create & Assign Apartment')}
          </Button>

          <ResidentDialog
            open={openDialog}
            onClose={handleCloseDialog}
            onSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            selectedUser={selectedUser}
            handleFieldChange={handleFieldChange}
            handlePhoneChange={handlePhoneChange}
            isFormValid={isFormValid}
            e164Value={e164Value}
            displayVal={displayVal}
            isPhoneValid={isPhoneValid}
          />

{/* ✅ NUEVO: Modal cross-project */}
<CrossProjectResidentDialog
  open={openCrossProjectDialog}
  onClose={() => setOpenCrossProjectDialog(false)}
  currentProjectId={residentsProjectId}
  onSelectUser={(user) => {
    // ✅ Agregar usuario a la lista de cross-project users
    setCrossProjectUsers(prev => {
      const exists = prev.find(u => u._id === user._id)
      return exists ? prev : [...prev, user]
    })
    setSelectedUser(user)
    setOpenCrossProjectDialog(false)
  }}
/>
        </Box>
      </Collapse>
    </Paper>
  )
}

export default ResidentAsignment