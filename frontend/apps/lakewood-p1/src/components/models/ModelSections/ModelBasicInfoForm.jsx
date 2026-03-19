import { Box, Typography, Grid, TextField, MenuItem, Divider } from '@mui/material';
import { Home } from '@mui/icons-material';

const ModelBasicInfoForm = ({
  formData,
  setFormData,
  projects,
  loadingProjects,
  t
}) => (
  <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
    <Grid item xs={12}>
      <TextField
        fullWidth
        select
        label="Project *"
        value={formData.project}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          project: e.target.value,
          projectId: e.target.value,
        }))}
        disabled={loadingProjects}
        helperText="Select the project this model belongs to"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: 'white',
            "& fieldset": { borderColor: 'rgba(140, 165, 81, 0.3)', borderWidth: '2px' },
            "&:hover fieldset": { borderColor: "#8CA551" },
            "&.Mui-focused fieldset": { borderColor: "#333F1F", borderWidth: "2px" }
          },
          "& .MuiInputLabel-root": {
            fontFamily: '"Poppins", sans-serif',
            "&.Mui-focused": { color: "#333F1F" }
          },
          "& .MuiFormHelperText-root": { fontFamily: '"Poppins", sans-serif' }
        }}
      >
        {loadingProjects ? (
          <MenuItem disabled>Loading projects...</MenuItem>
        ) : projects.length === 0 ? (
          <MenuItem disabled>No projects available</MenuItem>
        ) : (
          projects.map(project => (
            <MenuItem
              key={project._id}
              value={project._id}
              sx={{ fontFamily: '"Poppins", sans-serif', '&:hover': { bgcolor: 'rgba(140, 165, 81, 0.08)' } }}
            >
              {project.name} {project.slug ? `(${project.slug})` : ''}
            </MenuItem>
          ))
        )}
      </TextField>
    </Grid>
    <Grid item xs={12}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 2,
          pb: 2,
          borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
        }}
      >
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
          <Home sx={{ fontSize: 22, color: '#333F1F' }} />
        </Box>
        <Typography
          variant="h6"
          fontSize={{ xs: "1rem", md: "1.15rem" }}
          fontWeight={700}
          sx={{ 
            color: '#333F1F',
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '0.5px'
          }}
        >
          {t('models:basicInfo')}
        </Typography>
      </Box>
    </Grid>
    {/* Campos de información básica */}
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        size="small"
        label={t('models:modelName')}
        value={formData.model}
        onChange={(e) =>
          setFormData({ ...formData, model: e.target.value })
        }
        required
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: 'white',
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
        size="small"
        label={t('models:modelNumber')}
        value={formData.modelNumber}
        onChange={(e) =>
          setFormData({ ...formData, modelNumber: e.target.value })
        }
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: 'white',
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
    <Grid item xs={6} sm={4}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label={t('models:price')}
        value={formData.price}
        onChange={(e) =>
          setFormData({
            ...formData,
            price: Number(e.target.value),
          })
        }
        required
        InputProps={{
          startAdornment: (
            <Typography sx={{ mr: 0.5, fontSize: "0.875rem", color: '#333F1F', fontWeight: 600 }}>$</Typography>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: 'white',
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
    <Grid item xs={6} sm={4}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label={t('models:stories')}
        value={formData.stories}
        onChange={(e) =>
          setFormData({
            ...formData,
            stories: Number(e.target.value),
          })
        }
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: 'white',
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
    <Grid item xs={12} sm={4}>
      <TextField
        fullWidth
        size="small"
        select
        label={t('models:statusLabel')}
        value={formData.status}
        onChange={(e) =>
          setFormData({ ...formData, status: e.target.value })
        }
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: 'white',
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
        <MenuItem value="active" sx={{ fontFamily: '"Poppins", sans-serif' }}>Active</MenuItem>
        <MenuItem value="draft" sx={{ fontFamily: '"Poppins", sans-serif' }}>Draft</MenuItem>
        <MenuItem value="inactive" sx={{ fontFamily: '"Poppins", sans-serif' }}>Inactive</MenuItem>
      </TextField>
    </Grid>
    <Grid item xs={4}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label={t('models:bedrooms')}
        value={formData.bedrooms}
        onChange={(e) =>
          setFormData({
            ...formData,
            bedrooms: Number(e.target.value),
          })
        }
        required
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: 'white',
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
    <Grid item xs={4}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label={t('models:bathrooms')}
        value={formData.bathrooms}
        onChange={(e) =>
          setFormData({
            ...formData,
            bathrooms: Number(e.target.value),
          })
        }
        required
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: 'white',
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
    <Grid item xs={4}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label={t('models:sqft')}
        value={formData.sqft}
        onChange={(e) =>
          setFormData({ ...formData, sqft: Number(e.target.value) })
        }
        required
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: 'white',
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
    <Grid item xs={12}>
      <TextField
        fullWidth
        size="small"
        multiline
        rows={2}
        label={t('models:description')}
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: 'white',
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
    <Grid item xs={12}>
      <Divider sx={{ my: { xs: 1, md: 2 }, borderColor: 'rgba(112, 111, 111, 0.2)' }} />
    </Grid>
  </Grid>
);

export default ModelBasicInfoForm;