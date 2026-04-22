import { useMemo, useState, useEffect } from 'react'
import { Box, Container, Dialog } from '@mui/material'
import { Add, Home } from '@mui/icons-material'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import { useTheme } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { usePropertyColumns } from '../Constants/Columns/properties'
import { usePayloadColumns } from '../Constants/Columns/payloads'
import { useApartments } from '../Constants/hooks/useApartments'
import { useBuildings } from '../Constants/hooks/useBuildings'
import buildingService from '../Services/buildingService'

import ContractsModal from '@shared/components/Modals/ContractsModal'
import api from '@shared/services/api'
import {
  ApartmentDetailsModal,
  EditApartmentModal,
  ConstructionTab,
} from '@shared/components/propertyDetails'

const PROJECT_ID = import.meta.env.VITE_PROJECT_ID

const Properties = () => {
  const theme    = useTheme()
  const navigate = useNavigate()
  const { t } = useTranslation(['property', 'actions', 'common'])

  const { assigned, loading, refresh }           = useApartments()
  const { buildings, loading: loadingBuildings } = useBuildings()

  const [contractsOpen, setContractsOpen]             = useState(false)
  const [selectedApartment, setSelectedApartment]     = useState(null)
  const [detailsOpen, setDetailsOpen]                 = useState(false)
  const [constructionOpen, setConstructionOpen]       = useState(false)
  const [selectedApartmentId, setSelectedApartmentId] = useState(null)
  const [editOpen, setEditOpen]                       = useState(false)
  const [editValues, setEditValues]                   = useState({})
  const [savingEdit, setSavingEdit]                   = useState(false)
  const [apartmentModels, setApartmentModels]         = useState([])
  const [users, setUsers]                             = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modelsRes, usersRes] = await Promise.all([
          buildingService.getApartmentModels(),
          api.get('/users')
        ])
        setApartmentModels(modelsRes || [])
        setUsers(usersRes.data || [])
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }
    fetchData()
  }, [])

  const buildingMap = useMemo(() => {
    const map = {}
    buildings?.forEach(b => { map[b._id] = b.name })
    return map
  }, [buildings])

  const data = useMemo(() => assigned.map(apto => ({
    _id:      apto._id,
    name:     t('property:apartmentName', { number: apto.apartmentNumber, floor: apto.floorNumber }, 'Apt {{number}} - Floor {{floor}}'),
    building: buildingMap[apto.building] || t('common:notAvailable', 'N/A'),
    status:   apto.status,
    model:    apto.apartmentModel?.name || t('common:notAvailable', 'N/A'),
    resident: Array.isArray(apto.users) && apto.users.length > 0
      ? `${apto.users[0]?.firstName || ''} ${apto.users[0]?.lastName || ''}`.trim()
      : t('property:unassigned', 'Unassigned'),
    price:    apto.price,
    pending:  apto.pending,
    phases:   apto.phases || [],
    raw:      apto
  })), [assigned, buildingMap, t])

  const columns = usePropertyColumns({
    isAdmin: true,
    t,
    onViewDetails: (row) => {
      setSelectedApartment(row.raw)
      setDetailsOpen(true)
    },
    onEdit: (row) => {
      setSelectedApartment(row.raw)
      setEditValues({
        apartmentModel:     row.raw.apartmentModel?._id,
        floorNumber:        row.raw.floorNumber,
        apartmentNumber:    row.raw.apartmentNumber,
        users:              row.raw.users?.map(u => u._id) || [],
        price:              row.raw.price,
        initialPayment:     row.raw.initialPayment,
        pending:            row.raw.pending,
        status:             row.raw.status,
        selectedRenderType: row.raw.selectedRenderType,
        floorPlanPolygonId: row.raw.floorPlanPolygonId,
        saleDate:           row.raw.saleDate
      })
      setEditOpen(true)
    },
    onDelete: (row) => alert(t('actions.deleteProperty', { name: row.name }, `Delete property ${row.name}`)),
    onOpenContracts: (row) => {
      setSelectedApartment(row.raw)
      setContractsOpen(true)
    },
    onOpenPhases: (row) => {
      setSelectedApartmentId(row.raw._id)
      setConstructionOpen(true)
    }
  })

  const handleSaveEdit = async () => {
    setSavingEdit(true)
    try {
      await buildingService.updateApartment(selectedApartment._id, editValues)
      await refresh()
      setEditOpen(false)
      setEditValues({})
    } catch (error) {
      console.error('Error updating apartment:', error)
      alert(t('common:error', 'Error updating apartment'))
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Home}
          title={t('property:title', 'Properties')}
          subtitle={t('property:subtitleApartment', 'Manage and view all assigned apartments')}
          actionButton={{
            label:   t('actions.addProperty', 'Add Property'),
            onClick: () => navigate('/quote'),
            icon:    <Add />,
            tooltip: t('actions.addPropertyTooltip', 'Add new property')
          }}
        />

        <DataTable
          columns={columns}
          data={data}
          loading={loading || loadingBuildings}
          emptyState={
            <EmptyState
              icon={Home}
              title={t('property:noAssigned', 'No assigned apartments')}
              description={t('property:noAssignedDesc', 'There are no assigned apartments yet.')}
              actionLabel={t('actions.addProperty', 'Add Property')}
              onAction={() => navigate('/quote')}
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

        <EditApartmentModal
          open={editOpen}
          onClose={() => { setEditOpen(false); setEditValues({}) }}
          apartment={selectedApartment}
          values={editValues}
          onChange={setEditValues}
          onSave={handleSaveEdit}
          saving={savingEdit}
          apartmentModels={apartmentModels}
          users={users}
        />

        <ApartmentDetailsModal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          apartment={selectedApartment}
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