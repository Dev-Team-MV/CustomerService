// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/quote/LotSelector/BuildingsGrid.jsx

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Typography, Alert } from '@mui/material'
import BuildingCard from './BuildingCard'

const BuildingsGrid = ({ 
  validBuildings, 
  getStatusConfig, 
  onBuildingSelect, 
  onBuildingHover 
}) => {
  const { t } = useTranslation(['quote', 'common'])
  const [hoveredBuildingId, setHoveredBuildingId] = useState(null)

  if (validBuildings.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        {t('noAvailableHousesContact')}
      </Alert>
    )
  }

  return (
    <>
      <Typography variant="h6" fontWeight={600} mb={3} sx={{ fontFamily: '"Poppins", sans-serif' }}>
        {t('availableHouses')}
      </Typography>
      <Grid container spacing={3}>
        {validBuildings.map((building) => {
          const statusConfig = getStatusConfig(building.status)
          const isHovered = hoveredBuildingId === building._id

          return (
            <Grid item xs={12} sm={6} md={4} key={building._id}>
              <BuildingCard
                building={building}
                isHovered={isHovered}
                onHover={() => {
                  setHoveredBuildingId(building._id)
                  onBuildingHover(building._id)
                }}
                onLeave={() => {
                  setHoveredBuildingId(null)
                  onBuildingHover(null)
                }}
                onSelect={() => onBuildingSelect(building)}
                statusConfig={statusConfig}
              />
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}

export default BuildingsGrid