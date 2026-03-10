// import React, { useState, useEffect, useCallback } from 'react'
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Tabs,
//   Tab,
//   Box,
//   Button,
//   CircularProgress,
//   Typography,
//   Chip,
//   IconButton,
//   Tooltip,
//   Avatar,
//   Paper
// } from '@mui/material'
// import {
//   Construction,
//   Payment,
//   Visibility,
//   AccountBalance,
//   Close
// } from '@mui/icons-material'
// import { motion, AnimatePresence } from 'framer-motion'
// import { useTranslation } from 'react-i18next'
// import api from '../../services/api'
// import PropertyDetailsTab from '../myProperty/propertyDetails'
// import ConstructionTab from '../myProperty/ConstructionTab'
// import PaymentTab from '../myProperty/PaymentTab'
// import PageHeader from '../PageHeader'
// import DataTable from '../table/DataTable'
// import EmptyState from '../table/EmptyState'
// import PayloadDialog from '../payloads/createPayload'
// import AdminPropertyDetails from './AdminPropertyDetails'
// import { Edit, Download, CheckCircle, Cancel, ErrorOutline } from '@mui/icons-material'

// const PHASE_TITLES = [
//   "Site Preparation", "Foundation", "Framing", "Roofing", "MEP Installation",
//   "Drywall & Insulation", "Interior Finishes", "Exterior Completion", "Final Inspection"
// ]

// const PropertyDetailsModal = ({ open, onClose, property }) => {
//   const { t } = useTranslation(['myProperty', 'common'])
//   const [activeTab, setActiveTab] = useState(0)
//   const [propertyDetails, setPropertyDetails] = useState(null)
//   const [phases, setPhases] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [loadingPhases, setLoadingPhases] = useState(false)
//   const [payloads, setPayloads] = useState([])
//   const [loadingPayloads, setLoadingPayloads] = useState(false)

//   // Identifica si es Model 10
//   const MODEL_10_ID = "6977c7bbd1f24768968719de"
//   const isModel10 = propertyDetails?.model?._id === MODEL_10_ID
//   const balconyLabels = isModel10
//     ? { chipLabel: "Estudio", icon: Visibility, color: "#2196f3" }
//     : { chipLabel: "Balcony", icon: Visibility, color: "#4a7c59" }

//   const [createModalOpen, setCreateModalOpen] = useState(false)
//   const [formData, setFormData] = useState({
//     property: property?._id || '',
//     amount: '',
//     date: '',
//     status: 'pending',
//     type: '',
//     notes: ''
//   })

//   useEffect(() => {
//     if (open && property?._id) {
//       fetchPropertyDetails()
//       fetchPhases()
//       fetchPayloads()
//     }
//     // eslint-disable-next-line
//   }, [open, property?._id])

//   const fetchPropertyDetails = async () => {
//     setLoading(true)
//     try {
//       const res = await api.get(`/properties/${property._id}`)
//       setPropertyDetails(res.data)
//     } catch (err) {
//       setPropertyDetails(null)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchPhases = async () => {
//     setLoadingPhases(true)
//     try {
//       const res = await api.get(`/phases/property/${property._id}`)
//       const existingPhases = res.data
//       const allPhases = []
//       for (let i = 1; i <= 9; i++) {
//         const existingPhase = existingPhases.find((p) => p.phaseNumber === i)
//         if (existingPhase) {
//           allPhases.push(existingPhase)
//         } else {
//           allPhases.push({
//             phaseNumber: i,
//             title: PHASE_TITLES[i - 1],
//             constructionPercentage: 0,
//             mediaItems: [],
//             property: property._id,
//           })
//         }
//       }
//       setPhases(allPhases)
//     } catch (err) {
//       setPhases([])
//     } finally {
//       setLoadingPhases(false)
//     }
//   }

//   const fetchPayloads = async () => {
//     setLoadingPayloads(true)
//     try {
//       const res = await api.get(`/payloads?property=${property._id}`)
//       setPayloads(res.data)
//     } catch (err) {
//       setPayloads([])
//     } finally {
//       setLoadingPayloads(false)
//     }
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'signed':
//         return { bg: 'rgba(140, 165, 81, 0.12)', color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)', icon: CheckCircle }
//       case 'pending':
//         return { bg: 'rgba(229, 134, 60, 0.12)', color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)', icon: ErrorOutline }
//       case 'rejected':
//         return { bg: 'rgba(211, 47, 47, 0.12)', color: '#d32f2f', border: 'rgba(211, 47, 47, 0.3)', icon: Cancel }
//       default:
//         return { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)', icon: ErrorOutline }
//     }
//   }

//   const getFileUrl = (row) => {
//     if (!row) return null
//     if (row.urls && row.urls.length > 0) {
//       if (typeof row.urls[0] === 'string') return row.urls[0]
//       if (row.urls[0] && row.urls[0].url) return row.urls[0].url
//     }
//     if (typeof row.urls === 'string') return row.urls
//     if (row.fileUrl) return row.fileUrl
//     if (row.documentUrl) return row.documentUrl
//     if (row.attachment) return row.attachment
//     return null
//   }

//   const handleApprove = async (payload) => {
//     if (!payload) return
//     if (!window.confirm(t('common:confirmApprove'))) return
//     try {
//       await api.put(`/payloads/${payload._id}`, { status: 'signed' })
//       fetchPayloads()
//     } catch (err) {
//       alert(t('common:errorApproving'))
//     }
//   }

//   const handleReject = async (payload) => {
//     if (!payload) return
//     if (!window.confirm(t('common:confirmReject'))) return
//     try {
//       await api.put(`/payloads/${payload._id}`, { status: 'rejected' })
//       fetchPayloads()
//     } catch (err) {
//       alert(t('common:errorRejecting'))
//     }
//   }

//   const handleDownload = useCallback((payload) => {
//     const url = getFileUrl(payload)
//     if (!url) {
//       alert(t('common:noFileAvailable'))
//       return
//     }
//     window.open(url, '_blank', 'noopener')
//   }, [t])

//   const paymentColumns = [
//     {
//       field: 'payer',
//       headerName: t('common:payer'),
//       minWidth: 180,
//       renderCell: ({ row }) => (
//         <Box display="flex" alignItems="center" gap={1}>
//           <Avatar
//             sx={{
//               width: 40,
//               height: 40,
//               bgcolor: 'transparent',
//               background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
//               color: 'white',
//               fontWeight: 700,
//               fontSize: '1rem',
//               fontFamily: '"Poppins", sans-serif',
//               border: '2px solid rgba(255, 255, 255, 0.9)',
//               boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
//             }}
//           >
//             {row.payer?.firstName?.charAt(0) || 'U'}
//           </Avatar>
//           <Box>
//             <Typography
//               variant="body2"
//               sx={{
//                 fontWeight: 500,
//                 color: '#1a1a1a',
//                 fontFamily: '"Poppins", sans-serif'
//               }}
//             >
//               {row.payer?.firstName} {row.payer?.lastName}
//             </Typography>
//           </Box>
//         </Box>
//       )
//     },
//     {
//       field: 'date',
//       headerName: t('common:date'),
//       minWidth: 120,
//       renderCell: ({ value }) => (
//         <Typography
//           variant="body2"
//           sx={{
//             color: '#706f6f',
//             fontFamily: '"Poppins", sans-serif'
//           }}
//         >
//           {new Date(value).toLocaleDateString()}
//         </Typography>
//       )
//     },
//     {
//       field: 'amount',
//       headerName: t('common:amount'),
//       minWidth: 120,
//       renderCell: ({ value }) => (
//         <Typography
//           variant="body2"
//           sx={{
//             fontWeight: 700,
//             color: '#333F1F',
//             fontFamily: '"Poppins", sans-serif'
//           }}
//         >
//           ${value?.toLocaleString()}
//         </Typography>
//       )
//     },
//     {
//       field: 'type',
//       headerName: t('common:type'),
//       minWidth: 140,
//       renderCell: ({ value }) => (
//         <Chip
//           label={value || 'N/A'}
//           size="small"
//           sx={{
//             fontWeight: 600,
//             fontFamily: '"Poppins", sans-serif',
//             height: 28,
//             px: 1.5,
//             fontSize: '0.75rem',
//             letterSpacing: '0.5px',
//             borderRadius: 2,
//             textTransform: 'capitalize',
//             bgcolor: 'rgba(33, 150, 243, 0.12)',
//             color: '#1976d2',
//             border: '1px solid rgba(33, 150, 243, 0.3)'
//           }}
//         />
//       )
//     },
//     {
//       field: 'status',
//       headerName: t('common:status'),
//       minWidth: 120,
//       renderCell: ({ row }) => {
//         const statusColors = getStatusColor(row.status)
//         const StatusIcon = statusColors.icon

//         return (
//           <Chip
//             label={t(`common:status.${row.status}`)}
//             icon={<StatusIcon />}
//             size="small"
//             sx={{
//               fontWeight: 600,
//               fontFamily: '"Poppins", sans-serif',
//               height: 28,
//               px: 1.5,
//               fontSize: '0.75rem',
//               letterSpacing: '0.5px',
//               borderRadius: 2,
//               textTransform: 'capitalize',
//               bgcolor: statusColors.bg,
//               color: statusColors.color,
//               border: `1px solid ${statusColors.border}`,
//               '& .MuiChip-icon': { color: statusColors.color }
//             }}
//           />
//         )
//       }
//     },
//     {
//       field: 'docs',
//       headerName: t('common:docs'),
//       align: 'center',
//       width: 80,
//       renderCell: ({ row }) => (
//         <Tooltip title={getFileUrl(row) ? t('common:downloadFile') : t('common:noFileAttached')}>
//           <span>
//             <IconButton
//               size="small"
//               onClick={(e) => {
//                 e.stopPropagation()
//                 handleDownload(row)
//               }}
//               disabled={!getFileUrl(row)}
//               sx={{
//                 bgcolor: 'rgba(140, 165, 81, 0.08)',
//                 border: '1px solid rgba(140, 165, 81, 0.2)',
//                 borderRadius: 2,
//                 transition: 'all 0.3s ease',
//                 '&:hover': {
//                   bgcolor: '#8CA551',
//                   borderColor: '#8CA551',
//                   transform: 'scale(1.1)',
//                   '& .MuiSvgIcon-root': {
//                     color: 'white'
//                   }
//                 },
//                 '&:disabled': {
//                   opacity: 0.3,
//                   bgcolor: 'rgba(112, 111, 111, 0.08)'
//                 }
//               }}
//             >
//               <Download sx={{ fontSize: 18, color: '#8CA551' }} />
//             </IconButton>
//           </span>
//         </Tooltip>
//       )
//     },
//     {
//       field: 'actions',
//       headerName: t('common:actions'),
//       align: 'center',
//       minWidth: 160,
//       renderCell: ({ row }) => (
//         <Box sx={{ display: 'flex', gap: 0.5 }}>
//           <Tooltip title={t('common:approve')}>
//             <span>
//               <IconButton
//                 size="small"
//                 onClick={() => handleApprove(row)}
//                 disabled={row.status === 'signed'}
//                 sx={{
//                   bgcolor: 'rgba(76, 175, 80, 0.08)',
//                   border: '1px solid rgba(76, 175, 80, 0.2)',
//                   borderRadius: 2,
//                   transition: 'all 0.3s ease',
//                   '&:hover': {
//                     bgcolor: '#4caf50',
//                     borderColor: '#4caf50',
//                     transform: 'scale(1.1)',
//                     '& .MuiSvgIcon-root': {
//                       color: 'white'
//                     }
//                   },
//                   '&:disabled': {
//                     opacity: 0.3,
//                     bgcolor: 'rgba(112, 111, 111, 0.08)'
//                   }
//                 }}
//               >
//                 <CheckCircle sx={{ fontSize: 18, color: '#4caf50' }} />
//               </IconButton>
//             </span>
//           </Tooltip>
//           <Tooltip title={t('common:reject')}>
//             <span>
//               <IconButton
//                 size="small"
//                 onClick={() => handleReject(row)}
//                 disabled={row.status === 'rejected'}
//                 sx={{
//                   bgcolor: 'rgba(211, 47, 47, 0.08)',
//                   border: '1px solid rgba(211, 47, 47, 0.2)',
//                   borderRadius: 2,
//                   transition: 'all 0.3s ease',
//                   '&:hover': {
//                     bgcolor: '#d32f2f',
//                     borderColor: '#d32f2f',
//                     transform: 'scale(1.1)',
//                     '& .MuiSvgIcon-root': {
//                       color: 'white'
//                     }
//                   },
//                   '&:disabled': {
//                     opacity: 0.3,
//                     bgcolor: 'rgba(112, 111, 111, 0.08)'
//                   }
//                 }}
//               >
//                 <Cancel sx={{ fontSize: 18, color: '#d32f2f' }} />
//               </IconButton>
//             </span>
//           </Tooltip>
//         </Box>
//       )
//     }
//   ]

//   if (!property) return null

//   return (
//     <Dialog 
//       open={open} 
//       onClose={onClose} 
//       maxWidth="xl" 
//       fullWidth
//       PaperProps={{
//         sx: {
//           borderRadius: { xs: 0, sm: 4 },
//           maxHeight: { xs: '100vh', sm: '90vh' },
//           m: { xs: 0, sm: 2 },
//           width: { xs: '100%', sm: 'calc(100% - 32px)' }
//         }
//       }}
//     >
//       {/* ✅ HEADER STICKY */}
//       <Box
//         sx={{
//           position: 'sticky',
//           top: 0,
//           zIndex: 10,
//           bgcolor: 'white',
//           borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
//           p: { xs: 2, sm: 3 }
//         }}
//       >
//         <Box 
//           display="flex" 
//           alignItems="center" 
//           justifyContent="space-between"
//           flexWrap="wrap"
//           gap={2}
//         >
//           <Box display="flex" alignItems="center" gap={2} flex={1} minWidth={0}>
//             <Visibility sx={{ color: "#8CA551", fontSize: { xs: 24, sm: 28 } }} />
//             <Box flex={1} minWidth={0}>
//               <Typography 
//                 variant="h6" 
//                 fontWeight={700}
//                 sx={{
//                   fontFamily: '"Poppins", sans-serif',
//                   fontSize: { xs: '1.1rem', sm: '1.25rem' }
//                 }}
//               >
//                 {t('propertyDetails')} - {t('lot')} #{property.lot?.number}
//               </Typography>
//               {propertyDetails?.model && (
//                 <Typography
//                   variant="caption"
//                   sx={{
//                     color: '#706f6f',
//                     fontFamily: '"Poppins", sans-serif'
//                   }}
//                 >
//                   {propertyDetails.model.model}
//                 </Typography>
//               )}
//             </Box>
//           </Box>
//           <IconButton
//             onClick={onClose}
//             sx={{
//               color: '#706f6f',
//               '&:hover': {
//                 bgcolor: 'rgba(112, 111, 111, 0.08)',
//                 color: '#333F1F'
//               }
//             }}
//           >
//             <Close />
//           </IconButton>
//         </Box>
//       </Box>

//       <DialogContent sx={{ p: 0 }}>
//         {loading ? (
//           <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
//             <CircularProgress sx={{ color: "#8CA551" }} />
//           </Box>
//         ) : (
//           <>
//             {/* ✅ TABS CON ESTILO DE MYPROPERTY */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//             >
//               <Paper
//                 elevation={0}
//                 sx={{
//                   m: { xs: 2, sm: 3 },
//                   mb: 0,
//                   background: "white",
//                   borderRadius: { xs: 3, md: 5 },
//                   overflow: "hidden",
//                   border: "1px solid rgba(0, 0, 0, 0.06)",
//                   boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
//                 }}
//               >
//                 <Tabs
//                   value={activeTab}
//                   onChange={(_, v) => setActiveTab(v)}
//                   variant="fullWidth"
//                   sx={{
//                     "& .MuiTab-root": {
//                       py: { xs: 2, sm: 2.5, md: 3 },
//                       px: { xs: 1.5, sm: 2, md: 3 },
//                       fontWeight: 700,
//                       fontSize: {
//                         xs: "0.75rem",
//                         sm: "0.9rem",
//                         md: "1rem",
//                       },
//                       textTransform: "none",
//                       color: "#6c757d",
//                       transition: "all 0.3s ease",
//                       minHeight: { xs: 56, sm: 64, md: 72 },
//                       flexDirection: { xs: "column", sm: "row" },
//                       gap: { xs: 0.3, sm: 1 },
//                       fontFamily: '"Poppins", sans-serif',
//                       "&.Mui-selected": {
//                         color: "#4a7c59",
//                       },
//                       "&:hover": {
//                         bgcolor: "rgba(74, 124, 89, 0.05)",
//                       },
//                       "& .MuiSvgIcon-root": {
//                         fontSize: { xs: 16, sm: 20, md: 24 },
//                       },
//                     },
//                     "& .MuiTabs-indicator": {
//                       height: { xs: 3, md: 4 },
//                       borderRadius: "4px 4px 0 0",
//                       bgcolor: "#4a7c59",
//                     },
//                   }}
//                 >
//                   <Tab
//                     icon={<Payment />}
//                     label={t('paymentStatus')}
//                     iconPosition="start"
//                   />
//                   <Tab
//                     icon={<Visibility />}
//                     label={t('propertyDetailsTab')}
//                     iconPosition="start"
//                   />
//                   <Tab
//                     icon={<Construction />}
//                     label={t('constructionPhases')}
//                     iconPosition="start"
//                   />
//                 </Tabs>
//               </Paper>
//             </motion.div>

//             {/* ✅ TAB CONTENT */}
//             <Box sx={{ p: { xs: 2, sm: 3 } }}>
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={activeTab}
//                   initial={{ opacity: 0, y: 30 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -30 }}
//                   transition={{ duration: 0.4 }}
//                 >
//                   {activeTab === 0 && (
//                     <Box>
//                       <PageHeader
//                         icon={AccountBalance}
//                         title={t('paymentHistory')}
//                         subtitle={t('paymentHistorySubtitle')}
//                         actionButton={{
//                           label: t('common:addPayment'),
//                           onClick: () => {
//                             setFormData({
//                               property: property?._id || '',
//                               amount: '',
//                               date: '',
//                               status: 'pending',
//                               type: '',
//                               notes: ''
//                             })
//                             setCreateModalOpen(true)
//                           },
//                           icon: <AccountBalance />,
//                           tooltip: t('common:addNewPayment')
//                         }}
//                         animateIcon={false}
//                         gradientColors={['#333F1F', '#8CA551', '#333F1F']}
//                       />

//                       <DataTable
//                         columns={paymentColumns}
//                         data={payloads}
//                         loading={loadingPayloads}
//                         emptyState={
//                           <EmptyState
//                             title={t('noPayments')}
//                             description={t('noPaymentsDescription')}
//                             actionLabel={t('common:addPayment')}
//                             onAction={() => setCreateModalOpen(true)}
//                           />
//                         }
//                         maxHeight={350}
//                       />

//                       <PayloadDialog
//                         open={createModalOpen}
//                         onClose={() => setCreateModalOpen(false)}
//                         onSubmit={async () => {
//                           await api.post('/payloads', formData)
//                           setCreateModalOpen(false)
//                           fetchPayloads()
//                         }}
//                         formData={formData}
//                         setFormData={setFormData}
//                         properties={[property]}
//                         selectedPayload={null}
//                       />
//                     </Box>
//                   )}

//                   {activeTab === 1 && propertyDetails && (
//                     <AdminPropertyDetails
//                       propertyDetails={propertyDetails}
//                       isModel10={isModel10}
//                       balconyLabels={balconyLabels}
//                     />
//                   )}

//                   {activeTab === 1 && !propertyDetails && (
//                     <Box py={6} textAlign="center">
//                       <Typography 
//                         color="error" 
//                         fontWeight={700}
//                         sx={{ fontFamily: '"Poppins", sans-serif' }}
//                       >
//                         {t('noAccessToDetails')}
//                       </Typography>
//                     </Box>
//                   )}

//                   {activeTab === 2 && (
//                     <ConstructionTab
//                       phases={phases}
//                       loadingPhases={loadingPhases}
//                     />
//                   )}
//                 </motion.div>
//               </AnimatePresence>
//             </Box>
//           </>
//         )}
//       </DialogContent>

//       <DialogActions sx={{ p: { xs: 2, sm: 3 }, borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
//         <Button 
//           onClick={onClose} 
//           color="inherit"
//           sx={{
//             fontFamily: '"Poppins", sans-serif',
//             fontWeight: 600,
//             textTransform: 'none'
//           }}
//         >
//           {t('common:close')}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )
// }

// export default PropertyDetailsModal         
import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Button,
  CircularProgress,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Paper
} from '@mui/material'
import {
  Construction,
  Payment,
  Visibility,
  AccountBalance,
  Close,
  Download,
  CheckCircle,
  Cancel,
  ErrorOutline
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import PageHeader from '../PageHeader'
import DataTable from '../table/DataTable'
import EmptyState from '../table/EmptyState'
import PayloadDialog from '../payloads/createPayload'
import AdminPropertyDetails from './AdminPropertyDetails'
import { ConstructionPhasesContent } from '../ConstructionPhasesContent'

const PropertyDetailsModal = ({ open, onClose, property, isAdmin }) => {
  const { t } = useTranslation(['myProperty', 'common'])
  const [activeTab, setActiveTab]             = useState(0)
  const [propertyDetails, setPropertyDetails] = useState(null)
  const [loading, setLoading]                 = useState(true)
  const [payloads, setPayloads]               = useState([])
  const [loadingPayloads, setLoadingPayloads] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const MODEL_10_ID   = "6977c7bbd1f24768968719de"
  const isModel10     = propertyDetails?.model?._id === MODEL_10_ID
  const balconyLabels = isModel10
    ? { chipLabel: "Estudio", icon: Visibility, color: "#2196f3" }
    : { chipLabel: "Balcony", icon: Visibility, color: "#4a7c59" }

  const [formData, setFormData] = useState({
    property: property?._id || '',
    amount: '', date: '', status: 'pending', type: '', notes: ''
  })

  useEffect(() => {
    if (open && property?._id) {
      fetchPropertyDetails()
      fetchPayloads()
    }
  }, [open, property?._id])

  const fetchPropertyDetails = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/properties/${property._id}`)
      setPropertyDetails(res.data)
    } catch { setPropertyDetails(null) }
    finally  { setLoading(false) }
  }

  const fetchPayloads = async () => {
    setLoadingPayloads(true)
    try {
      const res = await api.get(`/payloads?property=${property._id}`)
      setPayloads(res.data)
    } catch { setPayloads([]) }
    finally  { setLoadingPayloads(false) }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'signed':   return { bg: 'rgba(140,165,81,0.12)',  color: '#333F1F', border: 'rgba(140,165,81,0.3)',  icon: CheckCircle }
      case 'pending':  return { bg: 'rgba(229,134,60,0.12)',  color: '#E5863C', border: 'rgba(229,134,60,0.3)',  icon: ErrorOutline }
      case 'rejected': return { bg: 'rgba(211,47,47,0.12)',   color: '#d32f2f', border: 'rgba(211,47,47,0.3)',   icon: Cancel }
      default:         return { bg: 'rgba(112,111,111,0.12)', color: '#706f6f', border: 'rgba(112,111,111,0.3)', icon: ErrorOutline }
    }
  }

  const getFileUrl = (row) => {
    if (!row) return null
    if (row.urls?.length > 0) return typeof row.urls[0] === 'string' ? row.urls[0] : row.urls[0]?.url
    if (typeof row.urls === 'string') return row.urls
    return row.fileUrl || row.documentUrl || row.attachment || null
  }

  const handleApprove = async (payload) => {
    if (!payload || !window.confirm(t('common:confirmApprove'))) return
    try {
      await api.put(`/payloads/${payload._id}`, { status: 'signed' })
      fetchPayloads()
    } catch { alert(t('common:errorApproving')) }
  }

  const handleReject = async (payload) => {
    if (!payload || !window.confirm(t('common:confirmReject'))) return
    try {
      await api.put(`/payloads/${payload._id}`, { status: 'rejected' })
      fetchPayloads()
    } catch { alert(t('common:errorRejecting')) }
  }

  const handleDownload = useCallback((payload) => {
    const url = getFileUrl(payload)
    if (!url) { alert(t('common:noFileAvailable')); return }
    window.open(url, '_blank', 'noopener')
  }, [t])

  const paymentColumns = [
    {
      field: 'payer',
      headerName: t('common:payer'),
      minWidth: 180,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar sx={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
            color: 'white', fontWeight: 700, fontSize: '1rem',
            fontFamily: '"Poppins", sans-serif',
            border: '2px solid rgba(255,255,255,0.9)',
            boxShadow: '0 4px 12px rgba(51,63,31,0.2)'
          }}>
            {row.payer?.firstName?.charAt(0) || 'U'}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a', fontFamily: '"Poppins", sans-serif' }}>
            {row.payer?.firstName} {row.payer?.lastName}
          </Typography>
        </Box>
      )
    },
    {
      field: 'date',
      headerName: t('common:date'),
      minWidth: 120,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
          {new Date(value).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'amount',
      headerName: t('common:amount'),
      minWidth: 120,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
          ${value?.toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'type',
      headerName: t('common:type'),
      minWidth: 140,
      renderCell: ({ value }) => (
        <Chip
          label={value || 'N/A'} size="small"
          sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif', height: 28, px: 1.5, fontSize: '0.75rem', borderRadius: 2, textTransform: 'capitalize', bgcolor: 'rgba(33,150,243,0.12)', color: '#1976d2', border: '1px solid rgba(33,150,243,0.3)' }}
        />
      )
    },
    {
      field: 'status',
      headerName: t('common:statusTitle'),
      minWidth: 120,
      renderCell: ({ row }) => {
        const s = getStatusColor(row.status)
        const StatusIcon = s.icon
        return (
          <Chip
            label={t(`common:status.${row.status}`)}
            icon={<StatusIcon />}
            size="small"
            sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif', height: 28, px: 1.5, fontSize: '0.75rem', borderRadius: 2, textTransform: 'capitalize', bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}`, '& .MuiChip-icon': { color: s.color } }}
          />
        )
      }
    },
    {
      field: 'docs',
      headerName: t('common:docs'),
      align: 'center',
      width: 80,
      renderCell: ({ row }) => (
        <Tooltip title={getFileUrl(row) ? t('common:downloadFile') : t('common:noFileAttached')}>
          <span>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleDownload(row) }}
              disabled={!getFileUrl(row)}
              sx={{ bgcolor: 'rgba(140,165,81,0.08)', border: '1px solid rgba(140,165,81,0.2)', borderRadius: 2, transition: 'all 0.3s ease', '&:hover': { bgcolor: '#8CA551', borderColor: '#8CA551', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } }, '&:disabled': { opacity: 0.3 } }}
            >
              <Download sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </span>
        </Tooltip>
      )
    },
    {
      field: 'actions',
      headerName: t('common:actionsTitle'),
      align: 'center',
      minWidth: 160,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('common:approve')}>
            <span>
              <IconButton
                size="small" onClick={() => handleApprove(row)} disabled={row.status === 'signed'}
                sx={{ bgcolor: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.2)', borderRadius: 2, transition: 'all 0.3s ease', '&:hover': { bgcolor: '#4caf50', borderColor: '#4caf50', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } }, '&:disabled': { opacity: 0.3 } }}
              >
                <CheckCircle sx={{ fontSize: 18, color: '#4caf50' }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('common:reject')}>
            <span>
              <IconButton
                size="small" onClick={() => handleReject(row)} disabled={row.status === 'rejected'}
                sx={{ bgcolor: 'rgba(211,47,47,0.08)', border: '1px solid rgba(211,47,47,0.2)', borderRadius: 2, transition: 'all 0.3s ease', '&:hover': { bgcolor: '#d32f2f', borderColor: '#d32f2f', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } }, '&:disabled': { opacity: 0.3 } }}
              >
                <Cancel sx={{ fontSize: 18, color: '#d32f2f' }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )
    }
  ]

  if (!property) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          maxHeight: { xs: '100vh', sm: '90vh' },
          m: { xs: 0, sm: 2 },
          width: { xs: '100%', sm: 'calc(100% - 32px)' }
        }
      }}
    >
      {/* ── Header sticky ── */}
      <Box sx={{
        position: 'sticky', top: 0, zIndex: 10,
        bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)',
        p: { xs: 2, sm: 3 }
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2} flex={1} minWidth={0}>
            <Visibility sx={{ color: '#8CA551', fontSize: { xs: 24, sm: 28 } }} />
            <Box flex={1} minWidth={0}>
              <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                {t('propertyDetails')} - {t('lot')} #{property.lot?.number}
              </Typography>
              {propertyDetails?.model && (
                <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
                  {propertyDetails.model.model}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#706f6f', '&:hover': { bgcolor: 'rgba(112,111,111,0.08)', color: '#333F1F' } }}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress sx={{ color: '#8CA551' }} />
          </Box>
        ) : (
          <>
            {/* ── Tabs ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Paper elevation={0} sx={{
                m: { xs: 2, sm: 3 }, mb: 0,
                background: 'white', borderRadius: { xs: 3, md: 5 },
                overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
              }}>
                <Tabs
                  value={activeTab}
                  onChange={(_, v) => setActiveTab(v)}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      py: { xs: 2, sm: 2.5, md: 3 }, px: { xs: 1.5, sm: 2, md: 3 },
                      fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1rem' },
                      textTransform: 'none', color: '#6c757d', transition: 'all 0.3s ease',
                      minHeight: { xs: 56, sm: 64, md: 72 },
                      flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0.3, sm: 1 },
                      fontFamily: '"Poppins", sans-serif',
                      '&.Mui-selected': { color: '#4a7c59' },
                      '&:hover': { bgcolor: 'rgba(74,124,89,0.05)' },
                      '& .MuiSvgIcon-root': { fontSize: { xs: 16, sm: 20, md: 24 } }
                    },
                    '& .MuiTabs-indicator': { height: { xs: 3, md: 4 }, borderRadius: '4px 4px 0 0', bgcolor: '#4a7c59' }
                  }}
                >
                  <Tab icon={<Payment />}      label={t('paymentStatus')}      iconPosition="start" />
                  <Tab icon={<Visibility />}   label={t('propertyDetailsTab')} iconPosition="start" />
                  <Tab icon={<Construction />} label={t('constructionPhases')} iconPosition="start" />
                </Tabs>
              </Paper>
            </motion.div>

            {/* ── Tab content ── */}
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4 }}
                >

                  {/* ── Tab 0: Payments ── */}
                  {activeTab === 0 && (
                    <Box>
                      <PageHeader
                        icon={AccountBalance}
                        title={t('paymentHistory')}
                        subtitle={t('paymentHistorySubtitle')}
                        actionButton={{
                          label: t('common:addPayment'),
                          onClick: () => {
                            setFormData({ property: property?._id || '', amount: '', date: '', status: 'pending', type: '', notes: '' })
                            setCreateModalOpen(true)
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
                            onAction={() => setCreateModalOpen(true)}
                          />
                        }
                        maxHeight={350}
                      />
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

                  {/* ── Tab 1: Property Details ── */}
                  {activeTab === 1 && propertyDetails && (
                    <AdminPropertyDetails
                      propertyDetails={propertyDetails}
                      isModel10={isModel10}
                      balconyLabels={balconyLabels}
                    />
                  )}
                  {activeTab === 1 && !propertyDetails && (
                    <Box py={6} textAlign="center">
                      <Typography color="error" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                        {t('noAccessToDetails')}
                      </Typography>
                    </Box>
                  )}

                  {/* ── Tab 2: Construction — inline, sin modal ── */}
                  {activeTab === 2 && (
                    <ConstructionPhasesContent
                      property={property}
                      isAdmin={isAdmin}
                    />
                  )}

                </motion.div>
              </AnimatePresence>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: { xs: 2, sm: 3 }, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <Button onClick={onClose} color="inherit" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, textTransform: 'none' }}>
          {t('common:close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PropertyDetailsModal