// apps/mv-crm/src/components/reports/ClientsReportSection.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { People } from '@mui/icons-material'
import ReportSection from './ReportSection'
import FormatSelector from './FormatSelector'
import ExportButton from '../ExportButton'
import crmReportsService from '../../services/crmReportsService'
import { useProjects } from '@shared/hooks/useProjects'

const ClientsReportSection = () => {
  const { t } = useTranslation('reports')
  const { projects } = useProjects()
  const [projectId, setProjectId] = useState('')
  const [format, setFormat] = useState('csv')

  return (
    <ReportSection
      icon={People}
      iconBgColor="#e3f2fd"
      iconColor="#1976d2"
      title={t('clients.title', 'Reporte de Clientes')}
      description={t('clients.description', 'Exporta la lista completa de clientes con sus datos de contacto')}
    >
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
            {t('clients.filters.project', 'Filtrar por proyecto')}
          </InputLabel>
          <Select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            label={t('clients.filters.project', 'Filtrar por proyecto')}
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              borderRadius: 0,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ececec' }
            }}
          >
            <MenuItem value="">{t('common.allProjects', 'Todos los proyectos')}</MenuItem>
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