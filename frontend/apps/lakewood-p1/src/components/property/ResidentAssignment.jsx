import { useEffect, useState, useMemo } from 'react'
import {
  Box, Paper, Typography, TextField, MenuItem, Divider,
  Collapse, Alert, Button, CircularProgress, Tooltip,Autocomplete
} from '@mui/material'
import { useProperty } from '@shared/context/PropertyContext'
import { useNavigate } from 'react-router-dom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import PersonIcon from '@mui/icons-material/Person'
import api from '@shared/services/api'
import projectService from '../../services/projectService'
import { sendPropertyAssignmentSMS } from '../../services/smsService'
import ResidentDialog from '../ResidentDialog'
import { useTranslation } from 'react-i18next'
import { useResidents } from '@shared/hooks/useResidents'
import CrossProjectResidentDialog from '@shared/components/Modals/CroosProjectsResidentDialog'


const ResidentAssignment = ({ expanded, onToggle }) => {
  const { t } = useTranslation('models')
  const navigate = useNavigate()
  const {
    selectedLot, selectedModel, selectedFacade, financials, options, selectedPricingOption,
    selectedProject, setSelectedProject, projects, loadingProjects, setProjects,modelType, selectedOptions 
  } = useProperty()

  const residentsProjectId = selectedProject || import.meta.env.VITE_PROJECT_ID

  // Hook de residentes (proyecto elegido en el flujo o VITE_PROJECT_ID)
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
  // Eliminar duplicados por _id
  return Array.from(new Map(allUsers.map(u => [u._id, u])).values())
}, [projectUsers, crossProjectUsers])
 

const [submitting, setSubmitting] = useState(false)
const [smsStatus, setSmsStatus] = useState(null)
const [openCrossProjectDialog, setOpenCrossProjectDialog] = useState(false)

  // Cargar proyectos si es necesario
  useEffect(() => {
    if (expanded && projects.length === 0) fetchProjects()
  }, [expanded])

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true)
      const data = await projectService.getAll()
      setProjects(data)
      if (data.length === 1) setSelectedProject(data[0]._id)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  // Asignar propiedad
const handleAssignProperty = async () => {
  try {
    setSubmitting(true)
    setSmsStatus(null)

    if (!selectedUser?._id) {
      alert('Please select a user')
      setSubmitting(false)
      return
    }
    
    // ✅ Usar residentsProjectId en lugar de selectedProject
    if (!residentsProjectId) {
      alert('Project ID is required')
      setSubmitting(false)
      return
    }

    const userInfo = users.find(u => u._id === selectedUser._id)
    const lotId    = selectedLot?._id    || selectedLot
    const modelId  = selectedModel?._id  || selectedModel
    const facadeId = selectedFacade?._id || selectedFacade || null

    const hasBalcony = selectedPricingOption
      ? Boolean(selectedPricingOption.hasBalcony)
      : Boolean(options?.balcony)

    const hasStorage = selectedPricingOption
      ? Boolean(selectedPricingOption.hasStorage)
      : Boolean(options?.storage)

    const modelType = selectedPricingOption?.modelType
      ? String(selectedPricingOption.modelType)
      : (options?.upgrade ? 'upgrade' : 'basic')

    // ✅ Usar residentsProjectId para obtener project data
    const projectData = projects.find(p => p._id === residentsProjectId)
    const projectName = projectData?.name || projectData?.slug || 'Unknown'

    console.log('🔍 DEBUG ResidentAssignment - Estado antes de crear propiedad:', {
      selectedOptions,
      options,
      modelType,
      hasBalcony: options?.balcony,
      hasStorage: options?.storage,
      hasUpgrade: options?.upgrade
    })
    
    const propertyPayload = {
      project: String(projectName),
      projectId: String(residentsProjectId), // ✅ Usar residentsProjectId
      lot: String(lotId),
      model: String(modelId),
      facade: facadeId ? String(facadeId) : undefined,
      user: String(selectedUser._id),
      users: [String(selectedUser._id)],
      listPrice: Number(financials.listPrice || 0),
      presalePrice: Number(financials.presalePrice || 0),
      discount: Number(financials.discount || 0),
      discountPercent: Number(financials.discountPercent || 0),
      totalDownPayment: Number(financials.totalDownPayment || 0),
      downPaymentPercent: Number(financials.downPaymentPercent || 0),
      initialPayment: Number(financials.initialDownPayment || 0),
      initialPaymentPercent: Number(financials.initialDownPaymentPercent || 0),
      monthlyPayment: Number(financials.monthlyPayment || 0),
      monthlyPaymentPercent: Number(financials.monthlyPaymentPercent || 0),
      mortgage: Number(financials.mortgage || 0),
      pending: Number(financials.presalePrice || 0),
      price: Number(financials.presalePrice || 0),
      status: 'pending',
      hasBalcony: Boolean(hasBalcony),
      modelType: modelType || 'basic',
      hasStorage: Boolean(hasStorage),
      selectedOptions: {
        upgradeId: selectedOptions?.upgradeId || null,
        balconyId: selectedOptions?.balconyId || null,
        storageId: selectedOptions?.storageId || null
      }
    }
    
    await api.post('/properties', propertyPayload)

    if (userInfo?.phoneNumber) {
      setSmsStatus('sending-property')
      try {
        const propertySMS = await sendPropertyAssignmentSMS({
          firstName: userInfo.firstName,
          phoneNumber: userInfo.phoneNumber,
          lotNumber: selectedLot.number,
          section: selectedLot.section,
          modelName: selectedModel.model,
          price: financials.presalePrice,
          status: 'pending'
        })
        setSmsStatus(propertySMS?.success ? 'sent' : 'failed')
      } catch (e) {
        setSmsStatus('failed')
      }
    }

    alert('Property assigned successfully!')
    navigate('/properties')
  } catch (error) {
    alert(error.response?.data?.message || 'Error assigning property')
  } finally {
    setSubmitting(false)
    setSmsStatus(null)
  }
}

  if (!selectedLot || !selectedModel) {
    return (
      <Paper elevation={0} sx={{ p: 3, bgcolor: '#fff', borderRadius: 4, border: '1px solid #e0e0e0', opacity: 0.6 }}>
        <Typography variant="subtitle1" textAlign="center" sx={{
          py: 2, fontFamily: '"DM Sans", sans-serif', letterSpacing: '1.5px',
          textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600, color: '#706f6f'
        }}>
          {t('selectLotAndModelToAssignResident', 'SELECT LOT AND MODEL TO ASSIGN RESIDENT')}
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper elevation={0} sx={{
      bgcolor: '#fff', borderRadius: 4,
      border: expanded ? '2px solid #8CA551' : '1px solid #e0e0e0',
      overflow: 'hidden', transition: 'all 0.3s ease',
      boxShadow: expanded ? '0 8px 24px rgba(140, 165, 81, 0.15)' : '0 4px 20px rgba(0,0,0,0.06)'
    }}>
      {/* HEADER */}
      <Box onClick={onToggle} sx={{
        p: 3, cursor: 'pointer',
        bgcolor: expanded ? 'rgba(140, 165, 81, 0.08)' : '#fff',
        transition: 'all 0.3s ease',
        borderBottom: expanded ? '2px solid rgba(140, 165, 81, 0.2)' : 'none',
        '&:hover': { bgcolor: expanded ? 'rgba(140, 165, 81, 0.12)' : 'rgba(51, 63, 31, 0.03)' }
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{
              width: 48, height: 48, borderRadius: 3,
              bgcolor: expanded ? '#333F1F' : 'rgba(51, 63, 31, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
              boxShadow: expanded ? '0 4px 12px rgba(51, 63, 31, 0.2)' : 'none'
            }}>
              <PersonIcon sx={{ color: expanded ? 'white' : '#333F1F', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{
                color: '#333F1F', fontFamily: '"DM Sans", sans-serif',
                letterSpacing: '1.5px', textTransform: 'uppercase', fontSize: '0.95rem'
              }}>
                {t('residentAssignment', '04 Resident Assignment')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem' }}>
                {expanded ? t('selectOrCreateResident', 'Select or create a resident') : t('clickToExpand', 'Click to expand')}
              </Typography>
            </Box>
          </Box>
          {expanded ? <ExpandLessIcon sx={{ color: '#8CA551', fontSize: 28 }} /> : <ExpandMoreIcon sx={{ color: '#706f6f', fontSize: 28 }} />}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 3 }}>
          {/* SMS ALERTS */}
          {smsStatus === 'sending-property' && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 3, fontFamily: '"DM Sans", sans-serif' }}>
              📱 {t('sendingPropertySMS', 'Sending property assignment SMS...')}
            </Alert>
          )}
          {smsStatus === 'sent' && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 3, fontFamily: '"DM Sans", sans-serif' }}>
              ✅ {t('smsSent', 'SMS notifications sent successfully!')}
            </Alert>
          )}
          {smsStatus === 'failed' && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 3, fontFamily: '"DM Sans", sans-serif' }}>
              ⚠️ {t('smsFailed', 'SMS notification failed but property was created')}
            </Alert>
          )}

          {/* SELECT USER - CON AUTOCOMPLETE */}
          <Box display="flex" alignItems="flex-start" gap={2}>
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
                  label={t('selectResident', 'Select Resident')}
                  helperText={t('chooseExistingResident', 'Choose an existing resident to assign this property')}
                  placeholder="Busca por nombre o correo..."
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
              noOptionsText="No se encontraron usuarios"
              isOptionEqualToValue={(option, value) => option._id === value?._id}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderColor: '#8CA551'
                }
              }}
            />

            <Tooltip title={t('addNewResident', 'Add New Resident')}>
              <Button variant="outlined" onClick={() => handleOpenDialog()} sx={{
                minWidth: 48, height: '56px', borderRadius: 3, ml: 1, px: 0,
                bgcolor: '#fff', border: '2px solid #8CA551', color: '#8CA551',
                alignSelf: 'flex-start',
                '&:hover': { bgcolor: 'rgba(140, 165, 81, 0.08)' }
              }}>
                <PersonAddIcon />
              </Button>
            </Tooltip>

            {/* ✅ NUEVO: Botón para seleccionar de otro proyecto */}
            <Tooltip title="Seleccionar residente de otro proyecto">
              <Button variant="outlined" onClick={() => setOpenCrossProjectDialog(true)} sx={{
                minWidth: 48, height: '56px', borderRadius: 3, px: 0,
                bgcolor: '#fff', border: '2px solid #706f6f', color: '#706f6f',
                alignSelf: 'flex-start',
                '&:hover': { bgcolor: 'rgba(112, 111, 111, 0.08)' }
              }}>
                <PersonIcon />
              </Button>
            </Tooltip>
          </Box>

          {/* PROPERTY SUMMARY ... */}
          {/* ...igual que antes... */}

          {/* ACTION BUTTON */}
          <Button
            variant="contained" fullWidth
            onClick={handleAssignProperty}
            disabled={!selectedUser?._id || !residentsProjectId || submitting}

            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            sx={{
              mt: 3, borderRadius: 3, bgcolor: '#333F1F', color: 'white',
              fontWeight: 600, textTransform: 'none', letterSpacing: '1px',
              fontFamily: '"DM Sans", sans-serif', px: 3, py: 1.5,
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
              position: 'relative', overflow: 'hidden',
              '&::before': {
                content: '""', position: 'absolute', top: 0, left: '-100%',
                width: '100%', height: '100%', bgcolor: '#8CA551',
                transition: 'left 0.4s ease', zIndex: 0
              },
              '&:hover': {
                bgcolor: '#333F1F', boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                '&::before': { left: 0 }
              },
              '& .MuiButton-startIcon': { position: 'relative', zIndex: 1, color: 'white' }
            }}
          >
            <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
              {submitting ? t('assigningProperty', 'Assigning Property...') : t('assignPropertyToSelectedUser', 'Assign Property to Selected User')}
            </Box>
          </Button>

          {/* MODAL PARA CREAR/EDITAR USUARIO */}
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

          {/* ✅ NUEVO: Modal para seleccionar residente de otro proyecto */}
{/* ✅ NUEVO: Modal para seleccionar residente de otro proyecto */}
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

export default ResidentAssignment