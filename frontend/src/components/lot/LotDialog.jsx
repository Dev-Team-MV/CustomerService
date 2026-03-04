import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  CircularProgress
} from '@mui/material'
import { Landscape } from '@mui/icons-material'
import projectService from '../../services/projectService'

const LotDialog = ({ open, onClose, selectedLot, onSubmit }) => {
  const { t } = useTranslation(['lots', 'common'])
  
  const [formData, setFormData] = useState({
    number: '',
    price: 0,
    status: 'available',
    project: '',
    projectId: ''
  })

  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  // Cargar proyectos al abrir
  useEffect(() => {
    if (open) fetchProjects()
  }, [open])

  // Cargar datos del lote seleccionado
  useEffect(() => {
    if (selectedLot) {
      const projectId = typeof selectedLot.project === 'object'
        ? selectedLot.project?._id
        : selectedLot.project || selectedLot.projectId || ''

      setFormData({
        number: selectedLot.number,
        price: selectedLot.price,
        status: selectedLot.status,
        project: projectId,
        projectId: projectId
      })
    } else {
      setFormData({
        number: '',
        price: 0,
        status: 'available',
        project: '',
        projectId: ''
      })
    }
  }, [selectedLot, open])

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true)
      const data = await projectService.getAll()
      setProjects(data)
      
      // Auto-seleccionar si solo hay uno y no estamos editando
      if (data.length === 1 && !selectedLot) {
        setFormData(prev => ({
          ...prev,
          project: data[0]._id,
          projectId: data[0]._id
        }))
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleSubmit = () => {
    if (!formData.number || !formData.price || !formData.project) {
      alert(t('lots:form.validation'))
      return
    }

    const payload = {
      number: formData.number,
      price: Number(formData.price),
      status: formData.status,
      project: String(formData.project),
      projectId: String(formData.projectId || formData.project)
    }

    onSubmit(payload, selectedLot)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: '#333F1F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
            }}
          >
            <Landscape sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                color: '#333F1F',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {selectedLot ? t('lots:dialog.editTitle') : t('lots:dialog.addTitle')}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('lots:dialog.subtitle')}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2.5}>
          {/* SELECT PROJECT */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label={t('lots:form.project') || 'Project *'}
              value={formData.project}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                project: e.target.value,
                projectId: e.target.value
              }))}
              disabled={loadingProjects}
              helperText={t('lots:form.projectHelp') || 'Select the project this lot belongs to'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontFamily: '"Poppins", sans-serif',
                  bgcolor: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(140, 165, 81, 0.3)',
                    borderWidth: '2px'
                  },
                  '&:hover fieldset': {
                    borderColor: '#8CA551'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#333F1F',
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  color: '#706f6f',
                  '&.Mui-focused': {
                    color: '#333F1F',
                    fontWeight: 600
                  }
                },
                '& .MuiFormHelperText-root': {
                  fontFamily: '"Poppins", sans-serif'
                }
              }}
            >
              {loadingProjects ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading projects...
                </MenuItem>
              ) : projects.length === 0 ? (
                <MenuItem disabled>No projects available</MenuItem>
              ) : (
                projects.map((project) => (
                  <MenuItem
                    key={project._id}
                    value={project._id}
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      '&:hover': { bgcolor: 'rgba(140, 165, 81, 0.08)' }
                    }}
                  >
                    {project.name} {project.slug ? `(${project.slug})` : ''}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>

          {/* LOT NUMBER */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('lots:form.number')}
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontFamily: '"Poppins", sans-serif',
                  '& fieldset': {
                    borderColor: 'rgba(140, 165, 81, 0.3)',
                    borderWidth: '2px'
                  },
                  '&:hover fieldset': {
                    borderColor: '#8CA551'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#333F1F',
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  color: '#706f6f',
                  '&.Mui-focused': {
                    color: '#333F1F',
                    fontWeight: 600
                  }
                }
              }}
            />
          </Grid>

          {/* PRICE */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label={t('lots:form.price')}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
              InputProps={{
                startAdornment: (
                  <Typography
                    sx={{
                      mr: 0.5,
                      fontSize: '0.875rem',
                      color: '#333F1F',
                      fontWeight: 600
                    }}
                  >
                    $
                  </Typography>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontFamily: '"Poppins", sans-serif',
                  '& fieldset': {
                    borderColor: 'rgba(140, 165, 81, 0.3)',
                    borderWidth: '2px'
                  },
                  '&:hover fieldset': {
                    borderColor: '#8CA551'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#333F1F',
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  color: '#706f6f',
                  '&.Mui-focused': {
                    color: '#333F1F',
                    fontWeight: 600
                  }
                }
              }}
            />
          </Grid>

          {/* STATUS */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label={t('lots:form.status')}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontFamily: '"Poppins", sans-serif',
                  '& fieldset': {
                    borderColor: 'rgba(140, 165, 81, 0.3)',
                    borderWidth: '2px'
                  },
                  '&:hover fieldset': {
                    borderColor: '#8CA551'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#333F1F',
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  color: '#706f6f',
                  '&.Mui-focused': {
                    color: '#333F1F',
                    fontWeight: 600
                  }
                }
              }}
            >
              <MenuItem value="available" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                {t('lots:status.available')}
              </MenuItem>
              <MenuItem value="pending" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                {t('lots:status.pending')}
              </MenuItem>
              <MenuItem value="sold" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                {t('lots:status.sold')}
              </MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.2,
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif',
            border: '2px solid #e0e0e0',
            '&:hover': {
              bgcolor: 'rgba(112, 111, 111, 0.05)',
              borderColor: '#706f6f'
            }
          }}
        >
          {t('common:actions.cancel')}
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.number || !formData.price || !formData.project}
          sx={{
            borderRadius: 3,
            bgcolor: '#333F1F',
            color: 'white',
            fontWeight: 600,
            textTransform: 'none',
            letterSpacing: '1px',
            fontFamily: '"Poppins", sans-serif',
            px: 4,
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
              '&::before': {
                left: 0
              }
            },
            '&:disabled': {
              bgcolor: '#e0e0e0',
              color: '#9e9e9e',
              boxShadow: 'none'
            },
            '& span': {
              position: 'relative',
              zIndex: 1
            }
          }}
        >
          <span>{selectedLot ? t('lots:dialog.update') : t('lots:dialog.create')}</span>
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LotDialog