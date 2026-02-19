import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  MenuItem
} from '@mui/material'
import { CloudUpload, Upload, CheckCircle, Info } from '@mui/icons-material'

const paymentTypes = [
  "initial down payment",
  "complementary down payment",
  "monthly payment",
  "additional payment",
  "closing payment"
]

const UserCreatePayload = ({
  open,
  onClose,
  onSubmit,
  paymentForm,
  handlePaymentFormChange,
  uploadingPayment
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
            {paymentTypes.map((type) => (
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
              onChange={(e) => handlePaymentFormChange("support", e.target.files[0])}
            />
          </Button>
          {paymentForm.support && (
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
                File selected: {paymentForm.support.name}
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
)

export default UserCreatePayload