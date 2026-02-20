import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material'
import {
  Payment,
  Upload,
  CheckCircle,
  Schedule,
  TrendingUp,
  Description,
  Info,
  CloudUpload,
  CheckCircleOutline,
  Pending,
  Cancel,
  Receipt
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import api from '../../services/api'
import uploadService from '../../services/uploadService'
import UserCreatePayload from '../payloads/UserCreatePayload'
import DataTable from '../table/DataTable'
import EmptyState from '../table/EmptyState'

const PaymentTab = ({
  propertyDetails,
  payloads,
  loadingPayloads,
  onPaymentUploaded,
  user
}) => {
      if (!propertyDetails) {
    return <Box p={3}>Loading...</Box>
  }
  const [uploadPaymentDialog, setUploadPaymentDialog] = useState(false)
  const [uploadingPayment, setUploadingPayment] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    type: "",
    support: null,
    notes: "",
  })

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "signed": return "success"
      case "pending": return "warning"
      case "rejected": return "error"
      default: return "default"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "signed": return <CheckCircleOutline />
      case "pending": return <Pending />
      case "rejected": return <Cancel />
      default: return <Receipt />
    }
  }

  // Handlers
  const handleOpenUploadPayment = () => {
    setPaymentForm({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      type: "",
      support: null,
      notes: "",
    })
    setUploadPaymentDialog(true)
  }

  const handleCloseUploadPayment = () => {
    setUploadPaymentDialog(false)
    setPaymentForm({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      type: "",
      support: null,
      notes: "",
    })
  }

  const handlePaymentFormChange = (field, value) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }))
  }

const handleSubmitPayment = async () => {
  if (!paymentForm.amount || !paymentForm.type) {
    alert('Please fill in amount and payment type')
    return
  }

  setUploadingPayment(true)
  try {
    let urls = []
    // Solo usuarios normales pueden subir archivo
    if (
      user && user.role !== 'admin' &&
      user.role !== 'superadmin' &&
      paymentForm.support
    ) {
      const url = await uploadService.uploadPaymentImage(paymentForm.support)
      urls = [url]
    }

    await api.post('/payloads', {
      property: propertyDetails.property?._id || propertyDetails._id,
      amount: paymentForm.amount,
      date: paymentForm.date,
      type: paymentForm.type,
      status: 'pending',
      urls,
      notes: paymentForm.notes
    })

    handleCloseUploadPayment()
    onPaymentUploaded && onPaymentUploaded()
    alert('Payment submitted successfully!')
  } catch (err) {
    console.error('Error submitting payment:', err)
    alert('Error submitting payment')
  } finally {
    setUploadingPayment(false)
  }
}
const totalPaid = propertyDetails?.totalPaid ?? 0;
const columns = [
  {
    field: 'date',
    headerName: 'DATE',
    minWidth: 120,
    renderCell: ({ row }) => (
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontFamily: '"Poppins", sans-serif',
          color: '#333F1F'
        }}
      >
        {new Date(row.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </Typography>
    )
  },
  {
    field: 'amount',
    headerName: 'AMOUNT',
    minWidth: 100,
    renderCell: ({ row }) => (
      <Typography
        variant="h6"
        sx={{
          color: "#8CA551",
          fontWeight: 700,
          fontFamily: '"Poppins", sans-serif',
          fontSize: "1.1rem"
        }}
      >
        ${row.amount.toLocaleString()}
      </Typography>
    )
  },
  {
    field: 'type',
    headerName: 'TYPE',
    minWidth: 120,
    renderCell: ({ row }) => (
      <Chip
        label={row.type || "N/A"}
        size="small"
        sx={{
          bgcolor: "rgba(140, 165, 81, 0.08)",
          color: "#333F1F",
          fontWeight: 600,
          textTransform: "capitalize",
          fontSize: "0.75rem",
          fontFamily: '"Poppins", sans-serif',
          border: '1px solid rgba(140, 165, 81, 0.2)'
        }}
      />
    )
  },
  {
    field: 'status',
    headerName: 'STATUS',
    minWidth: 100,
    renderCell: ({ row }) => (
      <Chip
        icon={getStatusIcon(row.status)}
        label={row.status?.toUpperCase()}
        color={getStatusColor(row.status)}
        sx={{
          fontWeight: 700,
          fontFamily: '"Poppins", sans-serif',
          fontSize: "0.7rem"
        }}
      />
    )
  },
  {
    field: 'urls',
    headerName: 'SUPPORT',
    minWidth: 120,
    renderCell: ({ row }) =>
      row.urls && row.urls.length > 0 ? (
        <Button
          size="small"
          variant="outlined"
          href={row.urls[0]}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<Description />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
            borderColor: '#e0e0e0',
            color: '#706f6f',
            '&:hover': {
              borderColor: '#333F1F',
              bgcolor: 'rgba(51, 63, 31, 0.05)'
            }
          }}
        >
          View Receipt
        </Button>
      ) : (
        <Typography
          variant="caption"
          sx={{ color: "#999", fontFamily: '"Poppins", sans-serif' }}
        >
          No document
        </Typography>
      )
  },
  {
    field: 'notes',
    headerName: 'NOTES',
    minWidth: 120,
    renderCell: ({ row }) => (
      <Typography
        variant="body2"
        sx={{
          color: "#706f6f",
          fontFamily: '"Poppins", sans-serif',
          fontSize: "0.85rem"
        }}
      >
        {row.notes || "No notes"}
      </Typography>
    )
  }
]

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          background: "white",
          borderRadius: 4,
          border: "1px solid #e0e0e0",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* HEADER */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={{ xs: 2, sm: 2, md: 3 }}
          mb={{ xs: 3, md: 4 }}
          pb={3}
          sx={{
            borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
          }}
        >
          <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }}>
            <Box
              sx={{
                width: { xs: 48, sm: 52, md: 56 },
                height: { xs: 48, sm: 52, md: 56 },
                borderRadius: 3,
                bgcolor: "#333F1F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(51, 63, 31, 0.2)",
                flexShrink: 0,
              }}
            >
              <Payment sx={{ fontSize: { xs: 24, sm: 26, md: 28 }, color: "white" }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  color: "#333F1F",
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                  letterSpacing: '0.5px'
                }}
              >
                Payment Status
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#706f6f",
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  display: { xs: "none", sm: "block" },
                }}
              >
                Manage and track your payment history
              </Typography>
            </Box>
          </Box>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              startIcon={<Upload sx={{ fontSize: { xs: 18, sm: 20 } }} />}
              onClick={handleOpenUploadPayment}
              fullWidth={false}
              sx={{
                py: { xs: 1.2, sm: 1.5 },
                px: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: "#333F1F",
                color: "white",
                fontWeight: 600,
                fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                fontFamily: '"Poppins", sans-serif',
                border: "none",
                position: "relative",
                overflow: "hidden",
                boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)',
                transition: 'all 0.3s ease',
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  bgcolor: "#8CA551",
                  transition: "left 0.4s ease",
                  zIndex: 0,
                },
                "&:hover": {
                  bgcolor: "#333F1F",
                  boxShadow: '0 8px 20px rgba(51, 63, 31, 0.3)',
                  transform: 'translateY(-2px)',
                  "&::before": { left: 0 },
                  "& .button-text, & .MuiButton-startIcon": {
                    color: "white",
                    position: "relative",
                    zIndex: 1,
                  },
                },
                "&:active": {
                  transform: 'translateY(0px)',
                  boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
                },
                "& .button-text, & .MuiButton-startIcon": {
                  position: "relative",
                  zIndex: 1,
                  transition: "color 0.3s ease",
                },
              }}
            >
              <span className="button-text">Upload Payment</span>
            </Button>
          </motion.div>
        </Box>

        {/* PAYMENT SUMMARY CARDS */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
          {[
            {
              label: "Total Paid",
              value: `$${propertyDetails.payment.totalPaid.toLocaleString()}`,
              color: "#8CA551",
              icon: <CheckCircle />,
            },
            {
              label: "Pending Amount",
              value: `$${propertyDetails.payment.totalPending.toLocaleString()}`,
              color: "#E5863C",
              icon: <Schedule />,
            },
            {
              label: "Payment Progress",
              value: `${Math.round(propertyDetails.payment.progress)}%`,
              color: "#333F1F",
              icon: <TrendingUp />,
            },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  sx={{
                    borderRadius: 3,
                    border: `1px solid #e0e0e0`,
                    bgcolor: '#fafafa',
                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: stat.color,
                      boxShadow: `0 8px 24px ${stat.color}20`,
                      bgcolor: 'white'
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={{ xs: 1.5, md: 2 }}
                      flexWrap="wrap"
                      gap={1}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#999999",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                        }}
                      >
                        {stat.label}
                      </Typography>
                      <Box
                        sx={{
                          width: { xs: 40, sm: 44, md: 48 },
                          height: { xs: 40, sm: 44, md: 48 },
                          borderRadius: "50%",
                          bgcolor: `${stat.color}10`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: stat.color,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {React.cloneElement(stat.icon, {
                          sx: { fontSize: { xs: 20, sm: 22, md: 24 } },
                        })}
                      </Box>
                    </Box>
                    <Typography
                      variant="h3"
                      fontWeight={700}
                      sx={{
                        color: stat.color,
                        letterSpacing: "-0.5px",
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: { xs: "1.75rem", sm: "2rem", md: "2.5rem" },
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* PAYMENT HISTORY SECTION */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'rgba(51, 63, 31, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Description sx={{ fontSize: 22, color: '#333F1F' }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "#333F1F",
                  fontWeight: 700,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
                  letterSpacing: '0.5px'
                }}
              >
                Payment History
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#706f6f",
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: { xs: "0.7rem", sm: "0.75rem" }
                }}
              >
                {payloads.length} transaction{payloads.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>

        <DataTable
          columns={columns}
          data={payloads}
          loading={loadingPayloads}
          emptyState={
            <Alert
              severity="info"
              icon={<Info />}
              sx={{
                borderRadius: 3,
                bgcolor: "rgba(140, 165, 81, 0.08)",
                border: "1px solid rgba(140, 165, 81, 0.3)",
                fontSize: { xs: "0.85rem", md: "1rem" },
                fontFamily: '"Poppins", sans-serif',
                "& .MuiAlert-icon": { color: "#8CA551" }
              }}
            >
              No payment transactions yet. Click "Upload Payment" to add your first payment.
            </Alert>
          }
          stickyHeader
          maxHeight={400}
        />
        </Box>
      </Paper>


      <UserCreatePayload
  open={uploadPaymentDialog}
  onClose={handleCloseUploadPayment}
  onSubmit={handleSubmitPayment}
  paymentForm={paymentForm}
  handlePaymentFormChange={handlePaymentFormChange}
  uploadingPayment={uploadingPayment}
/>
    </>
  )
}

export default PaymentTab