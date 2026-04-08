import { useEffect, useState } from 'react'
import {
  Box, Paper, Typography, TextField, MenuItem, Collapse, Alert, Button, CircularProgress, Tooltip
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import PersonIcon from '@mui/icons-material/Person'
import { usePropertyBuilding } from '../../context/ProperyQuoteContext'   // ← cambio
import buildingService from '@shared/services/buildingService' 
import ResidentDialog from '@shared/components/Modals/ResidentDialog'
import { useResidents } from '@shared/hooks/useResidents'
import { useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

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

  const theme = useTheme()
  const { t } = useTranslation(['quote', 'common'])
  const navigate = useNavigate()

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

  useEffect(() => {
    if (expanded && (!projects || projects.length === 0)) refreshProjects?.()
  }, [expanded])

  const isReady =
    selectedBuilding &&
    selectedApartment &&
    selectedFloor &&
    selectedUser &&
    selectedProject &&
    financials?.presalePrice

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
        await buildingService.updateApartment(selectedApartment._id, payload)
        setSuccess(t('quote:apartmentAssigned', 'Apartment assigned successfully!'))
      } else {
        await buildingService.createApartment(payload)
        setSuccess(t('quote:apartmentCreatedAssigned', 'Apartment created and assigned successfully!'))
      }
          // Redirigir después de un pequeño delay para mostrar el mensaje de éxito
    setTimeout(() => {
      navigate('/properties')
    }, 1200)
    } catch (e) {
      setError(e.message || t('quote:errorAssigning', 'Error creating or assigning apartment'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!selectedBuilding || !selectedApartment) {
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
          fontFamily: '"Poppins", sans-serif',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: theme.palette.text.secondary
        }}>
          {t('quote:selectBuildingAndApartment', 'Select building and apartment to assign resident')}
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
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontSize: '0.95rem'
              }}>
                {t('quote:residentAssignmentStep', '04 Resident Assignment')}
              </Typography>
              <Typography variant="caption" sx={{
                color: theme.palette.text.secondary,
                fontFamily: '"Poppins", sans-serif',
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

          {/* SELECT PROJECT */}
          <TextField
            fullWidth
            select
            label={t('quote:project', 'Project')}
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value)}
            helperText={t('quote:selectProject', 'Select the project this apartment belongs to')}
            disabled={loadingProjects}
            sx={{ mb: 2 }}
          >
            {loadingProjects ? (
              <MenuItem disabled>{t('quote:loadingProjects', 'Loading projects...')}</MenuItem>
            ) : projects?.length === 0 ? (
              <MenuItem disabled>{t('quote:noProjects', 'No projects available')}</MenuItem>
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
              label={t('quote:selectResident', 'Select Resident')}
              value={selectedUser?._id || ''}
              onChange={e => setSelectedUser(users.find(u => u._id === e.target.value))}
              helperText={t('quote:chooseResident', 'Choose an existing resident to assign this apartment')}
              disabled={loading}
            >
              {loading ? (
                <MenuItem disabled>{t('quote:loadingUsers', 'Loading users...')}</MenuItem>
              ) : users?.length === 0 ? (
                <MenuItem disabled>{t('quote:noUsers', 'No users available')}</MenuItem>
              ) : (
                users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} - {user.email}
                    {user.phoneNumber && ` 📱 ${user.phoneNumber}`}
                  </MenuItem>
                ))
              )}
            </TextField>
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
          </Box>

          {/* SUMMARY */}
          <Box sx={{ mb: 2 }}>
            <Typography>
              <strong>{t('quote:building', 'Building')}:</strong> {selectedBuilding?.name}
            </Typography>
            <Typography>
              <strong>{t('quote:floor', 'Floor')}:</strong> {selectedApartment?.floorNumber}
            </Typography>
            <Typography>
              <strong>{t('quote:apartment', 'Apartment')}:</strong> {selectedApartment?.apartmentNumber}
            </Typography>
            <Typography>
              <strong>{t('quote:model', 'Model')}:</strong> {selectedApartment?.apartmentModel?.name}
            </Typography>
            <Typography>
              <strong>{t('quote:user', 'User')}:</strong> {selectedUser?.firstName} {selectedUser?.lastName}
            </Typography>
            <Typography>
              <strong>{t('quote:presalePrice', 'Presale Price')}:</strong> ${financials?.presalePrice?.toLocaleString()}
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
            {t('quote:createAndAssign', 'Create & Assign Apartment')}
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
        </Box>
      </Collapse>
    </Paper>
  )
}

export default ResidentAsignment