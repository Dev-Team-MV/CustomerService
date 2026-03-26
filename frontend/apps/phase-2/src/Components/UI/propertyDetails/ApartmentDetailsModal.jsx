import { useState, useEffect } from 'react'
import {
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Typography,
  Paper,
  Chip,
  IconButton,
  Grid
} from '@mui/material'
import {
  Construction,
  Payment,
  Visibility,
  AccountBalance,
  Home,
  CheckCircle,
  ZoomIn,
  Image as ImageIcon,
  Bed,
  Bathtub,
  SquareFoot,
  Apartment as ApartmentIcon,
  LocationOn,
  Map
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

import api from '@shared/services/api'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import PayloadDialog from '@shared/components/Modals/PayloadDialog'
import PolygonImagePreview from '../PolygonImagePreview'
import buildingService from '../../../Services/buildingService'

import { usePayloads } from '@shared/hooks/usePayloads'
import { usePayloadColumns } from '../../../Constants/Columns/payloads'

const paymentTypes = [
  "initial down payment",
  "complementary down payment",
  "monthly payment",
  "additional payment",
  "closing payment"
]

const ApartmentDetailsModal = ({ open, onClose, apartment }) => {
  const { t } = useTranslation(['myProperty', 'common', 'payloads'])
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState(0)
  const [apartmentDetails, setApartmentDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payloads, setPayloads] = useState([])
  const [loadingPayloads, setLoadingPayloads] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [buildingData, setBuildingData] = useState(null)
  const [loadingBuilding, setLoadingBuilding] = useState(false)

  // Hook para el modal de payloads
  const {
    openDialog,
    selectedPayload,
    formData,
    setFormData,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleApprove,
    handleReject,
    handleDownload,
  } = usePayloads()

  useEffect(() => {
    if (open && apartment?._id) {
      fetchApartmentDetails()
      fetchPayloads()
    }
  }, [open, apartment?._id])

  // Fetch building data con floorPlans
  useEffect(() => {
    const fetchBuildingData = async () => {
      const buildingId = apartmentDetails?.apartmentModel?.building?._id
      if (!buildingId) return
      
      setLoadingBuilding(true)
      try {
        const data = await buildingService.getById(buildingId)
        setBuildingData(data)
      } catch (error) {
        console.error('Error fetching building data:', error)
      } finally {
        setLoadingBuilding(false)
      }
    }

    if (apartmentDetails) {
      fetchBuildingData()
    }
  }, [apartmentDetails])

  // Reset carousel cuando cambian las imágenes
  useEffect(() => {
    setCarouselIndex(0)
  }, [apartmentDetails?.selectedRenders?.length])

  const fetchApartmentDetails = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/apartments/${apartment._id}`)
      setApartmentDetails(res.data)
    } catch {
      setApartmentDetails(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayloads = async () => {
    setLoadingPayloads(true)
    try {
      const res = await api.get(`/payloads?apartment=${apartment._id}`)
      setPayloads(res.data)
    } catch {
      setPayloads([])
    } finally {
      setLoadingPayloads(false)
    }
  }

  const handleApproveWithRefresh = async (payload, e) => {
    await handleApprove(payload, e)
    await fetchApartmentDetails()
    await fetchPayloads()
  }

  const handleRejectWithRefresh = async (payload, e) => {
    await handleReject(payload, e)
    await fetchApartmentDetails()
    await fetchPayloads()
  }

  // Columnas para la tabla de pagos
  const paymentColumns = usePayloadColumns({
    t,
    onEdit: handleOpenDialog,
    onApprove: handleApproveWithRefresh,
    onReject: handleRejectWithRefresh,
    onDownload: handleDownload,
    resourceType: 'apartment'
  })

  const handlePayloadSubmit = async () => {
    await handleSubmit()
    fetchPayloads()
    fetchApartmentDetails()
  }

  // Datos del apartamento para Property Details tab
  const selectedRenders = apartmentDetails?.selectedRenders || []
  const selectedRenderType = apartmentDetails?.selectedRenderType || 'basic'
  const apartmentModel = apartmentDetails?.apartmentModel || {}
  const building = apartmentModel?.building || {}
  const floorPlanPolygonId = apartmentDetails?.floorPlanPolygonId
  const floorNumber = apartmentDetails?.floorNumber

  // Floor plan y polígono
  const floorPlansArray = Array.isArray(buildingData?.floorPlans?.data) 
    ? buildingData.floorPlans.data 
    : []
  const floorPlan = floorPlansArray.find(fp => fp.floorNumber === floorNumber)
  const apartmentPolygon = floorPlan?.polygons?.find(poly => poly.id === floorPlanPolygonId)

  const previewPolygons = apartmentPolygon ? [{
    ...apartmentPolygon,
    points: apartmentPolygon.points,
    fill: (apartmentPolygon.color || theme.palette.success.main) + 'BB',
    stroke: theme.palette.primary.main,
    strokeWidth: 3,
    isAvailable: true,
    isSel: true
  }] : []

  const handleThumbSelect = (idx) => setCarouselIndex(idx)

  if (!apartment) return null

  return (
    <Paper
      open={open}
      sx={{
        position: 'fixed',
        zIndex: 1300,
        left: 0, top: 0, width: '100vw', height: '100vh',
        bgcolor: 'rgba(0,0,0,0.15)',
        display: open ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      elevation={0}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '80%',
          maxHeight: '90vh',
          bgcolor: 'white',
          borderRadius: 4,
          boxShadow: 6,
          p: 0,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header y Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
            {t('propertyDetails')} - {apartment?.apartmentNumber ? `Apt ${apartment.apartmentNumber}` : ''}
          </Typography>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="fullWidth"
            sx={{
              mt: 2,
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                color: '#6c757d',
                fontFamily: '"Poppins", sans-serif',
                '&.Mui-selected': { color: '#4a7c59' }
              },
              '& .MuiTabs-indicator': {
                height: 4,
                borderRadius: '4px 4px 0 0',
                bgcolor: '#4a7c59'
              }
            }}
          >
            <Tab icon={<Payment />} label={t('paymentStatus')} iconPosition="start" />
            <Tab icon={<Visibility />} label={t('propertyDetailsTab')} iconPosition="start" />
            <Tab icon={<Construction />} label={t('constructionPhases')} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Content con scroll */}
        <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              {/* TAB 0: Payment Status */}
              {activeTab === 0 && (
                <Box>
                  <PageHeader
                    icon={AccountBalance}
                    title={t('paymentHistory')}
                    subtitle={t('paymentHistorySubtitle')}
                    actionButton={{
                      label: t('common:addPayment'),
                      onClick: () => {
                        handleOpenDialog()
                        setFormData({
                          apartment: apartment?._id || '',
                          amount: '',
                          date: new Date().toISOString().split('T')[0],
                          status: 'pending',
                          type: '',
                          notes: ''
                        })
                      },
                      icon: <AccountBalance />,
                      tooltip: t('common:addNewPayment')
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
                        title={t('noPayments')}
                        description={t('noPaymentsDescription')}
                        actionLabel={t('common:addPayment')}
                        onAction={() => {
                          handleOpenDialog()
                          setFormData({
                            apartment: apartment?._id || '',
                            amount: '',
                            date: new Date().toISOString().split('T')[0],
                            status: 'pending',
                            type: '',
                            notes: ''
                          })
                        }}
                      />
                    }
                    maxHeight={350}
                  />
                  <PayloadDialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    onSubmit={handlePayloadSubmit}
                    formData={formData}
                    setFormData={setFormData}
                    resources={[apartment]}
                    resourceType="apartment"
                    selectedPayload={selectedPayload}
                    paymentTypes={paymentTypes}
                  />
                </Box>
              )}

              {/* TAB 1: Property Details */}
              {activeTab === 1 && (
                <Box>
                  {loading ? (
                    <Box display="flex" justifyContent="center" py={6}>
                      <CircularProgress />
                    </Box>
                  ) : apartmentDetails ? (
                    <>
                      {/* Header with render type chip */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                          <Typography
                            variant="h5"
                            sx={{
                              fontFamily: '"Poppins", sans-serif',
                              color: theme.palette.primary.main,
                              fontWeight: 700,
                              fontSize: { xs: '1.25rem', sm: '1.5rem' },
                              mb: 0.5
                            }}
                          >
                            Apartment {apartmentDetails?.apartmentNumber || 'N/A'}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: '"Poppins", sans-serif',
                              color: theme.palette.text.secondary,
                              fontSize: '0.9rem'
                            }}
                          >
                            {apartmentModel?.name || 'No Model'} • Floor {apartmentDetails?.floorNumber || 'N/A'}
                          </Typography>
                        </Box>

                        <Chip
                          icon={<Home sx={{ fontSize: 18 }} />}
                          label={selectedRenderType === 'basic' ? 'Basic Package' : 'Upgrade Package'}
                          sx={{
                            height: 36,
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            fontFamily: '"Poppins", sans-serif',
                            bgcolor: selectedRenderType === 'basic' 
                              ? 'rgba(67,160,71,0.12)' 
                              : theme.palette.chipAdmin.bg,
                            color: selectedRenderType === 'basic' ? theme.palette.success.main : theme.palette.chipAdmin.color,
                            border: `2px solid ${selectedRenderType === 'basic' ? theme.palette.success.main : theme.palette.chipAdmin.color}`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        />
                      </Box>

                      {/* Gallery */}
                      <Box
                        sx={{
                          display: 'flex',
                          gap: { xs: 1.5, sm: 2 },
                          mb: 4,
                          height: { xs: 280, sm: 380, md: 400 },
                        }}
                      >
                        {/* Main image */}
                        <Box
                          sx={{
                            flex: 3,
                            bgcolor: '#000',
                            borderRadius: 3,
                            position: 'relative',
                            overflow: 'hidden',
                            minWidth: 0,
                            border: `2px solid ${theme.palette.cardBorder}`
                          }}
                        >
                          {selectedRenders.length > 0 ? (
                            <motion.img
                              key={carouselIndex}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              src={selectedRenders[carouselIndex]}
                              alt={`apartment-render-${carouselIndex}`}
                              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                            />
                          ) : (
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              justifyContent="center"
                              height="100%"
                              px={2}
                            >
                              <Home sx={{ fontSize: { xs: 40, sm: 60 }, color: '#666', mb: 2 }} />
                              <Typography
                                color="white"
                                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: { xs: '0.85rem', sm: '1rem' } }}
                              >
                                No apartment renders available
                              </Typography>
                            </Box>
                          )}

                          {selectedRenders.length > 0 && (
                            <IconButton
                              sx={{
                                position: 'absolute',
                                top: { xs: 8, sm: 12 },
                                right: { xs: 8, sm: 12 },
                                bgcolor: 'rgba(255,255,255,0.95)',
                                width: { xs: 32, sm: 38 },
                                height: { xs: 32, sm: 38 },
                                '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' }
                              }}
                            >
                              <ZoomIn sx={{ fontSize: { xs: 18, sm: 22 } }} />
                            </IconButton>
                          )}

                          {selectedRenders.length > 1 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 12,
                                left: 12,
                                bgcolor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontFamily: '"Poppins", sans-serif',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            >
                              {carouselIndex + 1} / {selectedRenders.length}
                            </Box>
                          )}
                        </Box>

                        {/* Thumbnails */}
                        <Box
                          sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: { xs: 0.8, sm: 1 },
                            overflowY: 'auto',
                            minWidth: 0,
                            pr: 0.5,
                            '&::-webkit-scrollbar': { width: 4 },
                            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                            '&::-webkit-scrollbar-thumb': {
                              bgcolor: theme.palette.primary.main + '33',
                              borderRadius: 2,
                            },
                          }}
                        >
                          {selectedRenders.length === 0 ? (
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              justifyContent="center"
                              height="100%"
                            >
                              <ImageIcon sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem', textAlign: 'center' }}
                              >
                                No images available
                              </Typography>
                            </Box>
                          ) : (
                            selectedRenders.map((url, i) => (
                              <motion.div
                                key={`thumb-${i}`}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                style={{ flexShrink: 0 }}
                              >
                                <Box
                                  onClick={() => handleThumbSelect(i)}
                                  sx={{
                                    width: '100%',
                                    aspectRatio: '16/9',
                                    borderRadius: 1.5,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: i === carouselIndex
                                      ? `2.5px solid ${theme.palette.primary.main}`
                                      : `1.5px solid ${theme.palette.cardBorder}`,
                                    boxShadow: i === carouselIndex
                                      ? `0 4px 16px ${theme.palette.primary.main}4D`
                                      : 'none',
                                    transition: 'all 0.25s ease',
                                    position: 'relative',
                                    '&:hover': {
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                      borderColor: i === carouselIndex ? theme.palette.primary.main : theme.palette.secondary.main,
                                    }
                                  }}
                                >
                                  <img
                                    src={url}
                                    alt={`thumb-${i}`}
                                    loading="lazy"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  />
                                  {i === carouselIndex && (
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        bgcolor: theme.palette.primary.main,
                                        borderRadius: '50%',
                                        width: 18,
                                        height: 18,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: `0 2px 8px ${theme.palette.primary.main}66`
                                      }}
                                    >
                                      <CheckCircle sx={{ fontSize: 12, color: 'white' }} />
                                    </Box>
                                  )}
                                </Box>
                              </motion.div>
                            ))
                          )}
                        </Box>
                      </Box>

                      {/* Floor Plan Location View */}
                      {!loadingBuilding && floorPlan && apartmentPolygon && (
                        <Box sx={{ mb: 4 }}>
                          <Box mb={2}>
                            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                              <Map sx={{ color: theme.palette.secondary.main, fontSize: 24 }} />
                              <Typography
                                variant="h6"
                                sx={{
                                  fontFamily: '"Poppins", sans-serif',
                                  color: theme.palette.primary.main,
                                  fontWeight: 700,
                                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                                  letterSpacing: '0.5px',
                                }}
                              >
                                Floor Plan Location
                              </Typography>
                            </Box>
                            <Box sx={{ width: 60, height: 3, bgcolor: theme.palette.secondary.main, borderRadius: 1 }} />
                          </Box>

                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              border: `1px solid ${theme.palette.cardBorder}`,
                              bgcolor: theme.palette.cardBg,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                width: '100%',
                                mx: 'auto',
                                position: 'relative',
                                bgcolor: '#f5f5f5',
                                borderRadius: 2,
                                overflow: 'hidden',
                                minHeight: 300,
                                maxHeight: 400
                              }}
                            >
                              <PolygonImagePreview
                                imageUrl={floorPlan.url}
                                polygons={previewPolygons}
                                maxWidth={800}
                                maxHeight={500}
                                highlightPolygonId={floorPlanPolygonId}
                                showLabels={false}
                                onPolygonClick={() => {}}
                                onPolygonHover={() => {}}
                              />
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                textAlign: 'center',
                                mt: 1.5,
                                color: theme.palette.text.secondary,
                                fontFamily: '"Poppins", sans-serif',
                                fontSize: '0.75rem'
                              }}
                            >
                              Your apartment location on Floor {floorNumber}
                            </Typography>
                          </Paper>
                        </Box>
                      )}

                      {/* Apartment Specifications */}
                      <Box sx={{ mt: 4 }}>
                        <Box mb={3}>
                          <Box display="flex" alignItems="center" gap={2} mb={1.5} flexWrap="wrap">
                            <Typography
                              variant="h6"
                              sx={{
                                fontFamily: '"Poppins", sans-serif',
                                color: theme.palette.primary.main,
                                fontWeight: 700,
                                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                                letterSpacing: '0.5px',
                              }}
                            >
                              Apartment Specifications
                            </Typography>
                          </Box>
                          <Box sx={{ width: 60, height: 3, bgcolor: theme.palette.secondary.main, borderRadius: 1 }} />
                        </Box>

                        {/* Specs Grid */}
                        <Grid container spacing={3}>
                          {/* Model Info */}
                          <Grid item xs={12} sm={6} md={3}>
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2.5,
                                  borderRadius: 2,
                                  border: `1px solid ${theme.palette.cardBorder}`,
                                  bgcolor: theme.palette.cardBg,
                                  height: '100%'
                                }}
                              >
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 2,
                                      bgcolor: theme.palette.chipAdmin.bg,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <ApartmentIcon sx={{ color: theme.palette.chipAdmin.color, fontSize: 22 }} />
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontFamily: '"Poppins", sans-serif',
                                      color: theme.palette.text.secondary,
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px'
                                    }}
                                  >
                                    Model
                                  </Typography>
                                </Box>
                                <Typography
                                  sx={{
                                    fontFamily: '"Poppins", sans-serif',
                                    color: theme.palette.primary.main,
                                    fontSize: '1.1rem',
                                    fontWeight: 700
                                  }}
                                >
                                  {apartmentModel?.name || 'N/A'}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: '"Poppins", sans-serif',
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  Model #{apartmentModel?.modelNumber || 'N/A'}
                                </Typography>
                              </Paper>
                            </motion.div>
                          </Grid>

                          {/* Bedrooms */}
                          <Grid item xs={12} sm={6} md={3}>
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2.5,
                                  borderRadius: 2,
                                  border: `1px solid ${theme.palette.cardBorder}`,
                                  bgcolor: theme.palette.cardBg,
                                  height: '100%'
                                }}
                              >
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 2,
                                      bgcolor: 'rgba(67,160,71,0.12)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Bed sx={{ color: theme.palette.success.main, fontSize: 22 }} />
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontFamily: '"Poppins", sans-serif',
                                      color: theme.palette.text.secondary,
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px'
                                    }}
                                  >
                                    Bedrooms
                                  </Typography>
                                </Box>
                                <Typography
                                  sx={{
                                    fontFamily: '"Poppins", sans-serif',
                                    color: theme.palette.primary.main,
                                    fontSize: '1.8rem',
                                    fontWeight: 700
                                  }}
                                >
                                  {apartmentModel?.bedrooms || 0}
                                </Typography>
                              </Paper>
                            </motion.div>
                          </Grid>

                          {/* Bathrooms */}
                          <Grid item xs={12} sm={6} md={3}>
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2.5,
                                  borderRadius: 2,
                                  border: `1px solid ${theme.palette.cardBorder}`,
                                  bgcolor: theme.palette.cardBg,
                                  height: '100%'
                                }}
                              >
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 2,
                                      bgcolor: 'rgba(33,150,243,0.12)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Bathtub sx={{ color: theme.palette.info.main, fontSize: 22 }} />
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontFamily: '"Poppins", sans-serif',
                                      color: theme.palette.text.secondary,
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px'
                                    }}
                                  >
                                    Bathrooms
                                  </Typography>
                                </Box>
                                <Typography
                                  sx={{
                                    fontFamily: '"Poppins", sans-serif',
                                    color: theme.palette.primary.main,
                                    fontSize: '1.8rem',
                                    fontWeight: 700
                                  }}
                                >
                                  {apartmentModel?.bathrooms || 0}
                                </Typography>
                              </Paper>
                            </motion.div>
                          </Grid>

                          {/* Square Feet */}
                          <Grid item xs={12} sm={6} md={3}>
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2.5,
                                  borderRadius: 2,
                                  border: `1px solid ${theme.palette.cardBorder}`,
                                  bgcolor: theme.palette.cardBg,
                                  height: '100%'
                                }}
                              >
                                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 2,
                                      bgcolor: 'rgba(255,152,0,0.12)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <SquareFoot sx={{ color: theme.palette.warning.main, fontSize: 22 }} />
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontFamily: '"Poppins", sans-serif',
                                      color: theme.palette.text.secondary,
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px'
                                    }}
                                  >
                                    Area
                                  </Typography>
                                </Box>
                                <Typography
                                  sx={{
                                    fontFamily: '"Poppins", sans-serif',
                                    color: theme.palette.primary.main,
                                    fontSize: '1.5rem',
                                    fontWeight: 700
                                  }}
                                >
                                  {apartmentModel?.sqft || 0}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: '"Poppins", sans-serif',
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  sq ft
                                </Typography>
                              </Paper>
                            </motion.div>
                          </Grid>
                        </Grid>

                        {/* Building & Location Info */}
                        <Box sx={{ mt: 3 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2.5,
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.cardBorder}`,
                              bgcolor: theme.palette.cardBg
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                              <LocationOn sx={{ color: theme.palette.secondary.main, fontSize: 22 }} />
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontFamily: '"Poppins", sans-serif',
                                  color: theme.palette.primary.main,
                                  fontWeight: 700,
                                  fontSize: '0.95rem'
                                }}
                              >
                                Location Details
                              </Typography>
                            </Box>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={4}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: '"Poppins", sans-serif',
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.7rem',
                                    display: 'block',
                                    mb: 0.5
                                  }}
                                >
                                  Building
                                </Typography>
                                <Typography
                                  sx={{
                                    fontFamily: '"Poppins", sans-serif',
                                    color: theme.palette.primary.main,
                                    fontSize: '0.9rem',
                                    fontWeight: 600
                                  }}
                                >
                                  {building?.name || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: '"Poppins", sans-serif',
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.7rem',
                                    display: 'block',
                                    mb: 0.5
                                  }}
                                >
                                  Section
                                </Typography>
                                <Typography
                                  sx={{
                                    fontFamily: '"Poppins", sans-serif',
                                    color: theme.palette.primary.main,
                                    fontSize: '0.9rem',
                                    fontWeight: 600
                                  }}
                                >
                                  {building?.section || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontFamily: '"Poppins", sans-serif',
                                    color: theme.palette.text.secondary,
                                    fontSize: '0.7rem',
                                    display: 'block',
                                    mb: 0.5
                                  }}
                                >
                                  Total Floors
                                </Typography>
                                <Typography
                                  sx={{
                                    fontFamily: '"Poppins", sans-serif',
                                    color: theme.palette.primary.main,
                                    fontSize: '0.9rem',
                                    fontWeight: 600
                                  }}
                                >
                                  {building?.floors || 'N/A'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Box>
                      </Box>
                    </>
                  ) : (
                    <Box py={6} textAlign="center">
                      <Typography
                        color="text.secondary"
                        fontWeight={700}
                        sx={{ fontFamily: '"Poppins", sans-serif' }}
                      >
                        No apartment details available
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* TAB 2: Construction Phases */}
              {activeTab === 2 && (
                <Box py={6} textAlign="center">
                  <Typography
                    color="text.secondary"
                    fontWeight={700}
                    sx={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {t('En construcción...')}
                  </Typography>
                </Box>
              )}
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Botón cerrar */}
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#4a7c59'
            }}
            aria-label={t('common:close')}
          >
            ×
          </button>
        </Box>
      </Box>
    </Paper>
  )
}

export default ApartmentDetailsModal