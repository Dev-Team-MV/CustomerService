import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, TextField, MenuItem, Divider,
  Collapse, Alert, Button, CircularProgress, Tooltip
} from '@mui/material'
import { useProperty } from '../../context/PropertyContext'
import { useNavigate } from 'react-router-dom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import PersonIcon from '@mui/icons-material/Person'
import api from '../../services/api'
import projectService from '../../services/projectService'
import { sendWelcomeSMS, sendPropertyAssignmentSMS } from '../../services/smsService'
import ResidentDialog from '../ResidentDialog'
import { useTranslation } from 'react-i18next'

const ResidentAssignment = ({ expanded, onToggle }) => {
  const { t } = useTranslation('models')
  const navigate = useNavigate()
  const { selectedLot, selectedModel, selectedFacade, financials, options, selectedPricingOption,selectedProject, setSelectedProject, projects, loadingProjects } = useProperty()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [smsStatus, setSmsStatus] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // ✅ Proyectos
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [loadingProjects, setLoadingProjects] = useState(false)

  const [newUserData, setNewUserData] = useState({
    firstName: '', lastName: '', email: '',
    phoneNumber: '', birthday: '', role: 'user'
  })

  useEffect(() => {
    if (expanded) {
      if (users.length === 0) fetchUsers()
      if (projects.length === 0) fetchProjects()
    }
  }, [expanded])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await api.get('/users')
      const all = Array.isArray(response.data) ? response.data : []
      setUsers(all.filter(u => u.role === 'user'))
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // ✅ Cargar proyectos
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true)
      const data = await projectService.getAll()
      setProjects(data)
      // Auto-seleccionar si solo hay uno
      if (data.length === 1) setSelectedProject(data[0]._id)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleAssignProperty = async () => {
    try {
      setSubmitting(true)
      setSmsStatus(null)

      if (!selectedUser) {
        alert('Please select a user')
        setSubmitting(false)
        return
      }

      if (!selectedProject) {
        alert('Please select a project')
        setSubmitting(false)
        return
      }

      let userInfo = users.find(u => u._id === selectedUser)

      const lotId = selectedLot?._id || selectedLot
      const modelId = selectedModel?._id || selectedModel
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

      const propertyPayload = {
        // ✅ Proyecto
        project: String(selectedProject),
        projectId: String(selectedProject),
        // Propiedad
        lot: String(lotId),
        model: String(modelId),
        facade: facadeId ? String(facadeId) : null,
        user: String(selectedUser),
        users: [String(selectedUser)],
        // Financials
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
        hasStorage: Boolean(hasStorage)
      }

      console.log('📦 Creating property with payload:', propertyPayload)
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

  const handleCreateUser = async () => {
    try {
      setSubmitting(true)
      const normalizedPhone = newUserData.phoneNumber
        ? newUserData.phoneNumber.startsWith('+')
          ? newUserData.phoneNumber
          : `+${newUserData.phoneNumber}`
        : undefined

      const payload = { ...newUserData, phoneNumber: normalizedPhone, skipPasswordSetup: true }
      const userResponse = await api.post('/auth/register', payload)
      const userId = userResponse.data?.user?._id || userResponse.data?._id
      const userInfo = {
        _id: userId,
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        email: newUserData.email,
        phoneNumber: normalizedPhone
      }

      setUsers(prev => [...prev, userInfo])
      setSelectedUser(userId)
      setDialogOpen(false)
      setNewUserData({ firstName: '', lastName: '', email: '', phoneNumber: '', birthday: '', role: 'user' })

      if (userInfo.phoneNumber) {
        try {
          await sendWelcomeSMS(userInfo)
        } catch (e) {
          console.warn('SMS failed:', e)
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating user')
    } finally {
      setSubmitting(false)
    }
  }

  if (!selectedLot || !selectedModel) {
    return (
      <Paper elevation={0} sx={{ p: 3, bgcolor: '#fff', borderRadius: 4, border: '1px solid #e0e0e0', opacity: 0.6 }}>
        <Typography variant="subtitle1" textAlign="center" sx={{
          py: 2, fontFamily: '"Poppins", sans-serif', letterSpacing: '1.5px',
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
                color: '#333F1F', fontFamily: '"Poppins", sans-serif',
                letterSpacing: '1.5px', textTransform: 'uppercase', fontSize: '0.95rem'
              }}>
                {t('residentAssignment', '04 Resident Assignment')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', fontSize: '0.75rem' }}>
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
            <Alert severity="info" sx={{ mb: 2, borderRadius: 3, fontFamily: '"Poppins", sans-serif' }}>
              📱 {t('sendingPropertySMS', 'Sending property assignment SMS...')}
            </Alert>
          )}
          {smsStatus === 'sent' && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 3, fontFamily: '"Poppins", sans-serif' }}>
              ✅ {t('smsSent', 'SMS notifications sent successfully!')}
            </Alert>
          )}
          {smsStatus === 'failed' && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 3, fontFamily: '"Poppins", sans-serif' }}>
              ⚠️ {t('smsFailed', 'SMS notification failed but property was created')}
            </Alert>
          )}

          {/* ✅ SELECT PROJECT */}
          <TextField
            fullWidth
            select
            label="Project"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            helperText="Select the project this property belongs to"
            disabled={loadingProjects}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3, fontFamily: '"Poppins", sans-serif',
                '& fieldset': { borderColor: 'rgba(140, 165, 81, 0.3)', borderWidth: '2px' },
                '&:hover fieldset': { borderColor: '#8CA551' },
                '&.Mui-focused fieldset': { borderColor: '#333F1F', borderWidth: '2px' }
              },
              '& .MuiInputLabel-root': { fontFamily: '"Poppins", sans-serif', '&.Mui-focused': { color: '#333F1F' } },
              '& .MuiFormHelperText-root': { fontFamily: '"Poppins", sans-serif', fontSize: '0.75rem' }
            }}
          >
            {loadingProjects ? (
              <MenuItem disabled>Loading projects...</MenuItem>
            ) : projects.length === 0 ? (
              <MenuItem disabled>No projects available</MenuItem>
            ) : (
              projects.map((project) => (
                <MenuItem key={project._id} value={project._id}
                  sx={{ fontFamily: '"Poppins", sans-serif', '&:hover': { bgcolor: 'rgba(140, 165, 81, 0.08)' } }}
                >
                  {project.name} {project.slug ? `(${project.slug})` : ''}
                </MenuItem>
              ))
            )}
          </TextField>

          {/* SELECT USER */}
          <Box display="flex" alignItems="flex-start" gap={2}>
            <TextField
              fullWidth select
              label={t('selectResident', 'Select Resident')}
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              helperText={t('chooseExistingResident', 'Choose an existing resident to assign this property')}
              disabled={loadingUsers}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3, fontFamily: '"Poppins", sans-serif',
                  '& fieldset': { borderColor: 'rgba(140, 165, 81, 0.3)', borderWidth: '2px' },
                  '&:hover fieldset': { borderColor: '#8CA551' },
                  '&.Mui-focused fieldset': { borderColor: '#333F1F', borderWidth: '2px' }
                },
                '& .MuiInputLabel-root': { fontFamily: '"Poppins", sans-serif', '&.Mui-focused': { color: '#333F1F' } },
                '& .MuiFormHelperText-root': { fontFamily: '"Poppins", sans-serif', fontSize: '0.75rem' }
              }}
            >
              {loadingUsers ? (
                <MenuItem disabled>{t('loadingUsers', 'Loading users...')}</MenuItem>
              ) : users.length === 0 ? (
                <MenuItem disabled>{t('noUsersAvailable', 'No users available')}</MenuItem>
              ) : (
                users.map((user) => (
                  <MenuItem key={user._id} value={user._id}
                    sx={{ fontFamily: '"Poppins", sans-serif', '&:hover': { bgcolor: 'rgba(140, 165, 81, 0.08)' } }}
                  >
                    {user.firstName} {user.lastName} - {user.email}
                    {user.phoneNumber && ` 📱 ${user.phoneNumber}`}
                  </MenuItem>
                ))
              )}
            </TextField>
            <Tooltip title={t('addNewResident', 'Add New Resident')}>
              <Button variant="outlined" onClick={() => setDialogOpen(true)} sx={{
                minWidth: 48, height: '56px', borderRadius: 3, ml: 1, px: 0,
                bgcolor: '#fff', border: '2px solid #8CA551', color: '#8CA551',
                alignSelf: 'flex-start',
                '&:hover': { bgcolor: 'rgba(140, 165, 81, 0.08)' }
              }}>
                <PersonAddIcon />
              </Button>
            </Tooltip>
          </Box>

          {/* PROPERTY SUMMARY */}
          <Paper sx={{ p: 3, mt: 3, bgcolor: 'rgba(140, 165, 81, 0.05)', borderRadius: 3, border: '2px solid rgba(140, 165, 81, 0.2)' }}>
            <Typography variant="subtitle2" fontWeight={700} mb={2} sx={{
              color: '#333F1F', fontFamily: '"Poppins", sans-serif',
              letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem'
            }}>
              {t('propertySummary', 'Property Summary')}
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {selectedProject && (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>Project:</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
                    {projects.find(p => p._id === selectedProject)?.name || selectedProject}
                  </Typography>
                </Box>
              )}
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>{t('lot', 'Lot')}:</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>#{selectedLot?.number}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>{t('model', 'Model')}:</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>{selectedModel?.model}</Typography>
              </Box>
              {selectedFacade && (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>{t('facade', 'Facade')}:</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>{selectedFacade.title}</Typography>
                </Box>
              )}
            </Box>
            <Divider sx={{ my: 2, borderColor: 'rgba(140, 165, 81, 0.3)' }} />
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" fontWeight={700} sx={{ color: '#8CA551', fontFamily: '"Poppins", sans-serif' }}>{t('totalPrice', 'Total Price')}:</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: '#8CA551', fontFamily: '"Poppins", sans-serif' }}>${financials.presalePrice.toLocaleString()}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>{t('initialPayment', 'Initial Payment')}:</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>${financials.initialDownPayment.toLocaleString()}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>{t('mortgage', 'Mortgage')}:</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>${financials.mortgage.toLocaleString()}</Typography>
              </Box>
            </Box>
          </Paper>

          {/* ACTION BUTTON */}
          <Button
            variant="contained" fullWidth
            onClick={handleAssignProperty}
            disabled={!selectedUser || !selectedProject || submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            sx={{
              mt: 3, borderRadius: 3, bgcolor: '#333F1F', color: 'white',
              fontWeight: 600, textTransform: 'none', letterSpacing: '1px',
              fontFamily: '"Poppins", sans-serif', px: 3, py: 1.5,
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

          <ResidentDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onSubmit={handleCreateUser}
            formData={newUserData}
            setFormData={setNewUserData}
            selectedUser={null}
          />
        </Box>
      </Collapse>
    </Paper>
  )
}

export default ResidentAssignment