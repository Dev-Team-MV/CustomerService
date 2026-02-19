import { Tabs, Tab, Box, Paper } from '@mui/material'
import { useState } from 'react'
import InventoryTab from './InventoryTab'
import ExteriorAmenitiesTab from './ExteriorAmenitiesTab'
import RecorridoTab from './RecorridoTab'

const MasterPlanTabs = () => {
  const [tab, setTab] = useState(0)
  return (
    <Box>
      {/* Tabs bar en su propio Paper */}
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: { xs: 3, md: 5 },
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          background: "white",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              py: { xs: 2, sm: 2.5, md: 3 },
              fontWeight: 700,
              fontSize: { xs: "0.85rem", sm: "1rem" },
              textTransform: "none",
              color: "#6c757d",
              "&.Mui-selected": {
                color: "#4a7c59",
              },
              "&:hover": {
                bgcolor: "rgba(74, 124, 89, 0.05)",
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "4px 4px 0 0",
              bgcolor: "#4a7c59",
            },
          }}
        >
          <Tab label="Inventory" />
          <Tab label="Exterior Amenities" />
          <Tab label="Master Plan Tour" />
        </Tabs>
      </Paper>

      {/* Tab content en su propio Paper */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: 3, md: 5 },
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          background: "white",
          p: { xs: 2, sm: 3, md: 4 },
          minHeight: 300,
        }}
      >
        {tab === 0 && <InventoryTab />}
        {tab === 1 && <ExteriorAmenitiesTab />}
        {tab === 2 && <RecorridoTab />}
      </Paper>
    </Box>
  )
}

export default MasterPlanTabs