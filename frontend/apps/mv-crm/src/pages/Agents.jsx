// apps/mv-crm/src/pages/jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import StatsStrip from '@shared/components/LayoutComponents/StatsStrip'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import AgentMetricsModal from '../components/Agents/AgentMetricsModal'
import { useAgents } from '../constants/hooks/useAgents'
import { useAgentColumns } from '../constants/Columns/agents'
import { People } from '@mui/icons-material'

export default function Agents() {
  const { t } = useTranslation('agents')
  const { agents, loading, stats } = useAgents()
  const [selectedAgent, setSelectedAgent] = useState(null)

  const columns = useAgentColumns({
    t,
    onViewMetrics: (agent) => setSelectedAgent(agent)
  })

  return (
    <PageLayout
      title={t('title', 'Agentes')}
      titleBold={t('titleBold', 'CRM')}
      topbarLabel={t('topbarLabel', 'Equipo de ventas')}
      subtitle={t('subtitle', 'Gestiona y monitorea el desempeño de tus agentes')}
    >
      <StatsStrip
        stats={[
          { label: t('stats.total', 'Total'), value: stats.total },
          { label: t('stats.superadmins', 'Super Admins'), value: stats.superadmins },
          { label: t('stats.admins', 'Admins'), value: stats.admins },
          { label: t('stats.totalLeads', 'Leads Totales'), value: stats.totalLeads },
          { label: t('stats.converted', 'Convertidos'), value: stats.totalConverted }
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <DataTable
          columns={columns}
          data={agents}
          loading={loading}
          rowKey="_id"
          emptyState={
            <EmptyState
              icon={People}
              title={t('empty.title', 'No hay agentes')}
              description={t('empty.description', 'Aún no hay agentes registrados en el sistema')}
            />
          }
          stickyHeader
          maxHeight={700}
        />
      </motion.div>

      <AgentMetricsModal
        open={Boolean(selectedAgent)}
        onClose={() => setSelectedAgent(null)}
        agent={selectedAgent}
      />
    </PageLayout>
  )
}