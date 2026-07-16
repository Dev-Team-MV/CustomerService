// apps/mv-crm/src/pages/Sales.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import {
  Box, Typography, Button, TextField, InputAdornment, CircularProgress, Alert, ToggleButton, ToggleButtonGroup
} from '@mui/material'
import { Add, Search, TrendingUp, CalendarToday } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import KanbanBoard from '../components/leads/KanbanBoard'
import LeadModal from '../components/leads/LeadModal'
import LeadDetails from '../components/leads/LeadDetails'
import ConvertLeadModal from '../components/leads/ConvertLeadModal'
import { useLeads } from '../constants/hooks/useLeads'
import { useCrmAgents } from '../constants/hooks/useCrmAgents'
import { useProjects } from '@shared/hooks/useProjects'
import { LEAD_STAGES, STAGE_COLORS } from '../services/leadService'
import crmReportsService from '../services/crmReportsService'
import ExportButton from '../components/ExportButton'
import leadService from '../services/leadService'

export default function Sales() {
  const { t } = useTranslation('leads')
  
  const [searchParams, setSearchParams] = useSearchParams()
  const leadIdFromUrl = searchParams.get('leadId')
  
  const {
    stages,
    groupedByStage,
    loading,
    error,
    createLead,
    updateLead,
    moveLead,
    deleteLead,
    convertToCustomer,
    fetchLeads
  } = useLeads()

  const { agents } = useCrmAgents()
  const { projects } = useProjects()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [detailsLead, setDetailsLead] = useState(null)
  const [convertLead, setConvertLead] = useState(null)
  const [conversionResult, setConversionResult] = useState(null)
  const [searchValue, setSearchValue] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')

  useEffect(() => {
    if (leadIdFromUrl && !loading) {
      loadLeadFromUrl(leadIdFromUrl)
    }
  }, [leadIdFromUrl, loading])

  const loadLeadFromUrl = async (leadId) => {
    try {
      for (const stageKey of Object.keys(groupedByStage)) {
        const lead = groupedByStage[stageKey].find(l => l._id === leadId)
        if (lead) {
          setDetailsLead(lead)
          return
        }
      }
      const lead = await leadService.getById(leadId)
      if (lead) setDetailsLead(lead)
    } catch (err) {
      console.error('Error loading lead from URL:', err)
    }
  }

  const handleAddLead = (stageKey) => {
    setEditingLead({ stage: stageKey })
    setModalOpen(true)
  }

  const handleEditLead = (lead) => {
    setEditingLead(lead)
    setModalOpen(true)
    setDetailsLead(null)
  }

  const handleViewLead = (lead) => {
    setDetailsLead(lead)
  }

  const handleSaveLead = async (data, leadId) => {
    try {
      if (leadId) {
        await updateLead(leadId, data)
      } else {
        await createLead(data)
      }
      setModalOpen(false)
      setEditingLead(null)
      await fetchLeads()
    } catch (err) {
      console.error('Error saving lead:', err)
    }
  }

  const handleDeleteLead = async (id) => {
    if (window.confirm(t('deleteConfirm'))) {
      try {
        await deleteLead(id)
        setDetailsLead(null)
        await fetchLeads()
      } catch (err) {
        console.error('Error deleting lead:', err)
      }
    }
  }

  const handleMoveLead = async (leadId, stageKey) => {
    await moveLead(leadId, stageKey)
  }

  const handleConvertLead = (lead) => {
    setConvertLead(lead)
    setConversionResult(null)
    setDetailsLead(null)
  }

  // ✅ ACTUALIZADO: Recibe y pasa los datos de conversión (saleAmount, etc.)
  const handleConvertConfirm = async (leadId, conversionData = {}) => {
    try {
      const result = await convertToCustomer(leadId, conversionData)
      setConversionResult(result)
    } catch (err) {
      console.error('Error converting lead:', err)
    }
  }

  const handleCloseConversion = () => {
    setConvertLead(null)
    setConversionResult(null)
  }

  const handleScoreUpdate = async () => {
    await fetchLeads()
  }

  const filteredGroupedByStage = Object.keys(groupedByStage).reduce((acc, stageKey) => {
    let stageLeads = groupedByStage[stageKey].filter(lead => 
      lead.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
      lead.phone?.includes(searchValue)
    )

    if (sortBy === 'score') {
      stageLeads.sort((a, b) => (b.score || 0) - (a.score || 0))
    }

    acc[stageKey] = stageLeads
    return acc
  }, {})

  const exportFilters = [
    { field: 'fromDate', label: t('filters.fromDate'), type: 'date', required: false },
    { field: 'toDate', label: t('filters.toDate'), type: 'date', required: false },
    {
      field: 'projectId', label: t('filters.project'), type: 'select',
      placeholder: t('filters.allProjects'), required: false,
      options: projects.map(p => ({ value: p._id, label: p.name }))
    },
    {
      field: 'stage', label: t('filters.stage'), type: 'select',
      placeholder: t('filters.allStages'), required: false,
      options: LEAD_STAGES.map(stage => ({
        value: stage, label: t(`stages.${stage}`),
        render: (opt) => (
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: STAGE_COLORS[stage] }} />
            {opt.label}
          </Box>
        )
      }))
    },
    {
      field: 'assignedTo', label: t('filters.assignedTo'), type: 'select',
      placeholder: t('filters.allAgents'), required: false,
      options: agents.map(agent => ({ value: agent._id, label: `${agent.firstName} ${agent.lastName} (${agent.role})` }))
    }
  ]

  return (
    <PageLayout title={t('title')} titleBold={t('titleBold')} topbarLabel={t('topbarLabel')} subtitle={t('description')}>
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder={t('searchPlaceholder')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />

          <ToggleButtonGroup value={sortBy} exclusive onChange={(e, value) => value && setSortBy(value)} size="small" sx={{ '& .MuiToggleButton-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem', textTransform: 'none', borderRadius: 0, py: 0.75 } }}>
            <ToggleButton value="createdAt"><CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />{t('sort.recent', 'Recientes')}</ToggleButton>
            <ToggleButton value="score"><TrendingUp sx={{ fontSize: 14, mr: 0.5 }} />{t('sort.priority', 'Prioridad')}</ToggleButton>
          </ToggleButtonGroup>

          {sortBy === 'score' && (
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#888', letterSpacing: '0.5px' }}>
              {t('sort.scoreInfo', 'Ordenando por score (mayor = más caliente)')}
            </Typography>
          )}

          <Box display="flex" gap={2} flexWrap="wrap">
            <ExportButton label={t('exportButton')} exportFn={crmReportsService.exportLeads} withModal={true} filters={exportFilters} />
            <Button variant="contained" startIcon={<Add />} onClick={() => handleAddLead('nuevo')} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              {t('newLead')}
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1}><CircularProgress /></Box>
        ) : (
          <KanbanBoard
            stages={stages}
            groupedByStage={filteredGroupedByStage}
            onLeadClick={handleViewLead}
            onAddLead={handleAddLead}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onMoveLead={handleMoveLead}
            onConvertLead={handleConvertLead}
            onScoreUpdate={handleScoreUpdate}
          />
        )}

        <LeadModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingLead(null) }}
          lead={editingLead}
          onSave={handleSaveLead}
        />

        <LeadDetails
          lead={detailsLead}
          open={Boolean(detailsLead)}
          onClose={() => { setDetailsLead(null) }}
          onEdit={handleEditLead}
          onDelete={handleDeleteLead}
          onConvert={handleConvertLead}
        />

        <ConvertLeadModal
          open={Boolean(convertLead)}
          onClose={handleCloseConversion}
          lead={convertLead}
          onConvert={handleConvertConfirm} // ✅ Ahora pasa (leadId, conversionData)
          conversionResult={conversionResult}
        />
      </Box>
    </PageLayout>
  )
}