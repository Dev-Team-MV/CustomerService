import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import StatsStrip from '@shared/components/LayoutComponents/StatsStrip'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import AgentMetricsModal from '../components/Agents/AgentMetricsModal'
import TargetSetterModal from '../components/Agents/TargetSetterModal'
import { useAgents } from '../constants/hooks/useAgents'
import { useAgentColumns } from '../constants/Columns/agents'
import { People } from '@mui/icons-material'

// ✅ IMPORTS PARA EL TOUR
import { useTour } from '@shared/tours/useTour'
import TourButton from '@shared/tours/TourButton'
import { getAgentsTourSteps, agentsTourConfig } from '../tours/modules/agentsTour'
import { getAgentMetricsTourSteps, agentMetricsTourConfig } from '../tours/features/agentMetricsTour'
import { getTargetSetterTourSteps, targetSetterTourConfig } from '../tours/features/targetSetterTour'

export default function Agents() {
  const { t } = useTranslation('agents')
  const { t: tCommon } = useTranslation('common')
  const { agents, loading, stats, refresh } = useAgents()
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [targetAgent, setTargetAgent] = useState(null)

  const columns = useAgentColumns({
    t,
    onViewMetrics: (agent) => setSelectedAgent(agent),
    onSetTarget: (agent) => setTargetAgent(agent)
  })

  const handleTargetSuccess = () => {
    refresh()
  }

  // ✅ ESTADOS DEL TOUR
  const [isTourMode, setIsTourMode] = useState(false)
  const { startTour, pauseTour, resumeTour } = useTour()
  const tourSteps = getAgentsTourSteps(tCommon)
  const metricsSteps = getAgentMetricsTourSteps(tCommon)
  const targetSteps = getTargetSetterTourSteps(tCommon)
  const tourOptionsRef = useRef(null)

  // ✅ LÓGICA DE INTERCEPCIÓN DEL TOUR (Índices actualizados)
  const handleTourNextClick = (driverObj) => {
    const currentIndex = driverObj.getActiveIndex()
    console.log('🔍 Tour Next Click - Índice actual:', currentIndex)
    setIsTourMode(true)

    // ==========================================
    // PASO 11: Botón Metas (Abrir modal)
    // ==========================================
    if (currentIndex === 11) {
      const targetsBtn = document.getElementById('agents-action-targets')
      if (targetsBtn) {
        targetsBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        pauseTour()
        
        const checkModal = setInterval(() => {
          if (document.getElementById('target-setter-modal')) {
            clearInterval(checkModal)
            setTimeout(() => {
              startTour(targetSetterTourConfig.id, targetSteps, {
                onNextClick: (driver) => driver.moveNext(),
                onCloseClick: () => {
                  document.getElementById('target-setter-close')?.click()
                  setTimeout(() => resumeTour(12, tourSteps, tourOptionsRef.current), 400)
                },
                onDestroyStarted: () => {
                  document.getElementById('target-setter-close')?.click()
                  setTimeout(() => resumeTour(12, tourSteps, tourOptionsRef.current), 400)
                }
              })
            }, 400)
          }
        }, 150)
      } else {
        driverObj.moveNext()
      }
      return
    }

    // ==========================================
    // PASO 12: Botón Métricas (Abrir modal)
    // ==========================================
    if (currentIndex === 12) {
      const metricsBtn = document.getElementById('agents-action-metrics')
      if (metricsBtn) {
        metricsBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        pauseTour()
        
        const checkModal = setInterval(() => {
          if (document.getElementById('agent-metrics-modal')) {
            clearInterval(checkModal)
            setTimeout(() => {
              startTour(agentMetricsTourConfig.id, metricsSteps, {
                onNextClick: (driver) => driver.moveNext(),
                onCloseClick: () => {
                  document.getElementById('agent-metrics-close')?.click()
                  setTimeout(() => resumeTour(13, tourSteps, tourOptionsRef.current), 400)
                },
                onDestroyStarted: () => {
                  document.getElementById('agent-metrics-close')?.click()
                  setTimeout(() => resumeTour(13, tourSteps, tourOptionsRef.current), 400)
                }
              })
            }, 400)
          }
        }, 150)
      } else {
        driverObj.moveNext()
      }
      return
    }

    // Para el resto de pasos (0-10 y 13), avance normal
    driverObj.moveNext()
  }

  const tourOptions = {
    onNextClick: handleTourNextClick,
    onPrevClick: (driverObj) => driverObj.movePrevious(),
    onDestroy: () => {
      console.log('🛑 Tour de Agentes destruido, limpiando modo tour')
      setIsTourMode(false)
      setSelectedAgent(null)
      setTargetAgent(null)
    }
  }
  tourOptionsRef.current = tourOptions

  return (
    <PageLayout
      title={t('title', 'Agentes')}
      titleBold={t('titleBold', 'CRM')}
      topbarLabel={t('topbarLabel', 'Equipo de ventas')}
      subtitle={t('subtitle', 'Gestiona y monitorea el desempeño de tus agentes')}
    >
      {/* ✅ ID: Contenedor Principal */}
      <Box id="agents-page-container">
        
        {/* ✅ Botón del Tour */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, pb: 0 }}>
          <TourButton 
            tourId={agentsTourConfig.id}
            steps={tourSteps}
            label={tCommon('tour.agents.button', 'Ver guía de Agentes')}
            options={tourOptions}
          />
        </Box>

        {/* ✅ ID: Stats Strip */}
        <Box id="agents-stats-strip" sx={{ px: 3, pb: 3 }}>
          <StatsStrip
            stats={[
              { label: t('stats.total', 'Total'), value: stats.total },
              { label: t('stats.superadmins', 'Super Admins'), value: stats.superadmins },
              { label: t('stats.admins', 'Admins'), value: stats.admins },
              { label: t('stats.totalLeads', 'Leads Totales'), value: stats.totalLeads },
              { label: t('stats.converted', 'Convertidos'), value: stats.totalConverted }
            ]}
          />
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          style={{ padding: '0 24px 24px 24px' }}
        >
          {/* ✅ ID: Tabla de Datos */}
          <Box id="agents-data-table">
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
          </Box>
        </motion.div>

        {/* ✅ Elemento invisible para el paso final */}
        <Box id="agents-finish" sx={{ height: 1 }} />
      </Box>

      <AgentMetricsModal
        open={Boolean(selectedAgent)}
        onClose={() => setSelectedAgent(null)}
        agent={selectedAgent}
      />

      <TargetSetterModal
        open={Boolean(targetAgent)}
        onClose={() => setTargetAgent(null)}
        agent={targetAgent}
        onSuccess={handleTargetSuccess}
      />
    </PageLayout>
  )
}