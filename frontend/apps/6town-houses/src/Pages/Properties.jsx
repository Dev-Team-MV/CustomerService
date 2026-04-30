import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Container, Dialog, Snackbar, Alert } from '@mui/material'
import { Home, Add } from '@mui/icons-material'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import { useTheme } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'

import { usePropertyColumns } from '../Constants/Columns/properties'
import { useProperties } from '../hooks/useProperties'
import propertyService from '@shared/services/propertyService'
import buildingService from '@shared/services/buildingService'
import { usePayloadColumns } from '../Constants/Columns/payloads'

import PropertyEditModal from '../Components/buildings/PropertyEditModal'
import ContractsModal from '@shared/components/Modals/ContractsModal'
import {
  ApartmentDetailsModal,
  ConstructionTab,
} from '@shared/components/propertyDetails'

const PROJECT_ID = import.meta.env.VITE_PROJECT_ID

const Properties = () => {
  const { t } = useTranslation(['property', 'common'])
  const theme = useTheme()
  const navigate = useNavigate()

  const { properties, loading, refresh } = useProperties(PROJECT_ID)

  const [buildings, setBuildings] = useState([])
  const [contractsOpen, setContractsOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [constructionOpen, setConstructionOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [propertyToEdit, setPropertyToEdit] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const buildingsRes = await buildingService.getAll({ projectId: PROJECT_ID })
        setBuildings(buildingsRes || [])
      } catch (err) {
        console.error('Error loading data:', err)
        setSnackbar({ 
          open: true, 
          message: t('property:messages.error', { message: err.message }), 
          severity: 'error' 
        })
      }
    }
    fetchData()
  }, [t])

  const buildingMap = useMemo(() => {
    const map = {}
    buildings.forEach(b => { map[b._id] = b.name })
    return map
  }, [buildings])

  const data = useMemo(() => properties.map(prop => ({
    _id: prop._id,
    name: buildingMap[prop.buildingId] || 'N/A',
    lot: prop.lot?.number || 'N/A',
    model: prop.model?.model || 'N/A',
    facade: prop.facade?.title || 'N/A',
    resident: Array.isArray(prop.users) && prop.users.length > 0
      ? `${prop.users[0]?.firstName || ''} ${prop.users[0]?.lastName || ''}`.trim()
      : t('property:messages.unassigned'),
    status: prop.status,
    price: prop.price,
    pending: prop.pending || 0,
    phases: prop.phases || [],
    raw: prop
  })), [properties, buildingMap, t])

  const handleDelete = async (row) => {
    if (!window.confirm(t('property:messages.deleteConfirm'))) return
    
    try {
      await propertyService.deleteProperty(row._id)
      setSnackbar({ 
        open: true, 
        message: t('property:messages.deleteSuccess'), 
        severity: 'success' 
      })
      refresh()
    } catch (err) {
      console.error('Error deleting property:', err)
      setSnackbar({ 
        open: true, 
        message: t('property:messages.error', { message: err.message }), 
        severity: 'error' 
      })
    }
  }

  const columns = usePropertyColumns({
    isAdmin: true,
    onViewDetails: (row) => {
      setSelectedProperty(row.raw)
      setDetailsOpen(true)
    },
    onEdit: (row) => {
      setPropertyToEdit(row.raw)
      setEditOpen(true)
    },
    onDelete: handleDelete,
    onOpenContracts: (row) => {
      setSelectedProperty(row.raw)
      setContractsOpen(true)
    },
    onOpenPhases: (row) => {
      console.log('🔍 Opening phases for:', row.raw._id, row)
      setSelectedPropertyId(row.raw._id)
      setConstructionOpen(true)
    },
    t
  })

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        title={t('property:title')}
        subtitle={t('property:subtitle')}
        icon={Home}
        actionButton={{
          label: t('property:actions.addProperty'),
          onClick: () => navigate('/get-your-quote'),
          icon: <Add />,
          tooltip: t('property:actions.addProperty')
        }}
      />

      <Box sx={{ mt: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8, textAlign: 'center' }}>
            <Box>
              Loading...
            </Box>
          </Box>
        ) : data.length === 0 ? (
          <EmptyState
            title={t('property:messages.noProperties')}
            message={t('property:messages.noPropertiesMessage')}
            icon={Home}
            actionLabel={t('property:actions.addProperty')}
            onAction={() => navigate('/get-your-quote')}
          />
        ) : (
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            stickyHeader
            maxHeight={600}
          />
        )}
      </Box>

      <ContractsModal
        open={contractsOpen}
        onClose={() => setContractsOpen(false)}
        resource={selectedProperty}
        resourceType="property"
        onContractUpdated={refresh}
      />

      <ApartmentDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        property={selectedProperty}
        usePayloadColumnsFn={usePayloadColumns}
        projectId={PROJECT_ID}
        theme={theme}
      />

      <PropertyEditModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false)
          setPropertyToEdit(null)
        }}
        property={propertyToEdit}
        projectId={PROJECT_ID}
        onSaved={(updatedProperty) => {
          console.log('Propiedad actualizada:', updatedProperty)
          setSnackbar({ 
            open: true, 
            message: t('property:messages.deleteSuccess'), 
            severity: 'success' 
          })
          refresh()
        }}
      />

      <Dialog
        open={constructionOpen}
        onClose={() => setConstructionOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <Box p={2}>
          <ConstructionTab
            propertyId={selectedPropertyId}
            isAdmin={true}
          />
        </Box>
      </Dialog>

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
  )
}

export default Properties