// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Pages/Properties.jsx

import { useMemo, useState, useEffect } from 'react'
import { Box, Container, Dialog } from '@mui/material'
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
import api from '@shared/services/api'

import ContractsModal from '@shared/components/Modals/ContractsModal'
import {
  ApartmentDetailsModal,
  ConstructionTab,
} from '@shared/components/propertyDetails'

const PROJECT_ID = import.meta.env.VITE_PROJECT_ID

const Properties = () => {
  const theme = useTheme()
  const navigate = useNavigate()

  const { properties, loading, refresh } = useProperties(PROJECT_ID)

  const [buildings, setBuildings] = useState([])
  const [contractsOpen, setContractsOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [constructionOpen, setConstructionOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const buildingsRes = await buildingService.getAll({ projectId: PROJECT_ID })
        setBuildings(buildingsRes || [])
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }
    fetchData()
  }, [])

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
      : 'Sin asignar',
    status: prop.status,
    price: prop.price,
    pending: prop.pending || 0,
    phases: prop.phases || [],
    raw: prop
  })), [properties, buildingMap])

  const columns = usePropertyColumns({
    isAdmin: true,
    onViewDetails: (row) => {
      setSelectedProperty(row.raw)
      setDetailsOpen(true)
    },
    onEdit: (row) => {
      console.log('Editar:', row)
    },
    onDelete: async (row) => {
      if (window.confirm('¿Estás seguro de eliminar esta propiedad?')) {
        try {
          await propertyService.deleteProperty(row._id)
          refresh()
        } catch (err) {
          console.error('Error deleting property:', err)
        }
      }
    },
    onOpenContracts: (row) => {
      setSelectedProperty(row.raw)
      setContractsOpen(true)
    },
onOpenPhases: (row) => {
  console.log('🔍 Opening phases for:', row.raw._id, row)
  setSelectedPropertyId(row.raw._id)
  setConstructionOpen(true)
},
    t: (key, defaultValue) => defaultValue
  })

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        title="Propiedades"
        subtitle="Gestión de propiedades asignadas"
        icon={Home}
        actionButton={{
          label: 'Agregar Propiedad',
          onClick: () => navigate('/get-your-quote'),
          icon: <Add />,
          tooltip: 'Agregar nueva propiedad'
        }}
      />

      <Box sx={{ mt: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            Cargando propiedades...
          </Box>
        ) : data.length === 0 ? (
          <EmptyState
            title="No hay propiedades"
            message="No se encontraron propiedades asignadas para este proyecto."
            icon={Home}
            actionLabel="Agregar Propiedad"
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
    </Container>
  )
}

export default Properties