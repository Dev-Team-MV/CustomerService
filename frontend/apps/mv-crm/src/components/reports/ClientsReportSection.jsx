// apps/mv-crm/src/components/reports/ClientsReportSection.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { People } from '@mui/icons-material'
import ReportSection from './ReportSection'
import FormatSelector from './FormatSelector'
import ExportButton from '../ExportButton'
import crmReportsService from '../../services/crmReportsService'
import { useProjects } from '@shared/hooks/useProjects'

const ClientsReportSection = () => {
  const { t } = useTranslation('reports')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { projects } = useProjects()
  const [projectId, setProjectId] = useState('')
  const [format, setFormat] = useState('csv')

  const inputSx = {
    fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem',
    borderRadius: 0,
    width: { xs: '100%', sm: 'auto' },
    minWidth: { xs: '100%', sm: 250 },
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' },
    '& .MuiInputBase-input': { fontFamily: '"Helvetica Neue", sans-serif' },
    '& .MuiOutlinedInput-root': { borderRadius: 0, '& fieldset': { borderColor: '#ececec' } }
  }

  return (
    <ReportSection
      icon={People}
      iconBgColor="#e3f2fd"
      iconColor="#1976d2"
      title={t('clients.title', 'Reporte de Clientes')}
      description={t('clients.description', 'Exporta la lista completa de clientes con sus datos de contacto')}
    >
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ xs: 'stretch', sm: 'center' }} flexWrap="wrap">
        <FormControl size="small" sx={inputSx}>
          <InputLabel>{t('clients.filters.project', 'Filtrar por proyecto')}</InputLabel>
          <Select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            label={t('clients.filters.project', 'Filtrar por proyecto')}
          >
            <MenuItem value="" sx={{ fontFamily: '"Courier New", monospace' }}>{t('common.allProjects', 'Todos los proyectos')}</MenuItem>
            {projects.map(project => (
              <MenuItem key={project._id} value={project._id} sx={{ fontFamily: '"Courier New", monospace' }}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flex: { xs: 1, sm: 1 }, display: { xs: 'none', sm: 'block' } }} />

        <FormatSelector format={format} onChange={setFormat} />

        <ExportButton
          label={t('clients.exportButton', 'Exportar Clientes')}
          exportFn={crmReportsService.exportClients}
          params={{ projectId }}
          externalFormat={format}
          onExternalFormatChange={setFormat}
          withModal={false}
        />
      </Box>
    </ReportSection>
  )
}

export default ClientsReportSection