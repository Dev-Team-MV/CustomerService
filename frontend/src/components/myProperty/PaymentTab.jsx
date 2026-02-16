import React,{ useState } from 'react'
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

const PaymentTab = ({ 
  propertyDetails, 
  payloads, 
  loadingPayloads,
  onPaymentUploaded 
}) => {
  const [uploadPaymentDialog, setUploadPaymentDialog] = useState(false)
  const [uploadingPayment, setUploadingPayment] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    type: "",
    support: "",
    notes: "",
  })

  // ✅ Helper functions
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

  // ✅ Handlers
  const handleOpenUploadPayment = () => {
    setPaymentForm({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      type: "",
      support: "",
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
      support: "",
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
      const formData = new FormData()
      formData.append('property', propertyDetails.property._id)
      formData.append('amount', paymentForm.amount)
      formData.append('date', paymentForm.date)
      formData.append('type', paymentForm.type)
      formData.append('status', 'pending')
      
      if (paymentForm.support) {
        formData.append('support', paymentForm.support)
      }
      
      if (paymentForm.notes) {
        formData.append('notes', paymentForm.notes)
      }

      await api.post('/payloads', formData)
      handleCloseUploadPayment()
      onPaymentUploaded() // Callback to refresh data
      alert('Payment submitted successfully!')
    } catch (err) {
      console.error('Error submitting payment:', err)
      alert('Error submitting payment')
    } finally {
      setUploadingPayment(false)
    }
  }

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
        {/* ✅ HEADER */}
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
              fullWidth={{ xs: true, sm: false }}
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
    
        {/* ✅ PAYMENT SUMMARY CARDS */}
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
    
        {/* ✅ PAYMENT HISTORY SECTION */}
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
    
          {loadingPayloads ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress sx={{ color: "#333F1F" }} />
            </Box>
          ) : payloads.length > 0 ? (
            <>
              {/* ✅ DESKTOP TABLE */}
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  display: { xs: "none", md: "block" },
                  borderRadius: 3,
                  border: "1px solid #e0e0e0",
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#fafafa" }}>
                      {["Date", "Amount", "Type", "Status", "Support", "Notes"].map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            fontWeight: 700,
                            color: "#333F1F",
                            fontFamily: '"Poppins", sans-serif',
                            fontSize: "0.85rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payloads.map((payload, index) => (
                      <motion.tr
                        key={payload._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        component={TableRow}
                        sx={{
                          "&:hover": { bgcolor: "rgba(140, 165, 81, 0.05)" },
                          transition: "all 0.3s ease",
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              fontFamily: '"Poppins", sans-serif',
                              color: '#333F1F'
                            }}
                          >
                            {new Date(payload.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#8CA551",
                              fontWeight: 700,
                              fontFamily: '"Poppins", sans-serif',
                              fontSize: "1.1rem"
                            }}
                          >
                            ${payload.amount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={payload.type || "N/A"}
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
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(payload.status)}
                            label={payload.status.toUpperCase()}
                            color={getStatusColor(payload.status)}
                            sx={{
                              fontWeight: 700,
                              fontFamily: '"Poppins", sans-serif',
                              fontSize: "0.7rem"
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {payload.support ? (
                            <Button
                              size="small"
                              variant="outlined"
                              href={payload.support}
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
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#706f6f",
                              fontFamily: '"Poppins", sans-serif',
                              fontSize: "0.85rem"
                            }}
                          >
                            {payload.notes || "No notes"}
                          </Typography>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
    
              {/* ✅ MOBILE CARDS */}
              <Box sx={{ display: { xs: "block", md: "none" } }}>
                {payloads.map((payload, index) => (
                  <motion.div
                    key={payload._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      sx={{
                        mb: 2,
                        borderRadius: 3,
                        border: "1px solid #e0e0e0",
                        bgcolor: '#fafafa',
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 8px 24px rgba(51, 63, 31, 0.12)",
                          borderColor: "#8CA551",
                          bgcolor: 'white'
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={2}
                          flexWrap="wrap"
                          gap={1}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#706f6f",
                              fontWeight: 600,
                              fontFamily: '"Poppins", sans-serif'
                            }}
                          >
                            {new Date(payload.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </Typography>
                          <Chip
                            icon={getStatusIcon(payload.status)}
                            label={payload.status.toUpperCase()}
                            color={getStatusColor(payload.status)}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.7rem",
                              fontFamily: '"Poppins", sans-serif'
                            }}
                          />
                        </Box>

                        {payload.type && (
                          <Box mb={2}>
                            <Chip
                              label={payload.type}
                              size="small"
                              sx={{
                                bgcolor: "rgba(140, 165, 81, 0.08)",
                                color: "#333F1F",
                                fontWeight: 600,
                                textTransform: "capitalize",
                                fontSize: "0.7rem",
                                fontFamily: '"Poppins", sans-serif',
                                border: '1px solid rgba(140, 165, 81, 0.2)'
                              }}
                            />
                          </Box>
                        )}

                        <Box
                          sx={{
                            p: 2,
                            bgcolor: "rgba(140, 165, 81, 0.05)",
                            borderRadius: 2,
                            mb: 2,
                            textAlign: "center",
                            border: '1px solid rgba(140, 165, 81, 0.15)'
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#706f6f",
                              display: "block",
                              mb: 0.5,
                              fontFamily: '"Poppins", sans-serif',
                              fontSize: "0.7rem",
                              textTransform: "uppercase",
                              letterSpacing: "1px"
                            }}
                          >
                            Amount
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{
                              color: "#8CA551",
                              fontWeight: 700,
                              letterSpacing: "-0.5px",
                              fontFamily: '"Poppins", sans-serif'
                            }}
                          >
                            ${payload.amount.toLocaleString()}
                          </Typography>
                        </Box>

                        {payload.notes && (
                          <Box mb={2}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#706f6f",
                                fontWeight: 600,
                                display: "block",
                                mb: 0.5,
                                fontFamily: '"Poppins", sans-serif',
                                fontSize: "0.7rem",
                                textTransform: "uppercase",
                                letterSpacing: "1px"
                              }}
                            >
                              Notes:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#333F1F",
                                fontFamily: '"Poppins", sans-serif',
                                fontSize: "0.85rem"
                              }}
                            >
                              {payload.notes}
                            </Typography>
                          </Box>
                        )}

                        {payload.support && (
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            href={payload.support}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<Description />}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              py: 1,
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
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            </>
          ) : (
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
          )}
        </Box>
      </Paper>

      {/* ✅ UPLOAD PAYMENT DIALOG */}
      <Dialog
        open={uploadPaymentDialog}
        onClose={handleCloseUploadPayment}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(51, 63, 31, 0.15)",
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: "#333F1F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(51, 63, 31, 0.2)",
              }}
            >
              <CloudUpload sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                fontWeight={700}
                sx={{ color: "#333F1F", fontFamily: '"Poppins", sans-serif' }}
              >
                Upload Payment
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ color: "#706f6f", fontFamily: '"Poppins", sans-serif' }}
              >
                Submit your payment information for approval
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Amount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => handlePaymentFormChange("amount", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Typography sx={{ mr: 0.5, fontSize: "0.875rem", color: '#333F1F', fontWeight: 600 }}>
                      $
                    </Typography>
                  ),
                }}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    fontFamily: '"Poppins", sans-serif',
                    "& fieldset": { borderColor: 'rgba(140, 165, 81, 0.3)', borderWidth: '2px' },
                    "&:hover fieldset": { borderColor: "#8CA551" },
                    "&.Mui-focused fieldset": { borderColor: "#333F1F", borderWidth: "2px" }
                  },
                  "& .MuiInputLabel-root": {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    color: '#706f6f',
                    "&.Mui-focused": { color: "#333F1F", fontWeight: 600 }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Payment Type"
                value={paymentForm.type || ""}
                onChange={e => handlePaymentFormChange("type", e.target.value)}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    fontFamily: '"Poppins", sans-serif',
                    "& fieldset": { borderColor: 'rgba(140, 165, 81, 0.3)', borderWidth: '2px' },
                    "&:hover fieldset": { borderColor: "#8CA551" },
                    "&.Mui-focused fieldset": { borderColor: "#333F1F", borderWidth: "2px" }
                  },
                  "& .MuiInputLabel-root": {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    color: '#706f6f',
                    "&.Mui-focused": { color: "#333F1F", fontWeight: 600 }
                  }
                }}
              >
                {[
                  "initial down payment",
                  "complementary down payment",
                  "monthly payment",
                  "additional payment",
                  "closing payment"
                ].map((type) => (
                  <MenuItem 
                    key={type}
                    value={type}
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      '&:hover': { bgcolor: 'rgba(140, 165, 81, 0.08)' },
                      '&.Mui-selected': {
                        bgcolor: 'rgba(140, 165, 81, 0.12)',
                        '&:hover': { bgcolor: 'rgba(140, 165, 81, 0.18)' }
                      }
                    }}
                  >
                    {type.split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={paymentForm.date}
                onChange={(e) => handlePaymentFormChange("date", e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    fontFamily: '"Poppins", sans-serif',
                    "& fieldset": { borderColor: 'rgba(140, 165, 81, 0.3)', borderWidth: '2px' },
                    "&:hover fieldset": { borderColor: "#8CA551" },
                    "&.Mui-focused fieldset": { borderColor: "#333F1F", borderWidth: "2px" }
                  },
                  "& .MuiInputLabel-root": {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    color: '#706f6f',
                    "&.Mui-focused": { color: "#333F1F", fontWeight: 600 }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<Upload />}
                sx={{
                  py: 2,
                  borderRadius: 3,
                  borderColor: 'rgba(140, 165, 81, 0.5)',
                  borderWidth: '2px',
                  color: "#333F1F",
                  fontWeight: 600,
                  textTransform: "none",
                  fontFamily: '"Poppins", sans-serif',
                  letterSpacing: '0.5px',
                  "&:hover": {
                    borderColor: "#8CA551",
                    borderWidth: '2px',
                    bgcolor: "rgba(140, 165, 81, 0.05)",
                  },
                }}
              >
                Upload Receipt / Support Document
                <input
                  type="file"
                  hidden
                  accept="image/*,application/pdf"
                  onChange={(e) => handlePaymentFormChange("supportFile", e.target.files[0])}
                />
              </Button>
              {paymentForm.supportFile && (
                <Alert
                  severity="success"
                  sx={{ 
                    mt: 2, 
                    borderRadius: 3,
                    bgcolor: 'rgba(140, 165, 81, 0.08)',
                    border: '1px solid rgba(140, 165, 81, 0.3)',
                    fontFamily: '"Poppins", sans-serif',
                    "& .MuiAlert-icon": { color: "#8CA551" }
                  }}
                  icon={<CheckCircle />}
                >
                  <Typography 
                    variant="body2" 
                    fontWeight="600"
                    sx={{ fontFamily: '"Poppins", sans-serif', color: '#333F1F' }}
                  >
                    File selected: {paymentForm.supportFile.name}
                  </Typography>
                </Alert>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={paymentForm.notes}
                onChange={(e) => handlePaymentFormChange("notes", e.target.value)}
                placeholder="Add any additional information about this payment..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    fontFamily: '"Poppins", sans-serif',
                    "& fieldset": { borderColor: 'rgba(140, 165, 81, 0.3)', borderWidth: '2px' },
                    "&:hover fieldset": { borderColor: "#8CA551" },
                    "&.Mui-focused fieldset": { borderColor: "#333F1F", borderWidth: "2px" }
                  },
                  "& .MuiInputLabel-root": {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    color: '#706f6f',
                    "&.Mui-focused": { color: "#333F1F", fontWeight: 600 }
                  }
                }}
              />
            </Grid>
          </Grid>

          <Alert
            severity="info"
            sx={{ 
              mt: 3, 
              borderRadius: 3,
              bgcolor: 'rgba(140, 165, 81, 0.08)',
              border: '1px solid rgba(140, 165, 81, 0.3)',
              fontFamily: '"Poppins", sans-serif',
              "& .MuiAlert-icon": { color: "#8CA551" }
            }}
            icon={<Info />}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Poppins", sans-serif',
                color: '#333F1F',
                fontSize: '0.875rem'
              }}
            >
              Your payment will be reviewed and approved by administration within 24-48 hours.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseUploadPayment}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.2,
              color: "#706f6f",
              fontFamily: '"Poppins", sans-serif',
              border: "2px solid #e0e0e0",
              "&:hover": {
                bgcolor: "rgba(112, 111, 111, 0.05)",
                borderColor: "#706f6f"
              }
            }}
          >
            Cancel
          </Button>
          
          <Button
            variant="contained"
            onClick={handleSubmitPayment}
            disabled={uploadingPayment || !paymentForm.amount || !paymentForm.type}
            startIcon={<CheckCircle />}
            sx={{
              borderRadius: 3,
              bgcolor: "#333F1F",
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              letterSpacing: "1px",
              fontFamily: '"Poppins", sans-serif',
              px: 4,
              py: 1.5,
              boxShadow: "0 4px 12px rgba(51, 63, 31, 0.25)",
              position: "relative",
              overflow: "hidden",
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
                boxShadow: "0 8px 20px rgba(51, 63, 31, 0.35)",
                "&::before": { left: 0 },
              },
              "&:disabled": {
                bgcolor: "#e0e0e0",
                color: "#999",
              },
              "& span": {
                position: "relative",
                zIndex: 1,
              }
            }}
          >
            {uploadingPayment ? "Uploading..." : "Submit Payment"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PaymentTab