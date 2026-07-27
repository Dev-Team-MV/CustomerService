// apps/mv-crm/src/components/reports/ExportButton.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider
} from '@mui/material'
import { Download, Close, TableChart, Description, Warning } from '@mui/icons-material'
import crmReportsService from '../services/crmReportsService'

const ExportButton = ({
  label,
  exportFn,
  params = {},
  filename,
  variant = 'outlined',
  withModal = false,
  filters = [],
  onSuccess,
  onError,
  disabled = false,
  size = 'medium',
  sx = {},
  externalFormat,
  onExternalFormatChange
}) => {
  const { t } = useTranslation(['reports', 'common'])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalFilters, setModalFilters] = useState({})
  const [internalFormat, setInternalFormat] = useState('csv')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const format = externalFormat !== undefined ? externalFormat : internalFormat
  const setFormat = onExternalFormatChange || setInternalFormat
  const buttonLabel = label || t('exportButton', 'Exportar')

  const handleOpenModal = () => {
    const initialFilters = {}
    filters.forEach(f => {
      initialFilters[f.field] = f.defaultValue || ''
    })
    setModalFilters(initialFilters)
    setFormat('csv')
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const handleFilterChange = (field, value) => {
    setModalFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleClearFilters = () => {
    const initialFilters = {}
    filters.forEach(f => {
      initialFilters[f.field] = f.defaultValue || ''
    })
    setModalFilters(initialFilters)
  }

  const validateFilters = () => {
    for (const filter of filters) {
      if (filter.required && !modalFilters[filter.field]) {
        return { valid: false, message: t('validation.required', { field: filter.label }) }
      }
    }
    return { valid: true }
  }

  const generateFilename = () => {
    if (filename) return filename
    const prefix = 'export'
    const timestamp = new Date().toISOString().split('T')[0]
    if (modalFilters.dateFrom && modalFilters.dateTo) {
      return `${prefix}-${modalFilters.dateFrom}-a-${modalFilters.dateTo}.${format}`
    }
    return `${prefix}-${timestamp}.${format}`
  }

  const handleExport = async (exportParams = params) => {
    setLoading(true)
    try {
      const finalFilename = generateFilename()
      if (format === 'csv') {
        await crmReportsService.exportAndDownload(exportFn, exportParams, finalFilename)
      } else {
        const data = await exportFn({ ...exportParams, format: 'json' })
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        crmReportsService.downloadBlob(blob, finalFilename)
      }

      setSnackbar({
        open: true,
        message: t('success.exported', { format: format.toUpperCase() }),
        severity: 'success'
      })
      if (onSuccess) onSuccess()
      setModalOpen(false)
    } catch (err) {
      console.error('Error exporting:', err)
      const errorMsg = err.response?.data?.message || err.message || t('errors.exportFailed')
      setSnackbar({
        open: true,
        message: `${t('errors.prefix', 'Error:')} ${errorMsg}`,
        severity: 'error'
      })
      if (onError) onError(err)
    } finally {
      setLoading(false)
    }
  }

  const handleExportWithModal = () => {
    const validation = validateFilters()
    if (!validation.valid) {
      setSnackbar({ open: true, message: `⚠️ ${validation.message}`, severity: 'warning' })
      return
    }
    const exportParams = { format }
    Object.keys(modalFilters).forEach(key => {
      if (modalFilters[key]) exportParams[key] = modalFilters[key]
    })
    handleExport(exportParams)
  }

  const handleClick = () => {
    if (withModal) handleOpenModal()
    else handleExport({ ...params, format })
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // ✅ Estilos unificados
  const unifiedButtonSx = { 
    borderRadius: 0, 
    textTransform: 'none', 
    fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', 
    letterSpacing: '0.5px', 
    '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } 
  }
  
  const inputSx = { 
    fontFamily: '"Courier New", monospace', 
    fontSize: '0.75rem', 
    borderRadius: 0, 
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' }
  }

  return (
    <>
      <Button
        variant={variant}
        startIcon={loading ? <CircularProgress size={16} /> : <Download />}
        onClick={handleClick}
        disabled={loading || disabled}
        size={size}
        sx={{
          ...unifiedButtonSx,
          border: variant === 'outlined' ? '1px solid #000' : 'none',
          bgcolor: variant === 'contained' ? '#000' : 'transparent',
          color: '#000',
          '&:hover': variant === 'outlined' 
            ? { bgcolor: '#f5f5f5', borderColor: '#333', boxShadow: '4px 4px 0px rgba(0,0,0,0.12)' }
            : { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' },
          ...sx
        }}
      >
        {loading ? t('exporting', 'Exportando...') : buttonLabel}
      </Button>

      {withModal && (
        <Dialog
          open={modalOpen}
          onClose={handleCloseModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 0, border: '1px solid #ececec' } }}
        >
          <DialogTitle sx={{ borderBottom: '1px solid #ececec', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Download sx={{ fontSize: 20 }} />
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {buttonLabel}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseModal} size="small" sx={{ borderRadius: 0 }}>
              <Close fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
              {filters.some(f => f.required) && (
                <Alert
                  severity="warning"
                  icon={<Warning />}
                  sx={{ mb: 3, borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {t('requiredFieldsNote', 'Los campos marcados con * son obligatorios')}
                  </Typography>
                </Alert>
              )}

              <Box display="flex" flexDirection="column" gap={2.5}>
                {filters.map((filter) => {
                  if (filter.type === 'date') {
                    return (
                      <TextField
                        key={filter.field}
                        size="small"
                        type="date"
                        label={`${filter.label}${filter.required ? ' *' : ''}`}
                        value={modalFilters[filter.field] || ''}
                        onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required={filter.required}
                        error={filter.required && !modalFilters[filter.field]}
                        helperText={filter.required && !modalFilters[filter.field] ? t('validation.requiredShort', 'Requerido') : ''}
                        fullWidth
                        sx={{
                          ...inputSx,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: filter.required && !modalFilters[filter.field] ? '#d32f2f' : '#ececec'
                          },
                          '& .MuiFormHelperText-root': {
                            fontFamily: '"Courier New", monospace',
                            fontSize: '0.65rem',
                            color: '#d32f2f'
                          }
                        }}
                      />
                    )
                  }

                  if (filter.type === 'select') {
                    return (
                      <FormControl key={filter.field} size="small" fullWidth>
                        <InputLabel>{filter.label}</InputLabel>
                        <Select
                          value={modalFilters[filter.field] || ''}
                          onChange={(e) => handleFilterChange(filter.field, e.target.value)}
                          label={filter.label}
                          sx={{ ...inputSx, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' } }}
                        >
                          <MenuItem value="" sx={{ fontFamily: '"Courier New", monospace' }}>{filter.placeholder || t('common:all', 'Todos')}</MenuItem>
                          {filter.options.map(option => (
                            <MenuItem key={option.value} value={option.value} sx={{ fontFamily: '"Courier New", monospace' }}>
                              {option.render ? option.render(option) : option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )
                  }
                  return null
                })}

                <Divider />

                <Box>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', mb: 1.5 }}>
                    {t('formatSelector.title', 'Formato de Exportación')}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Chip
                      icon={<TableChart sx={{ fontSize: 16 }} />}
                      label="CSV"
                      onClick={() => setFormat('csv')}
                      color={format === 'csv' ? 'success' : 'default'}
                      variant={format === 'csv' ? 'filled' : 'outlined'}
                      sx={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem',
                        letterSpacing: '0.5px',
                        cursor: 'pointer',
                        borderRadius: 0,
                        border: format !== 'csv' ? '1px solid #ececec' : 'none'
                      }}
                    />
                    <Chip
                      icon={<Description sx={{ fontSize: 16 }} />}
                      label="JSON"
                      onClick={() => setFormat('json')}
                      color={format === 'json' ? 'primary' : 'default'}
                      variant={format === 'json' ? 'filled' : 'outlined'}
                      sx={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem',
                        letterSpacing: '0.5px',
                        cursor: 'pointer',
                        borderRadius: 0,
                        border: format !== 'json' ? '1px solid #ececec' : 'none'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ borderTop: '1px solid #ececec', p: 2, gap: 1 }}>
            <Button onClick={handleClearFilters} disabled={loading} sx={{ ...unifiedButtonSx, color: '#888' }}>
              {t('common:clearFilters', 'Limpiar')}
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button onClick={handleCloseModal} disabled={loading} sx={{ ...unifiedButtonSx, color: '#888' }}>
              {t('common:cancel', 'Cancelar')}
            </Button>
            <Button
              onClick={handleExportWithModal}
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} /> : <Download />}
              disabled={loading}
              sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
            >
              {loading ? t('exporting', 'Exportando...') : t('exportFormat', { format: format.toUpperCase() })}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ 
            fontFamily: '"Courier New", monospace', 
            fontSize: '0.75rem', 
            borderRadius: 0, 
            border: '1px solid',
            bgcolor: snackbar.severity === 'success' ? '#e8f5e9' : snackbar.severity === 'error' ? '#ffebee' : '#fff3e0'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ExportButton