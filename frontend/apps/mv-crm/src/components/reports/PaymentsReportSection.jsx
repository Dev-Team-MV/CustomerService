// apps/mv-crm/src/components/reports/PaymentsReportSection.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { Payment } from '@mui/icons-material'
import ReportSection from './ReportSection'
import FormatSelector from './FormatSelector'
import ExportButton from '../ExportButton'
import crmReportsService from '../../services/crmReportsService'
import { useProjects } from '@shared/hooks/useProjects'

const PaymentsReportSection = () => {
  const { t } = useTranslation('reports')
  const { projects } = useProjects()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [projectId, setProjectId] = useState('')
  const [format, setFormat] = useState('csv')

  const isDisabled = !dateFrom || !dateTo

  return (
    <ReportSection
      icon={Payment}
      iconBgColor="#e8f5e9"
      iconColor="#2e7d32"
      title={t('payments.title', 'Reporte de Pagos')}
      description={t('payments.description', 'Exporta pagos dentro de un rango de fechas específico')}
    >
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <TextField
          size="small"
          type="date"
          label={t('payments.filters.dateFrom', 'Desde')}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            width: 180,
            '& .MuiInputBase-input': {
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem'
            },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' }
          }}
        />

        <TextField
          size="small"
          type="date"
          label={t('payments.filters.dateTo', 'Hasta')}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            width: 180,
            '& .MuiInputBase-input': {
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem'
            },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' }
          }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
            {t('payments.filters.project', 'Proyecto')}
          </InputLabel>
          <Select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            label={t('payments.filters.project', 'Proyecto')}
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              borderRadius: 0,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' }
            }}
          >
            <MenuItem value="">{t('common.all', 'Todos')}</MenuItem>
            {projects.map(project => (
              <MenuItem key={project._id} value={project._id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />

        <FormatSelector format={format} onChange={setFormat} />

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
  )
}

export default PaymentsReportSection