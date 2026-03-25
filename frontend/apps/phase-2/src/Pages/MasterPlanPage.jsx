// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Pages/MasterPlanPage.jsx

import { useState } from 'react'
import { Box, Container } from '@mui/material'
import { Map } from '@mui/icons-material'
import PageHeader from '@shared/components/PageHeader'
import MasterPlanEditor from '../Components/UI/MasterPlanEditor'
import { useMasterPlan } from '@shared/hooks/useMasterPlan'

const MasterPlanPage = () => {
  const projectId = import.meta.env.VITE_PROJECT_ID
  const { masterPlanData, loading, fetchMasterPlan, saveBuildingPolygon } = useMasterPlan()
  const [editorOpen, setEditorOpen] = useState(false)

  const handleOpenEditor = async () => {
    await fetchMasterPlan(projectId)
    setEditorOpen(true)
  }

  const handleSave = async (updates) => {
    try {
      // ✅ Pasar todo el objeto polygonData, no solo polygon
      for (const update of updates) {
        const { buildingId, polygon, polygonColor, polygonStrokeColor, polygonOpacity } = update
        await saveBuildingPolygon(buildingId, {
          polygon,
          polygonColor,
          polygonStrokeColor,
          polygonOpacity
        })
      }
      alert('Master plan saved successfully!')
      setEditorOpen(false)
    } catch (error) {
      alert('Error saving master plan: ' + error.message)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Map}
          title="Master Plan"
          subtitle="Edit and manage building polygons on the master plan"
          actionButton={{
            label: 'Edit Master Plan',
            onClick: handleOpenEditor,
            icon: <Map />,
            tooltip: 'Edit master plan polygons',
            disabled: loading
          }}
        />

        <MasterPlanEditor
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          masterPlanData={masterPlanData}
          onSave={handleSave}
        />
      </Container>
    </Box>
  )
}

export default MasterPlanPage