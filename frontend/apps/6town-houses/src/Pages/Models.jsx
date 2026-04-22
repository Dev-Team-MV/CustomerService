// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Pages/Models.jsx

import { useState, useEffect } from 'react'
import {
  Box, Container, Paper, Tabs, Tab, Button,
  Typography, CircularProgress, Alert, Snackbar
} from '@mui/material'
import { Edit, Save, Cancel, Info, Layers, Home } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import api from '@shared/services/api'
import { useCatalogConfig } from '@shared/hooks/useCatalogConfig'
import PageHeader from '@shared/components/PageHeader'
import BaseInfoTab from '../Components/models/BaseInfoTab'
import FloorTab from '../Components/models/Floortab'

const DEFAULT_FORM = {
  model: '',
  modelNumber: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  sqft: '',
  stories: '4'
}

const Models = () => {
  const theme = useTheme()
  const projectId = import.meta.env.VITE_PROJECT_ID

  const { catalogConfig, loading: loadingCatalog, transformCatalogToFloors } = useCatalogConfig(projectId, { activeOnly: true })

  const [activeTab, setActiveTab] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [model, setModel] = useState(null)
  const [floors, setFloors] = useState([])
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    if (!loadingCatalog && catalogConfig) {
      fetchModelData()
    }
  }, [loadingCatalog, catalogConfig])

  const fetchModelData = async () => {
    try {
      setLoading(true)
      
      const modelsRes = await api.get('/models', { params: { projectId } })
      const projectModel = modelsRes.data[0]
      
      if (!projectModel) {
        const floorsFromCatalog = transformCatalogToFloors(catalogConfig)
        
        const newModel = await api.post('/models', {
          projectId,
          model: '6Town Houses Model',
          modelNumber: 'M1',
          price: 280000,
          bedrooms: 3,
          bathrooms: 3,
          sqft: 1800,
          stories: 4,
          status: 'active',
          floors: floorsFromCatalog
        })
        
        setModel(newModel.data)
        setFormData({
          model: newModel.data.model,
          modelNumber: newModel.data.modelNumber,
          price: newModel.data.price,
          bedrooms: newModel.data.bedrooms,
          bathrooms: newModel.data.bathrooms,
          sqft: newModel.data.sqft,
          stories: newModel.data.stories
        })
        setFloors(newModel.data.floors || floorsFromCatalog)
      } else {
        setModel(projectModel)
        setFormData({
          model: projectModel.model || '',
          modelNumber: projectModel.modelNumber || '',
          price: projectModel.price || '',
          bedrooms: projectModel.bedrooms || '',
          bathrooms: projectModel.bathrooms || '',
          sqft: projectModel.sqft || '',
          stories: projectModel.stories || '4'
        })
        
        try {
          const floorsRes = await api.get(`/models/${projectModel._id}/floors`)
          const existingFloors = floorsRes.data.floors || []
          
          if (existingFloors.length === 0) {
            const floorsFromCatalog = transformCatalogToFloors(catalogConfig)
            setFloors(floorsFromCatalog)
          } else {
            setFloors(existingFloors)
          }
        } catch (err) {
          console.warn('No floors found, using catalog:', err)
          const floorsFromCatalog = transformCatalogToFloors(catalogConfig)
          setFloors(floorsFromCatalog)
        }
      }
    } catch (err) {
      console.error('Error fetching model:', err)
      setSnackbar({ open: true, message: 'Error al cargar el modelo', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFloorChange = (floorKey, changeType, value) => {
    setFloors(prev => prev.map(floor => {
      if (floor.key !== floorKey) return floor

      if (changeType === 'media') {
        return { ...floor, media: value }
      }

      if (changeType === 'optionMedia') {
        return {
          ...floor,
          options: floor.options.map(opt =>
            opt.key === value.optionKey ? { ...opt, media: value.media } : opt
          )
        }
      }

      return floor
    }))
  }

const handleSave = async () => {
  if (!model) return

  try {
    setSaving(true)

    // Si floors está vacío, usar el catálogo
    const floorsToSend = floors.length > 0 
      ? floors 
      : transformCatalogToFloors(catalogConfig)

    const updateData = {
      model: formData.model,
      modelNumber: formData.modelNumber,
      price: Number(formData.price),
      bedrooms: Number(formData.bedrooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      sqft: Number(formData.sqft) || 0,
      stories: Number(formData.stories) || 4,
      floors: floorsToSend
    }

    console.log('Sending floors:', floorsToSend) // Debug

    await api.put(`/models/${model._id}`, updateData)
    
    setSnackbar({ open: true, message: 'Modelo actualizado exitosamente', severity: 'success' })
    setEditMode(false)
    fetchModelData()
  } catch (err) {
    console.error('Error saving model:', err)
    setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' })
  } finally {
    setSaving(false)
  }
}

  const handleCancel = () => {
    setEditMode(false)
    fetchModelData()
  }

  if (loading || loadingCatalog) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!model) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">No se pudo cargar el modelo</Alert>
      </Container>
    )
  }

  const tabs = [
    { label: 'Información Base', icon: Info },
    ...floors.map(floor => ({ label: floor.label, icon: Layers }))
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Home}
          title={model.model}
          subtitle={`${model.modelNumber} - Configuración del modelo de casa`}
          actionButton={
            editMode
              ? {
                  label: saving ? 'Guardando...' : 'Guardar Cambios',
                  onClick: handleSave,
                  icon: saving ? <CircularProgress size={20} /> : <Save />,
                  disabled: saving,
                  tooltip: 'Guardar cambios'
                }
              : {
                  label: 'Editar Modelo',
                  onClick: () => setEditMode(true),
                  icon: <Edit />,
                  tooltip: 'Editar modelo y pisos'
                }
          }
        />

        {editMode && (
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={saving}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Cancelar
            </Button>
          </Box>
        )}

        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem'
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={<tab.icon />}
                iconPosition="start"
              />
            ))}
          </Tabs>

          <Box>
            {activeTab === 0 && (
              <BaseInfoTab
                model={model}
                editMode={editMode}
                formData={formData}
                onChange={handleFormChange}
              />
            )}

            {activeTab > 0 && floors[activeTab - 1] && (
              <FloorTab
                floor={floors[activeTab - 1]}
                editMode={editMode}
                onChange={handleFloorChange}
              />
            )}
          </Box>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: 3 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

export default Models