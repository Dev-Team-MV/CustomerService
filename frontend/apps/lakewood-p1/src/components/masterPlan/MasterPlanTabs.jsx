import { Tabs, Tab, Box, Paper } from '@mui/material'
import { useState } from 'react'
import InventoryTab from './inventoryTab'
import ExteriorAmenitiesTab from './ExteriorAmenitiesTab'
import RecorridoTab from './RecorridoTab'
import { useTranslation } from 'react-i18next'

const MasterPlanTabs = () => {
  const { t } = useTranslation('masterPlan')
  const [tab, setTab] = useState(0)
  return (
    <Box>
      <Paper elevation={0} sx={{ mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
        >
          <Tab label={t('inventoryTab')} />
          <Tab label={t('exteriorAmenitiesTab')} />
          <Tab label={t('tourTab')} />
        </Tabs>
      </Paper>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: 300 }}>
        {tab === 0 && <InventoryTab />}
        {tab === 1 && <ExteriorAmenitiesTab />}
        {tab === 2 && <RecorridoTab />}
      </Paper>
    </Box>
  )
}

export default MasterPlanTabs