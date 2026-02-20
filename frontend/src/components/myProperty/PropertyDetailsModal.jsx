import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Button,
  CircularProgress,
  Typography,Chip, IconButton, Tooltip, Avatar
} from '@mui/material'
import {
  Construction,
  Payment,
  Visibility,
  AccountBalance
} from '@mui/icons-material'
import api from '../../services/api'
import PropertyDetailsTab from '../myProperty/propertyDetails'
import ConstructionTab from '../myProperty/ConstructionTab'
import PaymentTab from '../myProperty/PaymentTab'
import PageHeader from '../PageHeader'
import DataTable from '../table/DataTable'
import EmptyState from '../table/EmptyState'
import PayloadDialog from '../payloads/createPayload'
import AdminPropertyDetails from './AdminPropertyDetails'
import { Edit, Download, CheckCircle, Cancel, ErrorOutline } from '@mui/icons-material'


const PHASE_TITLES = [
  "Site Preparation", "Foundation", "Framing", "Roofing", "MEP Installation",
  "Drywall & Insulation", "Interior Finishes", "Exterior Completion", "Final Inspection"
]

const PropertyDetailsModal = ({ open, onClose, property }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [propertyDetails, setPropertyDetails] = useState(null)
  const [phases, setPhases] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingPhases, setLoadingPhases] = useState(false)
  const [payloads, setPayloads] = useState([])
  const [loadingPayloads, setLoadingPayloads] = useState(false)

  // Identifica si es Model 10
  const MODEL_10_ID = "6977c7bbd1f24768968719de"
  const isModel10 = propertyDetails?.model?._id === MODEL_10_ID
  const balconyLabels = isModel10
    ? { chipLabel: "Estudio", icon: Visibility, color: "#2196f3" }
    : { chipLabel: "Balcony", icon: Visibility, color: "#4a7c59" }


const [createModalOpen, setCreateModalOpen] = useState(false)
const [formData, setFormData] = useState({
  property: property?._id || '',
  amount: '',
  date: '',
  status: 'pending',
  type: '',
  notes: ''
})


  useEffect(() => {
    if (open && property?._id) {
      fetchPropertyDetails()
      fetchPhases()
      fetchPayloads()
    }
    // eslint-disable-next-line
  }, [open, property?._id])

  const fetchPropertyDetails = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/properties/${property._id}`)
      setPropertyDetails(res.data)
    } catch (err) {
      setPropertyDetails(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchPhases = async () => {
    setLoadingPhases(true)
    try {
      const res = await api.get(`/phases/property/${property._id}`)
      const existingPhases = res.data
      const allPhases = []
      for (let i = 1; i <= 9; i++) {
        const existingPhase = existingPhases.find((p) => p.phaseNumber === i)
        if (existingPhase) {
          allPhases.push(existingPhase)
        } else {
          allPhases.push({
            phaseNumber: i,
            title: PHASE_TITLES[i - 1],
            constructionPercentage: 0,
            mediaItems: [],
            property: property._id,
          })
        }
      }
      setPhases(allPhases)
    } catch (err) {
      setPhases([])
    } finally {
      setLoadingPhases(false)
    }
  }

  const fetchPayloads = async () => {
    setLoadingPayloads(true)
    try {
      const res = await api.get(`/payloads?property=${property._id}`)
      setPayloads(res.data)
    } catch (err) {
      setPayloads([])
    } finally {
      setLoadingPayloads(false)
    }
  }


  // Ejemplo para la tab de pagos en PropertyDetailsModal.jsx


// Función para colores de status (puedes reutilizar la de Payloads.jsx)
const getStatusColor = (status) => {
  switch (status) {
    case 'signed':
      return { bg: 'rgba(140, 165, 81, 0.12)', color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)', icon: CheckCircle }
    case 'pending':
      return { bg: 'rgba(229, 134, 60, 0.12)', color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)', icon: ErrorOutline }
    case 'rejected':
      return { bg: 'rgba(211, 47, 47, 0.12)', color: '#d32f2f', border: 'rgba(211, 47, 47, 0.3)', icon: Cancel }
    default:
      return { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)', icon: ErrorOutline }
  }
}

// Si tienes función para obtener el archivo:
const getFileUrl = (row) => {
  if (!row) return null
  if (row.urls && row.urls.length > 0) {
    if (typeof row.urls[0] === 'string') return row.urls[0]
    if (row.urls[0] && row.urls[0].url) return row.urls[0].url
  }
  if (typeof row.urls === 'string') return row.urls
  if (row.fileUrl) return row.fileUrl
  if (row.documentUrl) return row.documentUrl
  if (row.attachment) return row.attachment
  return null
}


  const handleDownload = useCallback((payload) => {
    const url = getFileUrl(payload)
    if (!url) {
      alert('No attached file available for this payload.')
      return
    }
    window.open(url, '_blank', 'noopener')
  }, [getFileUrl])

const paymentColumns = [
  {
    field: 'payer',
    headerName: 'PAYER',
    minWidth: 180,
    renderCell: ({ row }) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'transparent',
            background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1rem',
            fontFamily: '"Poppins", sans-serif',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
          }}
        >
          {row.payer?.firstName?.charAt(0) || 'U'}
        </Avatar>
        <Box>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: '#1a1a1a',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            {row.payer?.firstName} {row.payer?.lastName}
          </Typography>
        </Box>
      </Box>
    )
  },
  {
    field: 'date',
    headerName: 'DATE',
    minWidth: 120,
    renderCell: ({ value }) => (
      <Typography
        variant="body2"
        sx={{
          color: '#706f6f',
          fontFamily: '"Poppins", sans-serif'
        }}
      >
        {new Date(value).toLocaleDateString()}
      </Typography>
    )
  },
  {
    field: 'amount',
    headerName: 'AMOUNT',
    minWidth: 120,
    renderCell: ({ value }) => (
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: '#333F1F',
          fontFamily: '"Poppins", sans-serif'
        }}
      >
        ${value?.toLocaleString()}
      </Typography>
    )
  },
  {
    field: 'type',
    headerName: 'TYPE',
    minWidth: 140,
    renderCell: ({ value }) => (
      <Chip
        label={value || 'N/A'}
        size="small"
        sx={{
          fontWeight: 600,
          fontFamily: '"Poppins", sans-serif',
          height: 28,
          px: 1.5,
          fontSize: '0.75rem',
          letterSpacing: '0.5px',
          borderRadius: 2,
          textTransform: 'capitalize',
          bgcolor: 'rgba(33, 150, 243, 0.12)',
          color: '#1976d2',
          border: '1px solid rgba(33, 150, 243, 0.3)'
        }}
      />
    )
  },
  {
    field: 'status',
    headerName: 'STATUS',
    minWidth: 120,
    renderCell: ({ row }) => {
      const statusColors = getStatusColor(row.status)
      const StatusIcon = statusColors.icon

      return (
        <Chip
          label={row.status}
          icon={<StatusIcon />}
          size="small"
          sx={{
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
            height: 28,
            px: 1.5,
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            borderRadius: 2,
            textTransform: 'capitalize',
            bgcolor: statusColors.bg,
            color: statusColors.color,
            border: `1px solid ${statusColors.border}`,
            '& .MuiChip-icon': { color: statusColors.color }
          }}
        />
      )
    }
  },
  {
    field: 'docs',
    headerName: 'DOCS',
    align: 'center',
    width: 80,
    renderCell: ({ row }) => (
      <Tooltip title={getFileUrl(row) ? 'Download file' : 'No file attached'}>
        <span>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleDownload(row) 
            }}
            disabled={!getFileUrl(row)}
            sx={{
              bgcolor: 'rgba(140, 165, 81, 0.08)',
              border: '1px solid rgba(140, 165, 81, 0.2)',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#8CA551',
                borderColor: '#8CA551',
                transform: 'scale(1.1)',
                '& .MuiSvgIcon-root': {
                  color: 'white'
                }
              },
              '&:disabled': {
                opacity: 0.3,
                bgcolor: 'rgba(112, 111, 111, 0.08)'
              }
            }}
          >
            <Download sx={{ fontSize: 18, color: '#8CA551' }} />
          </IconButton>
        </span>
      </Tooltip>
    )
  }
]

const propertyImages = React.useMemo(() => {
  if (!propertyDetails) return {
    exterior: [],
    interior: [],
    facade: [],
    blueprints: [],
    main: ''
  }

  // Imágenes del objeto raíz
  const rootImages = propertyDetails.images || {}
  // Imágenes del modelo (pueden estar en propertyDetails.model)
  const modelImages = propertyDetails.model?.images || {}

  // Facade puede estar en raíz o en modelo
  const facade = propertyDetails.facade
    ? Array.isArray(propertyDetails.facade)
      ? propertyDetails.facade
      : [propertyDetails.facade]
    : (
      propertyDetails.model?.facade
        ? (Array.isArray(propertyDetails.model.facade)
            ? propertyDetails.model.facade
            : [propertyDetails.model.facade])
        : []
    )

  // Blueprints puede estar en raíz o en modelo
  let blueprints = []
  if (propertyDetails.blueprints) {
    if (Array.isArray(propertyDetails.blueprints)) {
      blueprints = propertyDetails.blueprints
    } else if (propertyDetails.blueprints.default) {
      blueprints = propertyDetails.blueprints.default
    }
  } else if (propertyDetails.model?.blueprints) {
    if (Array.isArray(propertyDetails.model.blueprints)) {
      blueprints = propertyDetails.model.blueprints
    } else if (propertyDetails.model.blueprints.default) {
      blueprints = propertyDetails.model.blueprints.default
    }
  }

  // Unir imágenes exterior/interior de ambos niveles
  const exterior = [
    ...(rootImages.exterior || []),
    ...(modelImages.exterior || [])
  ]
  const interior = [
    ...(rootImages.interior || []),
    ...(modelImages.interior || [])
  ]

  // Imagen principal: primera exterior, o facade, o vacío
  const main =
    exterior[0] ||
    facade[0] ||
    ''

  return {
    exterior,
    interior,
    facade,
    blueprints,
    main
  }
}, [propertyDetails])

  if (!property) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <Visibility sx={{ color: "#8CA551" }} />
          <Typography variant="h6" fontWeight={700}>
            Property Details - Lot #{property.lot?.number}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ minHeight: 500 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress sx={{ color: "#8CA551" }} />
          </Box>
        ) : (
          <>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="fullWidth"
              sx={{
                mb: 3,
                "& .MuiTab-root": {
                  fontWeight: 700,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: "1rem",
                  textTransform: "none"
                }
              }}
            >              <Tab icon={<Payment />} label="Payment Status" iconPosition="start" />
              <Tab icon={<Visibility />} label="Property Details" iconPosition="start" />
            </Tabs>

            {activeTab === 0 && (

                <Box>
    <PageHeader
      icon={AccountBalance}
      title="Payment History"
      subtitle="Payment history and management for this property"
      actionButton={{
        label: 'Add Payment',
        onClick: () => {
          setFormData({
            property: property?._id || '',
            amount: '',
            date: '',
            status: 'pending',
            type: '',
            notes: ''
          })
          setCreateModalOpen(true)
        },
        icon: <AccountBalance />,
        tooltip: 'Add new payment'
      }}
      animateIcon={false}
      gradientColors={['#333F1F', '#8CA551', '#333F1F']}
    />

    <DataTable
      columns={paymentColumns}
      data={payloads}
      loading={loadingPayloads}
      emptyState={
        <EmptyState
          title="No payments"
          description="No payments registered for this property."
          actionLabel="Add Payment"
          onAction={() => setCreateModalOpen(true)}
        />
      }
      maxHeight={350}
    />

    {/* Modal para crear payload */}
    <PayloadDialog
      open={createModalOpen}
      onClose={() => setCreateModalOpen(false)}
      onSubmit={async () => {
        await api.post('/payloads', formData)
        setCreateModalOpen(false)
        fetchPayloads()
      }}
      formData={formData}
      setFormData={setFormData}
      properties={[property]}
      selectedPayload={null}
    />
  </Box>
            )}
{activeTab === 1 && (
  <>
    {console.log(propertyDetails)}
    <AdminPropertyDetails
    propertyDetails={propertyDetails}
    isModel10={isModel10}
    balconyLabels={balconyLabels}
    />
  </>
)}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PropertyDetailsModal