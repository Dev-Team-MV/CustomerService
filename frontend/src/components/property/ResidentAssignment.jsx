import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Divider,
  Collapse,
  Alert,
  Button,
  CircularProgress,
  Tooltip
} from '@mui/material'
import { useProperty } from '../../context/PropertyContext'
import { useNavigate } from 'react-router-dom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import PersonIcon from '@mui/icons-material/Person'
import api from '../../services/api'
import { sendWelcomeSMS, sendPropertyAssignmentSMS } from '../../services/smsService'
import ResidentDialog from '../ResidentDialog'

const ResidentAssignment = ({ expanded, onToggle }) => {
  const navigate = useNavigate()
  const { selectedLot, selectedModel, selectedFacade, financials, options, selectedPricingOption } = useProperty()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [smsStatus, setSmsStatus] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    birthday: '',
    role: 'user'
  })

  useEffect(() => {
    if (expanded && users.length === 0) {
      fetchUsers()
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

  const handleAssignProperty = async () => {
    try {
      setSubmitting(true)
      setSmsStatus(null)
      let userId = selectedUser
      let userInfo = users.find(u => u._id === selectedUser) || users.find(u => u.id === selectedUser)

      if (!userId) {
        alert('Please select a user')
        setSubmitting(false)
        return
      }

      const lotId = selectedLot?._id || selectedLot
      const modelId = selectedModel?._id || selectedModel
      const facadeId = selectedFacade?._id || selectedFacade || null
      const finalUserId = userId

      const initialPaymentAmount = Number(financials.initialDownPayment || 0)

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
        initialPayment: Number(initialPaymentAmount),
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
          if (propertySMS?.success) {
            setSmsStatus('sent')
          } else {
            setSmsStatus('failed')
          }
        } catch (e) {
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
      alert(error.response?.data?.message || 'Error assigning property')
    } finally {
      setSubmitting(false)
      setSmsStatus(null)
    }
  }

  // Handler para crear usuario desde el modal
  const handleCreateUser = async () => {
    try {
      setSubmitting(true)
      setSmsStatus(null)

      const normalizedPhone = newUserData.phoneNumber
        ? newUserData.phoneNumber.startsWith('+')
          ? newUserData.phoneNumber
          : `+${newUserData.phoneNumber}`
        : undefined

      const payload = {
        ...newUserData,
        phoneNumber: normalizedPhone,
        skipPasswordSetup: true
      }

      const userResponse = await api.post('/auth/register', payload)
      const userId = userResponse.data?.user?._id || userResponse.data?._id || userResponse.data?.userId
      const userInfo = {
        _id: userId,
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        email: newUserData.email,
        phoneNumber: normalizedPhone
      }

      // Agrega el usuario a la lista y selecciónalo
      setUsers(prev => [...prev, userInfo])
      setSelectedUser(userId)

      setDialogOpen(false)
      setNewUserData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        birthday: '',
        role: 'user'
      })

      // Envía SMS de bienvenida
      if (userInfo.phoneNumber) {
        setSmsStatus('sending-welcome')
        try {
          const welcomeSMS = await sendWelcomeSMS(userInfo)
          if (welcomeSMS?.success) {
            setSmsStatus('sent')
          } else {
            setSmsStatus('failed')
          }
        } catch (e) {
          setSmsStatus('failed')
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating user')
    } finally {
      setSubmitting(false)
      setSmsStatus(null)
    }
  }

  if (!selectedLot || !selectedModel) {
    return (
      <Paper elevation={0} sx={{
        p: 3,
        bgcolor: '#fff',
        borderRadius: 4,
        border: '1px solid #e0e0e0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        opacity: 0.6
      }}>
        <Typography variant="subtitle1" textAlign="center" sx={{
          py: 2,
          fontFamily: '"Poppins", sans-serif',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#706f6f'
        }}>
          SELECT LOT AND MODEL TO ASSIGN RESIDENT
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper elevation={0} sx={{
      bgcolor: '#fff',
      borderRadius: 4,
      border: expanded ? '2px solid #8CA551' : '1px solid #e0e0e0',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      boxShadow: expanded ? '0 8px 24px rgba(140, 165, 81, 0.15)' : '0 4px 20px rgba(0,0,0,0.06)'
    }}>
      {/* HEADER */}
      <Box onClick={onToggle} sx={{
        p: 3,
        cursor: 'pointer',
        bgcolor: expanded ? 'rgba(140, 165, 81, 0.08)' : '#fff',
        transition: 'all 0.3s ease',
        borderBottom: expanded ? '2px solid rgba(140, 165, 81, 0.2)' : 'none',
        '&:hover': {
          bgcolor: expanded ? 'rgba(140, 165, 81, 0.12)' : 'rgba(51, 63, 31, 0.03)'
        }
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: expanded ? '#333F1F' : 'rgba(51, 63, 31, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              boxShadow: expanded ? '0 4px 12px rgba(51, 63, 31, 0.2)' : 'none'
            }}>
              <PersonIcon sx={{ color: expanded ? 'white' : '#333F1F', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{
                color: '#333F1F',
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontSize: '0.95rem'
              }}>
                04 Resident Assignment
              </Typography>
              <Typography variant="caption" sx={{
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.75rem'
              }}>
                {expanded ? 'Select or create a resident' : 'Click to expand'}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            {expanded ? (
              <ExpandLessIcon sx={{ color: '#8CA551', fontSize: 28 }} />
            ) : (
              <ExpandMoreIcon sx={{ color: '#706f6f', fontSize: 28 }} />
            )}
          </Box>
        </Box>
      </Box>

      {/* COLLAPSIBLE CONTENT */}
      <Collapse in={expanded}>
        <Box sx={{ p: 3 }}>
          {/* SMS STATUS ALERTS */}
          {smsStatus === 'sending-welcome' && (
            <Alert severity="info" sx={{
              mb: 2,
              borderRadius: 3,
              bgcolor: 'rgba(33, 150, 243, 0.08)',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              fontFamily: '"Poppins", sans-serif',
              "& .MuiAlert-icon": { color: "#2196f3" }
            }}>
              📱 Sending welcome SMS to new user...
            </Alert>
          )}
          {smsStatus === 'sending-property' && (
            <Alert severity="info" sx={{
              mb: 2,
              borderRadius: 3,
              bgcolor: 'rgba(33, 150, 243, 0.08)',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              fontFamily: '"Poppins", sans-serif',
              "& .MuiAlert-icon": { color: "#2196f3" }
            }}>
              📱 Sending property assignment SMS...
            </Alert>
          )}
          {smsStatus === 'sent' && (
            <Alert severity="success" sx={{
              mb: 2,
              borderRadius: 3,
              bgcolor: 'rgba(140, 165, 81, 0.08)',
              border: '1px solid rgba(140, 165, 81, 0.3)',
              fontFamily: '"Poppins", sans-serif',
              "& .MuiAlert-icon": { color: "#8CA551" }
            }}>
              ✅ SMS notifications sent successfully!
            </Alert>
          )}
          {smsStatus === 'failed' && (
            <Alert severity="warning" sx={{
              mb: 2,
              borderRadius: 3,
              bgcolor: 'rgba(229, 134, 60, 0.08)',
              border: '1px solid rgba(229, 134, 60, 0.3)',
              fontFamily: '"Poppins", sans-serif',
              "& .MuiAlert-icon": { color: "#E5863C" }
            }}>
              ⚠️ SMS notification failed but property was created
            </Alert>
          )}

          {/* SELECT EXISTING USER */}
          <Box>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <TextField
                fullWidth
                select
                label="Select Resident"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                helperText="Choose an existing resident to assign this property"
                disabled={loadingUsers}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    fontFamily: '"Poppins", sans-serif',
                    "& fieldset": {
                      borderColor: 'rgba(140, 165, 81, 0.3)',
                      borderWidth: '2px'
                    },
                    "&:hover fieldset": { borderColor: "#8CA551" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#333F1F",
                      borderWidth: "2px"
                    }
                  },
                  "& .MuiInputLabel-root": {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    color: '#706f6f',
                    "&.Mui-focused": {
                      color: "#333F1F",
                      fontWeight: 600
                    }
                  },
                  "& .MuiFormHelperText-root": {
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.75rem'
                  }
                }}
              >
                {loadingUsers ? (
                  <MenuItem disabled sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    Loading users...
                  </MenuItem>
                ) : users.length === 0 ? (
                  <MenuItem disabled sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    No users available
                  </MenuItem>
                ) : (
                  users.map((user) => (
                    <MenuItem
                      key={user._id}
                      value={user._id}
                      sx={{
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 500,
                        '&:hover': { bgcolor: 'rgba(140, 165, 81, 0.08)' },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(140, 165, 81, 0.12)',
                          '&:hover': { bgcolor: 'rgba(140, 165, 81, 0.18)' }
                        }
                      }}
                    >
                      {user.firstName} {user.lastName} - {user.email}
                      {user.phoneNumber && ` 📱 ${user.phoneNumber}`}
                    </MenuItem>
                  ))
                )}
              </TextField>
              <Tooltip title="Add New Resident">
                <Button
                  variant="outlined"
                  onClick={() => setDialogOpen(true)}
                  sx={{
                    minWidth: 48,
                    height: '56px', // igual que el TextField por default
                    borderRadius: 3,
                    ml: 1,
                    px: 0,
                    bgcolor: '#fff',
                    border: '2px solid #8CA551',
                    color: '#8CA551',
                    alignSelf: 'flex-start', // <-- fuerza alineación arriba
                    mt: '0px', // <-- asegura sin margen superior
                    '&:hover': { bgcolor: 'rgba(140, 165, 81, 0.08)' }
                  }}
                >
                  <PersonAddIcon />
                </Button>
              </Tooltip>
            </Box>
            {/* PROPERTY SUMMARY */}
            <Paper sx={{
              p: 3,
              mt: 3,
              bgcolor: 'rgba(140, 165, 81, 0.05)',
              borderRadius: 3,
              border: '2px solid rgba(140, 165, 81, 0.2)'
            }}>
              <Typography variant="subtitle2" fontWeight={700} mb={2} sx={{
                color: '#333F1F',
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontSize: '0.8rem'
              }}>
                Property Summary
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif'
                  }}>
                    Lot:
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}>
                    #{selectedLot?.number}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif'
                  }}>
                    Model:
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}>
                    {selectedModel?.model}
                  </Typography>
                </Box>
                {selectedFacade && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" sx={{
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif'
                    }}>
                      Facade:
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{
                      color: '#333F1F',
                      fontFamily: '"Poppins", sans-serif'
                    }}>
                      {selectedFacade.title}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Divider sx={{ my: 2, borderColor: 'rgba(140, 165, 81, 0.3)' }} />
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700} sx={{
                    color: '#8CA551',
                    fontFamily: '"Poppins", sans-serif'
                  }}>
                    Total Price:
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{
                    color: '#8CA551',
                    fontFamily: '"Poppins", sans-serif'
                  }}>
                    ${financials.presalePrice.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif'
                  }}>
                    Initial Payment:
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}>
                    ${financials.initialDownPayment.toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif'
                  }}>
                    Mortgage:
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}>
                    ${financials.mortgage.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* ACTION BUTTON */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleAssignProperty}
              disabled={!selectedUser || submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
              sx={{
                mt: 3,
                borderRadius: 3,
                bgcolor: '#333F1F',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '1px',
                fontFamily: '"Poppins", sans-serif',
                px: 3,
                py: 1.5,
                boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  bgcolor: '#8CA551',
                  transition: 'left 0.4s ease',
                  zIndex: 0
                },
                '&:hover': {
                  bgcolor: '#333F1F',
                  boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                  '&::before': { left: 0 },
                  '& .MuiButton-startIcon': { color: 'white' }
                },
                '& .MuiButton-startIcon': {
                  position: 'relative',
                  zIndex: 1,
                  color: 'white'
                }
              }}
            >
              <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
                {submitting ? 'Assigning Property...' : 'Assign Property to Selected User'}
              </Box>
            </Button>
          </Box>

          {/* MODAL PARA CREAR USUARIO */}
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