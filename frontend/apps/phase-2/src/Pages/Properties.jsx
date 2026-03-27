import { useMemo, useState } from 'react'
import { Box, Container, Dialog } from '@mui/material'
import { Add, Home } from '@mui/icons-material'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import { useTheme } from '@mui/material/styles'
import { usePropertyColumns } from '../Constants/Columns/properties'
import { useApartments } from '../Constants/hooks/useApartments'
import { useBuildings } from '../Constants/hooks/useBuildings'

import ContractsModal from '@shared/components/Modals/ContractsModal'
import ApartmentDetailsModal from '../Components/UI/propertyDetails/ApartmentDetailsModal'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ConstructionTab from '../Components/UI/propertyDetails/ConstructionTab'
const Properties = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  // Puedes pasar un buildingId si quieres filtrar por edificio, o dejarlo null para traer todos
  const { assigned, loading, error, refresh } = useApartments()
const { buildings, loading: loadingBuildings } = useBuildings()

const { t } = useTranslation('property') // Usa el namespace adecuado, por ejemplo 'property'

  const [contractsOpen, setContractsOpen] = useState(false)
  const [selectedApartment, setSelectedApartment] = useState(null)

const [detailsOpen, setDetailsOpen] = useState(false)

const [constructionOpen, setConstructionOpen] = useState(false)
const [selectedApartmentId, setSelectedApartmentId] = useState(null)

// Crea un mapping de id a nombre
const buildingMap = useMemo(() => {
  const map = {}
  buildings?.forEach(b => { map[b._id] = b.name })
  return map
}, [buildings])

  // Adaptar los datos de apartamentos asignados al formato esperado por las columnas
  const data = useMemo(() => assigned.map(apto => ({
    _id: apto._id,
    name: `Apt ${apto.apartmentNumber} - Floor ${apto.floorNumber}`,
    building: buildingMap[apto.building] || 'N/A', // <--- Aquí
    status: apto.status,
    model: apto.apartmentModel?.name || 'N/A',
    resident: Array.isArray(apto.users) && apto.users.length > 0
      ? `${apto.users[0]?.firstName || ''} ${apto.users[0]?.lastName || ''}`.trim()
      : 'Unassigned',
    price: apto.price,
    phases: apto.phases || [],
    raw: apto
  })), [assigned, buildingMap])

const columns = usePropertyColumns({
  isAdmin: true,
  t,
  onViewDetails: (row) => {
    setSelectedApartment(row.raw)
    setDetailsOpen(true)
  },
  onEdit: null,
  onDelete: (row) => alert(`Delete property ${row.name}`),
  onOpenContracts: (row) => {
    setSelectedApartment(row.raw)
    setContractsOpen(true)
  },
    onOpenPhases: (row) => {
    setSelectedApartmentId(row.raw._id) // o row._id según tu estructura
    setConstructionOpen(true)
  }
})

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Home}
          title="Properties"
          subtitle="Manage and view all assigned apartments"
          actionButton={{
            label: (t('actions.addProperty')), // Usa la función de traducción
            onClick: () => navigate('/quote'),
            icon: <Add />,
            tooltip: 'Add new property'
          }}
        />

        <DataTable
          columns={columns}
          data={data}
          loading={loading || loadingBuildings}
          emptyState={
            <EmptyState
              icon={Home}
              title="No assigned apartments"
              description="There are no assigned apartments yet."
              actionLabel="Add Property"
              onAction={() => alert('Add property')}
            />
          }
          stickyHeader
          maxHeight={600}
        />

        <ContractsModal
          open={contractsOpen}
          onClose={() => setContractsOpen(false)}
          resource={selectedApartment}
          resourceType="apartment"
          onContractUpdated={refresh}
        />

        <ApartmentDetailsModal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          apartment={selectedApartment}
        />

        <Dialog
  open={constructionOpen}
  onClose={() => setConstructionOpen(false)}
  maxWidth="lg"
  fullWidth
>
  <Box p={2}>
    <ConstructionTab
      apartmentId={selectedApartmentId}
      isAdmin={true}
    />
  </Box>
</Dialog>
      </Container>
    </Box>
  )
}

export default Properties