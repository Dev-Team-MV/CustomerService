// apps/mv-crm/src/components/reports/LeadsReportSection.jsx
import { useTranslation } from 'react-i18next'
import { TrendingUp } from '@mui/icons-material'
import { Box } from '@mui/material'
import ReportSection from './ReportSection'
import ExportButton from '../ExportButton'
import crmReportsService from '../../services/crmReportsService'
import { useProjects } from '@shared/hooks/useProjects'
import { useCrmAgents } from '../../constants/hooks/useCrmAgents'
import { LEAD_STAGES, STAGE_COLORS } from '../../services/leadService'

const LeadsReportSection = () => {
  const { t } = useTranslation('reports')
  const { projects } = useProjects()
  const { agents } = useCrmAgents()

  const filters = [
    {
      field: 'fromDate',
      label: t('leads.filters.fromDate', 'Desde'),
      type: 'date',
      required: false
    },
    {
      field: 'toDate',
      label: t('leads.filters.toDate', 'Hasta'),
      type: 'date',
      required: false
    },
    {
      field: 'projectId',
      label: t('leads.filters.project', 'Proyecto'),
      type: 'select',
      placeholder: t('common.allProjects', 'Todos los proyectos'),
      options: projects.map(p => ({ value: p._id, label: p.name }))
    },
    {
      field: 'stage',
      label: t('leads.filters.stage', 'Stage'),
      type: 'select',
      placeholder: t('leads.filters.allStages', 'Todos los stages'),
      options: LEAD_STAGES.map(stage => ({
        value: stage,
        label: t(`leads.stages.${stage}`, stage.charAt(0).toUpperCase() + stage.slice(1).replace('_', ' ')),
        render: (opt) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: STAGE_COLORS[stage]
            }} />
            {opt.label}
          </Box>
        )
      }))
    },
    {
      field: 'assignedTo',
      label: t('leads.filters.assignedTo', 'Agente asignado'),
      type: 'select',
      placeholder: t('leads.filters.allAgents', 'Todos los agentes'),
      options: agents.map(agent => ({
        value: agent._id,
        label: `${agent.firstName} ${agent.lastName} (${agent.role})`
      }))
    }
  ]

  return (
    <ReportSection
      icon={TrendingUp}
      iconBgColor="#fff3e0"
      iconColor="#f57c00"
      title={t('leads.title', 'Reporte de Leads')}
      description={t('leads.description', 'Exporta leads filtrados por stage, agente o proyecto')}
    >
      <ExportButton
        label={t('leads.exportButton', 'Exportar Leads')}
        exportFn={crmReportsService.exportLeads}
        withModal={true}
        filters={filters}
      />
    </ReportSection>
  )
}

export default LeadsReportSection