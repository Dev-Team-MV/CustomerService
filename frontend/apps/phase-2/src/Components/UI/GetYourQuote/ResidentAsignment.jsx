// import { useState } from 'react'
// import {
//   Box, Paper, Typography, Button, Alert, CircularProgress
// } from '@mui/material'
// import CheckCircleIcon from '@mui/icons-material/CheckCircle'
// import { usePropertyBuilding } from '../../../Context/PropertyBuildingContext'
// import buildingService from '../../../Services/buildingService'

// const ResidentAsignment = () => {
//   const {
//     selectedBuilding,
//     selectedApartment,
//     apartmentType,
//     selectedFloor,
//     financials,
//     currentStep,
//     // Si tienes usuario seleccionado en contexto, agrégalo aquí:
//     selectedUser,
//     refreshBuildings,
//   } = usePropertyBuilding()

//   const [submitting, setSubmitting] = useState(false)
//   const [success, setSuccess] = useState('')
//   const [error, setError] = useState('')

//   // Validación rápida
//   const isReady =
//     selectedBuilding &&
//     selectedApartment &&
//     selectedFloor &&
//     selectedUser &&
//     financials?.presalePrice

//   // Handler para crear y asignar apartamento
//   const handleAssign = async () => {
//     setSubmitting(true)
//     setError('')
//     setSuccess('')
//     try {
//       if (!isReady) {
//         setError('Missing required selections.')
//         setSubmitting(false)
//         return
//       }

//       const payload = {
//         apartmentModelId: selectedApartment.apartmentModel?._id ?? selectedApartment.apartmentModel,
//         floorNumber: selectedApartment.floorNumber,
//         apartmentNumber: selectedApartment.apartmentNumber,
//         user: selectedUser._id,
//         users: [selectedUser._id],
//         price: financials.presalePrice,
//         initialPayment: financials.initialDownPayment,
//         floorPlanPolygonId: selectedApartment.floorPlanPolygonId,
//         status: 'pending'
//       }
//       await buildingService.createApartment(payload)
//       setSuccess('Apartment created and assigned successfully!')
//       refreshBuildings?.()
//     } catch (e) {
//       setError(e.message || 'Error creating apartment')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   return (
//     <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', mt: 3 }}>
//       <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
//         Resident Assignment
//       </Typography>

//       {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
//       {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

//       <Box sx={{ mb: 2 }}>
//         <Typography>
//           <strong>Building:</strong> {selectedBuilding?.name}
//         </Typography>
//         <Typography>
//           <strong>Floor:</strong> {selectedApartment?.floorNumber}
//         </Typography>
//         <Typography>
//           <strong>Apartment:</strong> {selectedApartment?.apartmentNumber}
//         </Typography>
//         <Typography>
//           <strong>Model:</strong> {selectedApartment?.apartmentModel?.name}
//         </Typography>
//         <Typography>
//           <strong>User:</strong> {selectedUser?.firstName} {selectedUser?.lastName}
//         </Typography>
//         <Typography>
//           <strong>Presale Price:</strong> ${financials?.presalePrice?.toLocaleString()}
//         </Typography>
//       </Box>

//       <Button
//         variant="contained"
//         color="primary"
//         fullWidth
//         startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
//         onClick={handleAssign}
//         disabled={submitting || !isReady}
//         sx={{ mt: 2, mb: 1 }}
//       >
//         Create & Assign Apartment
//       </Button>
//     </Paper>
//   )
// }

// export default ResidentAsignment

import { useEffect, useState } from 'react'
import {
  Box, Paper, Typography, TextField, MenuItem, Collapse, Alert, Button, CircularProgress, Tooltip
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import PersonIcon from '@mui/icons-material/Person'
import { usePropertyBuilding } from '../../../Context/PropertyBuildingContext'
import buildingService from '../../../Services/buildingService'
import ResidentDialog from '@shared/components/Modals/ResidentDialog'
import { useResidents } from '@shared/hooks/useResidents'

const ResidentAsignment = ({ expanded, onToggle }) => {
  const {
    selectedBuilding,
    selectedApartment,
    apartmentType,
    selectedFloor,
    financials,
    selectedProject, setSelectedProject,
    projects, loadingProjects, refreshProjects, selectedRenderType, setSelectedRenderType
  } = usePropertyBuilding()

  // Hook de residentes (igual que Lakewood)
  const {
    users, loading,
    openDialog, selectedUser, setSelectedUser, formData, setFormData,
    handleOpenDialog, handleCloseDialog, handleSubmit,
    handleFieldChange, handlePhoneChange, isFormValid,
    e164Value, displayVal, isPhoneValid
  } = useResidents()

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Cargar proyectos si es necesario
  useEffect(() => {
    if (expanded && (!projects || projects.length === 0)) refreshProjects?.()
  }, [expanded])

  // Validación rápida
  const isReady =
    selectedBuilding &&
    selectedApartment &&
    selectedFloor &&
    selectedUser &&
    selectedProject &&
    financials?.presalePrice

  // Handler para crear y asignar apartamento
const handleAssign = async () => {
  setSubmitting(true)
  setError('')
  setSuccess('')
  try {
    if (!isReady) {
      setError('Missing required selections.')
      setSubmitting(false)
      return
    }

    const payload = {
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
      // Ya existe: solo asignar usuario (PUT)
      await buildingService.updateApartment(selectedApartment._id, payload)
      setSuccess('Apartment assigned successfully!')
    } else {
      // No existe: crear (POST)
      await buildingService.createApartment(payload)
      setSuccess('Apartment created and assigned successfully!')
    }
  } catch (e) {
    setError(e.message || 'Error creating or assigning apartment')
  } finally {
    setSubmitting(false)
  }
}

  if (!selectedBuilding || !selectedApartment) {
    return (
      <Paper elevation={0} sx={{ p: 3, bgcolor: '#fff', borderRadius: 4, border: '1px solid #e0e0e0', opacity: 0.6 }}>
        <Typography variant="subtitle1" textAlign="center" sx={{
          py: 2, fontFamily: '"Poppins", sans-serif', letterSpacing: '1.5px',
          textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600, color: '#706f6f'
        }}>
          Select building and apartment to assign resident
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
                04 Resident Assignment
              </Typography>
              <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', fontSize: '0.75rem' }}>
                {expanded ? 'Select or create a resident' : 'Click to expand'}
              </Typography>
            </Box>
          </Box>
          {expanded ? <ExpandLessIcon sx={{ color: '#8CA551', fontSize: 28 }} /> : <ExpandMoreIcon sx={{ color: '#706f6f', fontSize: 28 }} />}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {/* SELECT PROJECT */}
          <TextField
            fullWidth
            select
            label="Project"
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value)}
            helperText="Select the project this apartment belongs to"
            disabled={loadingProjects}
            sx={{ mb: 2 }}
          >
            {loadingProjects ? (
              <MenuItem disabled>Loading projects...</MenuItem>
            ) : projects?.length === 0 ? (
              <MenuItem disabled>No projects available</MenuItem>
            ) : (
              projects.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.name}
                </MenuItem>
              ))
            )}
          </TextField>

          {/* SELECT USER */}
          <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
            <TextField
              fullWidth select
              label="Select Resident"
              value={selectedUser?._id || ''}
              onChange={e => setSelectedUser(users.find(u => u._id === e.target.value))}
              helperText="Choose an existing resident to assign this apartment"
              disabled={loading}
            >
              {loading ? (
                <MenuItem disabled>Loading users...</MenuItem>
              ) : users?.length === 0 ? (
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
            <Tooltip title="Add New Resident">
              <Button
                variant="outlined"
                   onClick={() => handleOpenDialog(null)}
                sx={{
                  minWidth: 48, height: '56px', borderRadius: 3, ml: 1, px: 0,
                  bgcolor: '#fff', border: '2px solid #8CA551', color: '#8CA551',
                  alignSelf: 'flex-start',
                  '&:hover': { bgcolor: 'rgba(140, 165, 81, 0.08)' }
                }}>
                <PersonAddIcon />
              </Button>
            </Tooltip>
          </Box>

          {/* SUMMARY */}
          <Box sx={{ mb: 2 }}>
            <Typography>
              <strong>Building:</strong> {selectedBuilding?.name}
            </Typography>
            <Typography>
              <strong>Floor:</strong> {selectedApartment?.floorNumber}
            </Typography>
            <Typography>
              <strong>Apartment:</strong> {selectedApartment?.apartmentNumber}
            </Typography>
            <Typography>
              <strong>Model:</strong> {selectedApartment?.apartmentModel?.name}
            </Typography>
            <Typography>
              <strong>User:</strong> {selectedUser?.firstName} {selectedUser?.lastName}
            </Typography>
            <Typography>
              <strong>Presale Price:</strong> ${financials?.presalePrice?.toLocaleString()}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            onClick={handleAssign}
            disabled={submitting || !isReady}
            sx={{ mt: 2, mb: 1 }}
          >
            Create & Assign Apartment
          </Button>

          {/* ResidentDialog manejado aquí, igual que Lakewood */}
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
        </Box>
      </Collapse>
    </Paper>
  )
}

export default ResidentAsignment