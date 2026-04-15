// @sheperd/Components/Building/ApartmentsTab.jsx
import { useState } from 'react'
import { Box, Tabs, Tab, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Category, Apartment } from '@mui/icons-material'

import BuildingModelsTab from '@shared/components/Buildings/BuildingModelsTab'
import BuildingApartmentTab from '@shared/components/Buildings/BuildingApartmentTab'
import { useBuildingWithDetails } from '../../Constants/hooks/useBuilding'
import { getAllFloorsOrganized } from '../../../../../shared/config/buildingConfig'

const ApartmentsTab = ({ building, config }) => {
  const { t } = useTranslation(['buildings'])
  const [activeSubTab, setActiveSubTab] = useState(0)
  const [modelModal, setModelModal] = useState({ open: false, model: null })
  const [apartmentModal, setApartmentModal] = useState({ open: false, data: null })


  const projectId = import.meta.env.VITE_PROJECT_ID
  
  const {
    apartmentModels,
    apartments,
    loading,
    handleModelSaved,
    handleApartmentSaved,
    setApartmentModels,
    setApartments
  } = useBuildingWithDetails(projectId)
  const floors = getAllFloorsOrganized('sheperd', building?.floors)

  if (!building) {
    return (
      <Box p={3} textAlign="center">
        <Typography color="text.secondary">
          {t('buildings:noBuilding', 'No building data available')}
        </Typography>
      </Box>
    )
  }

  const handleOpenModelDialog = (model) => {
    setModelModal({ open: true, model })
  }

  const handleCloseModelDialog = () => {
    setModelModal({ open: false, model: null })
  }

  const onModelSaved = async (modelData) => {
    try {
      const savedModel = await handleModelSaved(modelData)
      handleCloseModelDialog()
      return savedModel
    } catch (err) {
      throw err
    }
  }

  // Agregar después de onModelSaved (línea 54):
const handleOpenApartment = (apartment) => {
  setApartmentModal({ open: true, data: apartment })
}
 
const handleCloseApartment = () => {
  setApartmentModal({ open: false, data: null })
}

  return (
    <Box>
      <Tabs
        value={activeSubTab}
        onChange={(e, newValue) => setActiveSubTab(newValue)}
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.9rem'
          }
        }}
      >
        <Tab icon={<Category />} iconPosition="start" label={t('buildings:tabs.models', 'Models')} />
        <Tab icon={<Apartment />} iconPosition="start" label={t('buildings:tabs.units', 'Units')} />
      </Tabs>

      {activeSubTab === 0 && (
        <BuildingModelsTab
          apartmentModels={apartmentModels || []}
          modelModal={modelModal}
          handleOpenModelDialog={handleOpenModelDialog}
          handleCloseModelDialog={handleCloseModelDialog}
          onModelSaved={onModelSaved}
          buildingId={building._id}
          buildingTotalApartments={building.totalApartments}
        />
      )}

{activeSubTab === 1 && (
  <BuildingApartmentTab
    apartments={apartments || []}
    apartmentModels={apartmentModels || []}
    building={{
      ...building,
      floorPlans: building?.floorPlans || [],
      floors: floors
    }}
    apartmentModal={apartmentModal}
    handleOpenApartment={handleOpenApartment}
    handleCloseApartment={handleCloseApartment}
    onApartmentSaved={handleApartmentSaved}
  />
)}
    </Box>
  )
}

export default ApartmentsTab