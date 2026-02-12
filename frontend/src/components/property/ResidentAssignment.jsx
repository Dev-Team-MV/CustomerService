import { useState, useEffect } from 'react'
import { 
  Box, 
  Paper, 
  Typography, 
  Tabs, 
  Tab, 
  TextField, 
  Grid, 
  MenuItem, 
  Divider,
  Collapse,
  Alert,
  Button,
  CircularProgress
} from '@mui/material'
import { useProperty } from '../../context/PropertyContext'
import { useNavigate } from 'react-router-dom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import api from '../../services/api'
import { sendWelcomeSMS, sendPropertyAssignmentSMS } from '../../services/smsService'

import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
// ...existing code...

const ResidentAssignment = ({ expanded, onToggle }) => {
  const navigate = useNavigate()
  // Added options and selectedPricingOption from context to determine flags
  const { selectedLot, selectedModel, selectedFacade, financials, options, selectedPricingOption } = useProperty()
  const [tabValue, setTabValue] = useState(0)
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [smsStatus, setSmsStatus] = useState(null)
  
  // Form data for new user
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    birthday: '',
    role: 'user'
  })

  useEffect(() => {
    if (expanded && tabValue === 0 && users.length === 0) {
      fetchUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, tabValue])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await api.get('/users')
      const all = Array.isArray(response.data) ? response.data : []
      // filter to role 'user'
      setUsers(all.filter(u => u.role === 'user'))
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleAssignProperty = async () => {
    try {
      setSubmitting(true)
      setSmsStatus(null)
      let userId = selectedUser
      let userInfo = null
      let isNewUser = false
  
      // If creating new user
      if (tabValue === 1) {
        isNewUser = true

        // Normalize phone: ensure leading +
        const normalizedPhone = newUserData.phoneNumber
          ? newUserData.phoneNumber.startsWith('+')
            ? newUserData.phoneNumber
            : `+${newUserData.phoneNumber}`
          : undefined

        const payload = {
          ...newUserData,
          phoneNumber: normalizedPhone,
          // prefer backend flow that sends invite/SMS instead of requiring password
          skipPasswordSetup: true
        }

        const userResponse = await api.post('/auth/register', payload)
        userId = userResponse.data?.user?._id || userResponse.data?._id || userResponse.data?.userId
        userInfo = {
          firstName: newUserData.firstName,
          email: newUserData.email,
          phoneNumber: normalizedPhone
        }

        // Send welcome SMS if phone available — backend might already send, but keep best-effort
        if (userInfo.phoneNumber) {
          setSmsStatus('sending-welcome')
          try {
            const welcomeSMS = await sendWelcomeSMS(userInfo)
            if (welcomeSMS?.success) {
              setSmsStatus('sent')
            } else {
              console.warn('Welcome SMS result:', welcomeSMS)
              setSmsStatus('failed')
            }
          } catch (e) {
            console.warn('Welcome SMS error:', e)
            setSmsStatus('failed')
          }
        }
      } else {
        // Obtener info del usuario seleccionado
        userInfo = users.find(u => u._id === selectedUser) || users.find(u => u.id === selectedUser)
      }
  
      if (!userId) {
        alert('Please select or create a user')
        setSubmitting(false)
        return
      }

      // --- Normalización y armado del payload para el backend ---
      // IDs: asegurar que sean strings
      const lotId = selectedLot?._id || selectedLot
      const modelId = selectedModel?._id || selectedModel
      const facadeId = selectedFacade?._id || selectedFacade || null
      const finalUserId = userId

      // initialPayment: usar valor calculado (Number)
      const initialPaymentAmount = Number(financials.initialDownPayment || 0)

      // Determinar flags: prioridad a selectedPricingOption, luego toggles manuales
      const hasBalcony = selectedPricingOption
        ? Boolean(selectedPricingOption.hasBalcony)
        : Boolean(options?.balcony)

      const hasStorage = selectedPricingOption
        ? Boolean(selectedPricingOption.hasStorage)
        : Boolean(options?.storage)

      const modelType = selectedPricingOption?.modelType
        ? String(selectedPricingOption.modelType)
        : (options?.upgrade ? 'upgrade' : 'basic')

      // Build payload including existing financial fields and the normalized option flags
      const propertyPayload = {
        lot: String(lotId),
        model: String(modelId),
        facade: facadeId ? String(facadeId) : null,
        user: String(finalUserId),
        client: String(finalUserId),
        listPrice: Number(financials.listPrice || 0),
        presalePrice: Number(financials.presalePrice || 0),
        discount: Number(financials.discount || 0),
        discountPercent: Number(financials.discountPercent || 0),
        totalDownPayment: Number(financials.totalDownPayment || 0),
        downPaymentPercent: Number(financials.downPaymentPercent || 0),
        // use normalized initial payment
        initialPayment: Number(initialPaymentAmount),
        initialPaymentPercent: Number(financials.initialDownPaymentPercent || 0),
        monthlyPayment: Number(financials.monthlyPayment || 0),
        monthlyPaymentPercent: Number(financials.monthlyPaymentPercent || 0),
        mortgage: Number(financials.mortgage || 0),
        pending: Number(financials.presalePrice || 0),
        price: Number(financials.presalePrice || 0),
        status: 'pending',
        // Configuration options expected by backend:
        hasBalcony: Boolean(hasBalcony),
        modelType: modelType || 'basic',
        hasStorage: Boolean(hasStorage)
      }

      // Debug: revisar en consola (dev) antes de enviar
      console.log('Property payload (normalized):', propertyPayload)
      // --- Fin normalización ---

      await api.post('/properties', propertyPayload)
  
      // Send property assignment SMS if we have a phone
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
          if (propertySMS?.success) {
            setSmsStatus('sent')
          } else {
            console.warn('Property SMS failed:', propertySMS)
            setSmsStatus('failed')
          }
        } catch (e) {
          console.warn('Property SMS error:', e)
          setSmsStatus('failed')
        }
      }
      
      const smsMessage = smsStatus === 'sent' 
        ? '\n\n📱 SMS notifications sent successfully!'
        : userInfo?.phoneNumber && smsStatus === 'failed'
        ? '\n\n⚠️ Property created but SMS notification failed'
        : ''
  
      alert(`Property assigned successfully!${smsMessage}`)
      navigate('/properties')
    } catch (error) {
      console.error('Error assigning property:', error)
      alert(error.response?.data?.message || 'Error assigning property')
    } finally {
      setSubmitting(false)
      setSmsStatus(null)
    }
  }

  const isFormValid = () => {
    if (tabValue === 0) {
      return selectedUser !== ''
    } else {
      // New user flow uses phone + skipPasswordSetup, require phone instead of password
      return Boolean(newUserData.firstName && newUserData.lastName && newUserData.email && newUserData.phoneNumber)
    }
  }

  if (!selectedLot || !selectedModel) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          bgcolor: '#fff', 
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          opacity: 0.6
        }}
      >
        <Typography variant="subtitle1" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
          SELECT LOT AND MODEL TO ASSIGN RESIDENT
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        bgcolor: '#fff', 
        borderRadius: 2,
        border: expanded ? '2px solid #4a7c59' : '1px solid #e0e0e0',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header - Clickeable */}
      <Box 
        onClick={onToggle}
        sx={{ 
          p: 3, 
          cursor: 'pointer',
          bgcolor: expanded ? '#f1f8e9' : '#fff',
          transition: 'background-color 0.3s ease',
          '&:hover': {
            bgcolor: expanded ? '#f1f8e9' : '#f9fafb'
          }
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            04 RESIDENT ASSIGNMENT
          </Typography>
          <Typography 
            variant="caption" 
            color={expanded ? 'success.main' : 'text.secondary'}
            fontWeight="bold"
          >
            {expanded ? 'EXPANDED' : 'CLICK TO EXPAND'}
          </Typography>
        </Box>
      </Box>

      {/* Collapsible Content */}
      <Collapse in={expanded}>
        <Box sx={{ px: 3, pb: 3 }}>
          <Divider sx={{ mb: 2 }} />

          {/* ✅ SMS Status Alert */}
          {smsStatus === 'sending-welcome' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              📱 Sending welcome SMS to new user...
            </Alert>
          )}
          {smsStatus === 'sending-property' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              📱 Sending property assignment SMS...
            </Alert>
          )}
          {smsStatus === 'sent' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ SMS notifications sent successfully!
            </Alert>
          )}
          {smsStatus === 'failed' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              ⚠️ SMS notification failed but property was created
            </Alert>
          )}

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500
                }
              }}
            >
              <Tab label="Select Existing User" />
              <Tab label="Create New User" />
            </Tabs>
          </Box>

          {tabValue === 0 ? (
            // Select Existing User Tab
            <Box>
              <TextField
                fullWidth
                select
                label="Select Resident"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                helperText="Choose an existing resident to assign this property"
                disabled={loadingUsers}
              >
                {loadingUsers ? (
                  <MenuItem disabled>Loading users...</MenuItem>
                ) : users.length === 0 ? (
                  <MenuItem disabled>No users available</MenuItem>
                ) : (
                  users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} - {user.email}
                      {user.phoneNumber && ` 📱 ${user.phoneNumber}`}
                    </MenuItem>
                  ))
                )}
              </TextField>

              {/* Property Summary */}
              <Paper sx={{ p: 2, mt: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                  Property Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lot: #{selectedLot?.number}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Model: {selectedModel?.model}
                </Typography>
                {selectedFacade && (
                  <Typography variant="body2" color="text.secondary">
                    Facade: {selectedFacade.title}
                  </Typography>
                )}
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="primary" fontWeight="bold">
                  Total Price: ${financials.presalePrice.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Initial Payment: ${financials.initialDownPayment.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mortgage: ${financials.mortgage.toLocaleString()}
                </Typography>
              </Paper>

              {/* Action Button */}
              <Button
                variant="contained"
                fullWidth
                onClick={handleAssignProperty}
                disabled={!selectedUser || submitting}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                sx={{
                  mt: 3,
                  bgcolor: '#4a7c59',
                  color: '#fff',
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    bgcolor: '#3d664a'
                  },
                  '&:disabled': {
                    bgcolor: '#ccc',
                    color: '#666'
                  }
                }}
              >
                {submitting ? 'Assigning Property...' : 'Assign Property to Selected User'}
              </Button>
            </Box>
          ) : (
            // Create New User Tab
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={newUserData.firstName}
                    onChange={(e) => setNewUserData({ ...newUserData, firstName: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={newUserData.lastName}
                    onChange={(e) => setNewUserData({ ...newUserData, lastName: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Password (optional)"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    helperText="If left empty, user will receive an SMS to set up access"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Phone Number
                    </Typography>
                    <PhoneInput
                      country={'us'}
                      value={newUserData.phoneNumber}
                      onChange={(value) => setNewUserData({ ...newUserData, phoneNumber: value })}
                      inputProps={{ name: 'phone' }}
                      containerStyle={{ width: '100%' }}
                      inputStyle={{
                        width: '100%',
                        height: '56px',
                        fontSize: '16px',
                        border: '1px solid #c4c4c4',
                        borderRadius: 6
                      }}
                      buttonStyle={{ border: '1px solid #c4c4c4', borderRight: 'none' }}
                    />
                    <Typography variant="caption" color="text.secondary">Include for SMS notifications</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Birthday"
                    value={newUserData.birthday}
                    onChange={(e) => setNewUserData({ ...newUserData, birthday: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Property Summary */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                      Property to Assign
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lot: #{selectedLot?.number} | Model: {selectedModel?.model}
                    </Typography>
                    {selectedFacade && (
                      <Typography variant="body2" color="text.secondary">
                        Facade: {selectedFacade.title}
                      </Typography>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      Total: ${financials.presalePrice.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Validation Message */}
              {!isFormValid() && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Please fill in all required fields (First Name, Last Name, Email, Phone Number)
                </Alert>
              )}

              {/* Action Button */}
              <Button
                variant="contained"
                fullWidth
                onClick={handleAssignProperty}
                disabled={!isFormValid() || submitting}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                sx={{
                  mt: 3,
                  bgcolor: '#4a7c59',
                  color: '#fff',
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    bgcolor: '#3d664a'
                  },
                  '&:disabled': {
                    bgcolor: '#ccc',
                    color: '#666'
                  }
                }}
              >
                {submitting ? 'Creating User & Assigning...' : 'Create User & Assign Property'}
              </Button>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  )
}

export default ResidentAssignment
// ...existing code...