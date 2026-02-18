import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button
} from '@mui/material'
import { AttachFile, CheckCircle } from '@mui/icons-material'

const paymentTypes = [
  'initial down payment',
  'complementary down payment',
  'monthly payment',
  'additional payment',
  'closing payment'
]

const statusOptions = ['pending', 'signed', 'rejected']

const PayloadDialog = ({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  properties,
  selectedPayload
}) => (
  <Dialog
    open={open}
    onClose={onClose}
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
          <AttachFile sx={{ color: "white", fontSize: 24 }} />
        </Box>
        <Box>
          <Typography 
            variant="h6" 
            fontWeight={700}
            sx={{ 
              color: "#333F1F",
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            {selectedPayload ? 'Edit Payment' : 'Add New Payment'}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: "#706f6f",
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            Manage and track payment record details
          </Typography>
        </Box>
      </Box>
    </DialogTitle>
  
    <DialogContent sx={{ pt: 3 }}>
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Property"
            value={formData.property}
            onChange={(e) => setFormData({ ...formData, property: e.target.value })}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontFamily: '"Poppins", sans-serif',
                "& fieldset": {
                  borderColor: 'rgba(140, 165, 81, 0.3)',
                  borderWidth: '2px'
                },
                "&:hover fieldset": {
                  borderColor: "#8CA551"
                },
                "&.Mui-focused fieldset": { 
                  borderColor: "#333F1F",
                  borderWidth: "2px"
                }
              },
              "& .MuiInputLabel-root": {
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 500,
                color: '#706f6f',
                "&.Mui-focused": {
                  color: "#333F1F",
                  fontWeight: 600
                }
              }
            }}
          >
            {properties.map((property) => (
              <MenuItem 
                key={property._id} 
                value={property._id}
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: 'rgba(140, 165, 81, 0.08)'
                  },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(140, 165, 81, 0.12)',
                    '&:hover': {
                      bgcolor: 'rgba(140, 165, 81, 0.18)'
                    }
                  }
                }}
              >
                Lot {property.lot?.number} - {property.users?.[0]?.firstName} {property.users?.[0]?.lastName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Payment Date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontFamily: '"Poppins", sans-serif',
                "& fieldset": {
                  borderColor: 'rgba(140, 165, 81, 0.3)',
                  borderWidth: '2px'
                },
                "&:hover fieldset": {
                  borderColor: "#8CA551"
                },
                "&.Mui-focused fieldset": { 
                  borderColor: "#333F1F",
                  borderWidth: "2px"
                }
              },
              "& .MuiInputLabel-root": {
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 500,
                color: '#706f6f',
                "&.Mui-focused": {
                  color: "#333F1F",
                  fontWeight: 600
                }
              }
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            InputProps={{
              startAdornment: (
                <Typography sx={{ mr: 0.5, fontSize: "0.875rem", color: '#333F1F', fontWeight: 600 }}>$</Typography>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontFamily: '"Poppins", sans-serif',
                "& fieldset": {
                  borderColor: 'rgba(140, 165, 81, 0.3)',
                  borderWidth: '2px'
                },
                "&:hover fieldset": {
                  borderColor: "#8CA551"
                },
                "&.Mui-focused fieldset": { 
                  borderColor: "#333F1F",
                  borderWidth: "2px"
                }
              },
              "& .MuiInputLabel-root": {
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 500,
                color: '#706f6f',
                "&.Mui-focused": {
                  color: "#333F1F",
                  fontWeight: 600
                }
              }
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontFamily: '"Poppins", sans-serif',
                "& fieldset": {
                  borderColor: 'rgba(140, 165, 81, 0.3)',
                  borderWidth: '2px'
                },
                "&:hover fieldset": {
                  borderColor: "#8CA551"
                },
                "&.Mui-focused fieldset": { 
                  borderColor: "#333F1F",
                  borderWidth: "2px"
                }
              },
              "& .MuiInputLabel-root": {
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 500,
                color: '#706f6f',
                "&.Mui-focused": {
                  color: "#333F1F",
                  fontWeight: 600
                }
              }
            }}
          >
            {statusOptions.map((status) => (
              <MenuItem 
                key={status}
                value={status}
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  textTransform: 'capitalize',
                  '&:hover': {
                    bgcolor: 'rgba(140, 165, 81, 0.08)'
                  },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(140, 165, 81, 0.12)',
                    '&:hover': {
                      bgcolor: 'rgba(140, 165, 81, 0.18)'
                    }
                  }
                }}
              >
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label="Payment Type"
            value={formData.type || ""}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontFamily: '"Poppins", sans-serif',
                "& fieldset": {
                  borderColor: 'rgba(140, 165, 81, 0.3)',
                  borderWidth: '2px'
                },
                "&:hover fieldset": {
                  borderColor: "#8CA551"
                },
                "&.Mui-focused fieldset": { 
                  borderColor: "#333F1F",
                  borderWidth: "2px"
                }
              },
              "& .MuiInputLabel-root": {
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 500,
                color: '#706f6f',
                "&.Mui-focused": {
                  color: "#333F1F",
                  fontWeight: 600
                }
              }
            }}
          >
            {paymentTypes.map((type) => (
              <MenuItem 
                key={type}
                value={type}
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  textTransform: 'capitalize',
                  '&:hover': {
                    bgcolor: 'rgba(140, 165, 81, 0.08)'
                  },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(140, 165, 81, 0.12)',
                    '&:hover': {
                      bgcolor: 'rgba(140, 165, 81, 0.18)'
                    }
                  }
                }}
              >
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontFamily: '"Poppins", sans-serif',
                "& fieldset": {
                  borderColor: 'rgba(140, 165, 81, 0.3)',
                  borderWidth: '2px'
                },
                "&:hover fieldset": {
                  borderColor: "#8CA551"
                },
                "&.Mui-focused fieldset": { 
                  borderColor: "#333F1F",
                  borderWidth: "2px"
                }
              },
              "& .MuiInputLabel-root": {
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 500,
                color: '#706f6f',
                "&.Mui-focused": {
                  color: "#333F1F",
                  fontWeight: 600
                }
              }
            }}
          />
        </Grid>
      </Grid>
    </DialogContent>
  
    <DialogActions sx={{ p: 3, gap: 2 }}>
      <Button
        onClick={onClose}
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
        onClick={onSubmit}
        disabled={!formData.amount || !formData.property || !formData.type}
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
            "&::before": {
              left: 0,
            },
          },
          "& .MuiButton-startIcon": {
            position: "relative",
            zIndex: 1,
            color: "white !important"
          },
          "& span": {
            position: "relative",
            zIndex: 1,
          }
        }}
      >
        <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
        {selectedPayload ? 'Update' : 'Create'}
        </Box>
      </Button>
    </DialogActions>
  </Dialog>
);

export default PayloadDialog;