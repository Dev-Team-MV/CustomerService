import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { Payment } from '@mui/icons-material'
import ReportSection from './ReportSection'
import FormatSelector from './FormatSelector'
import ExportButton from '../ExportButton'
import crmReportsService from '../../services/crmReportsService'
import { useProjects } from '@shared/hooks/useProjects'

const PaymentsReportSection = () => {
  const { t } = useTranslation('reports')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { projects } = useProjects()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [projectId, setProjectId] = useState('')
  const [format, setFormat] = useState('csv')

  const isDisabled = !dateFrom || !dateTo

  const inputSx = {
    fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem',
    borderRadius: 0,
    width: { xs: '100%', sm: 180 },
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' },
    '& .MuiOutlinedInput-root': { borderRadius: 0, '& fieldset': { borderColor: '#ececec' } }
  }

  const selectSx = {
    ...inputSx,
    minWidth: { xs: '100%', sm: 200 }
  }

  return (
    // ✅ ID agregado al contenedor principal de la sección
    <Box id="reports-payments-section">
      <ReportSection
        icon={Payment}
        iconBgColor="#e8f5e9"
        iconColor="#2e7d32"
        title={t('payments.title', 'Reporte de Pagos')}
        description={t('payments.description', 'Exporta pagos dentro de un rango de fechas específico')}
      >
        {/* Layout original intacto, sin nuevos wrappers */}
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ xs: 'stretch', sm: 'center' }} flexWrap="wrap">
          
          {/* ✅ ID agregado directamente al TextField existente */}
          <TextField
            id="payments-report-date-from"
            size="small"
            type="date"
            label={t('payments.filters.dateFrom', 'Desde')}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={inputSx}
          />

          {/* ✅ ID agregado directamente al TextField existente */}
          <TextField
            id="payments-report-date-to"
            size="small"
            type="date"
            label={t('payments.filters.dateTo', 'Hasta')}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={inputSx}
          />

          {/* ✅ ID agregado directamente al FormControl existente */}
          <FormControl id="payments-report-project" size="small" sx={selectSx}>
            <InputLabel>{t('payments.filters.project', 'Proyecto')}</InputLabel>
            <Select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              label={t('payments.filters.project', 'Proyecto')}
            >
              <MenuItem value="" sx={{ fontFamily: '"Courier New", monospace' }}>{t('common.all', 'Todos')}</MenuItem>
              {projects.map(project => (
                <MenuItem key={project._id} value={project._id} sx={{ fontFamily: '"Courier New", monospace' }}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flex: { xs: 1, sm: 1 }, display: { xs: 'none', sm: 'block' } }} />

          <FormatSelector format={format} onChange={setFormat} />

          {/* ✅ ID agregado al contenedor del botón existente */}
          <Box id="payments-report-export">
            <ExportButton
              label={t('payments.exportButton', 'Exportar Pagos')}
              exportFn={crmReportsService.exportPayments}
              params={{ dateFrom, dateTo, projectId }}
              externalFormat={format}
              onExternalFormatChange={setFormat}
              disabled={isDisabled}
              withModal={false}
            />
          </Box>
        </Box>

        {isDisabled && (
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.65rem',
              color: '#d32f2f',
              mt: 1,
              letterSpacing: '0.5px'
            }}
          >
            ⚠️ {t('payments.datesRequired', 'Las fechas de inicio y fin son obligatorias')}
          </Typography>
        )}
      </ReportSection>
    </Box>
  )
}

export default PaymentsReportSection