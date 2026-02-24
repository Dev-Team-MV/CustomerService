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
  Button,
  Alert
} from '@mui/material'
import { PersonAdd, CheckCircle } from '@mui/icons-material'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

const ResidentDialog = ({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  selectedUser
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
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
          <PersonAdd sx={{ color: "white", fontSize: 24 }} />
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
            {selectedUser ? "Edit User" : "Invite New User"}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: "#706f6f",
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            The user will receive an invitation to set their password
          </Typography>
        </Box>
      </Box>
    </DialogTitle>
  
    <DialogContent sx={{ pt: 3 }}>
      <Alert 
        severity="info" 
        sx={{ 
          mb: 2,
          borderRadius: 3,
          bgcolor: "rgba(140, 165, 81, 0.08)",
          border: "1px solid rgba(140, 165, 81, 0.3)",
          fontFamily: '"Poppins", sans-serif',
          "& .MuiAlert-icon": {
            color: "#8CA551"
          }
        }}
      >
        The user will receive an invitation to set their password
      </Alert>
  
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontFamily: '"Poppins", sans-serif',
                "&.Mui-focused fieldset": { 
                  borderColor: "#333F1F",
                  borderWidth: "2px"
                },
                "&:hover fieldset": {
                  borderColor: "#8CA551"
                }
              },
              "& .MuiInputLabel-root": {
                fontFamily: '"Poppins", sans-serif',
                "&.Mui-focused": {
                  color: "#333F1F"
                }
              }
            }}
          />
        </Grid>
  
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontFamily: '"Poppins", sans-serif',
                "&.Mui-focused fieldset": { 
                  borderColor: "#333F1F",
                  borderWidth: "2px"
                },
                "&:hover fieldset": {
                  borderColor: "#8CA551"
                }
              },
              "& .MuiInputLabel-root": {
                fontFamily: '"Poppins", sans-serif',
                "&.Mui-focused": {
                  color: "#333F1F"
                }
              }
            }}
          />
        </Grid>
  
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontFamily: '"Poppins", sans-serif',
                "&.Mui-focused fieldset": { 
                  borderColor: "#333F1F",
                  borderWidth: "2px"
                },
                "&:hover fieldset": {
                  borderColor: "#8CA551"
                }
              },
              "& .MuiInputLabel-root": {
                fontFamily: '"Poppins", sans-serif',
                "&.Mui-focused": {
                  color: "#333F1F"
                }
              }
            }}
          />
        </Grid>
  
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography
              variant="caption"
              sx={{ 
                mb: 0.5, 
                display: "block",
                color: "#706f6f",
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              Phone Number *
            </Typography>
            <PhoneInput
              country={"us"}
              value={formData.phoneNumber}
              onChange={(value) =>
                setFormData({ ...formData, phoneNumber: value })
              }
              inputProps={{
                name: "phone",
                required: true,
              }}
              containerStyle={{ width: "100%" }}
              inputStyle={{
                width: "100%",
                height: "56px",
                fontSize: "16px",
                border: "2px solid #e0e0e0",
                borderRadius: 12,
                transition: "all 0.3s",
                fontFamily: '"Poppins", sans-serif'
              }}
              buttonStyle={{
                border: "2px solid #e0e0e0",
                borderRight: "none",
                borderRadius: "12px 0 0 12px"
              }}
              dropdownStyle={{
                borderRadius: 12,
                fontFamily: '"Poppins", sans-serif'
              }}
            />
          </Box>
        </Grid>
  
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Birthday"
            value={formData.birthday}
            onChange={(e) =>
              setFormData({ ...formData, birthday: e.target.value })
            }
            InputLabelProps={{ shrink: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontFamily: '"Poppins", sans-serif',
                "&.Mui-focused fieldset": { 
                  borderColor: "#333F1F",
                  borderWidth: "2px"
                },
                "&:hover fieldset": {
                  borderColor: "#8CA551"
                }
              },
              "& .MuiInputLabel-root": {
                fontFamily: '"Poppins", sans-serif',
                "&.Mui-focused": {
                  color: "#333F1F"
                }
              }
            }}
          />
        </Grid>
  
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Role"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                fontFamily: '"Poppins", sans-serif',
                "&.Mui-focused fieldset": { 
                  borderColor: "#333F1F",
                  borderWidth: "2px"
                },
                "&:hover fieldset": {
                  borderColor: "#8CA551"
                }
              },
              "& .MuiInputLabel-root": {
                fontFamily: '"Poppins", sans-serif',
                "&.Mui-focused": {
                  color: "#333F1F"
                }
              }
            }}
          >
            <MenuItem value="user" sx={{ fontFamily: '"Poppins", sans-serif' }}>
              User
            </MenuItem>
            <MenuItem value="admin" sx={{ fontFamily: '"Poppins", sans-serif' }}>
              Admin
            </MenuItem>
            <MenuItem value="superadmin" sx={{ fontFamily: '"Poppins", sans-serif' }}>
              Super Admin
            </MenuItem>
          </TextField>
        </Grid>
  
        {selectedUser && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="password"
              label="New Password (leave blank to keep current)"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              helperText="Leave blank to keep current password"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  fontFamily: '"Poppins", sans-serif',
                  "&.Mui-focused fieldset": { 
                    borderColor: "#333F1F",
                    borderWidth: "2px"
                  },
                  "&:hover fieldset": {
                    borderColor: "#8CA551"
                  }
                },
                "& .MuiInputLabel-root": {
                  fontFamily: '"Poppins", sans-serif',
                  "&.Mui-focused": {
                    color: "#333F1F"
                  }
                },
                "& .MuiFormHelperText-root": {
                  fontFamily: '"Poppins", sans-serif'
                }
              }}
            />
          </Grid>
        )}
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
        onClick={onSubmit}
        variant="contained"
        disabled={
          !formData.firstName ||
          !formData.lastName ||
          !formData.email ||
          !formData.phoneNumber
        }
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
          "&:disabled": {
            bgcolor: "#e0e0e0",
            color: "#9e9e9e",
            boxShadow: "none",
          },
          "& span": {
            position: "relative",
            zIndex: 1,
          }
        }}
      >
        <span>{selectedUser ? "Update" : "Send Invitation"}</span>
      </Button>
    </DialogActions>
  </Dialog>
)

export default ResidentDialog