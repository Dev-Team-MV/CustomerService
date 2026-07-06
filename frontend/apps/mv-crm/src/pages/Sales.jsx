// apps/mv-crm/src/pages/Sales.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material'
import { Add, Search } from '@mui/icons-material'
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

export default function Sales() {
  const { t } = useTranslation('leads')
  
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

  const handleConvertConfirm = async (leadId) => {
    try {
      const result = await convertToCustomer(leadId)
      setConversionResult(result)
    } catch (err) {
      console.error('Error converting lead:', err)
    }
  }

  const handleCloseConversion = () => {
    setConvertLead(null)
    setConversionResult(null)
  }

  // Filtrar leads por búsqueda
  const filteredGroupedByStage = Object.keys(groupedByStage).reduce((acc, stageKey) => {
    acc[stageKey] = groupedByStage[stageKey].filter(lead => 
      lead.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
      lead.phone?.includes(searchValue)
    )
    return acc
  }, {})

  // ✅ Configuración de filtros para el ExportButton (con i18n)
  const exportFilters = [
    {
      field: 'fromDate',
      label: t('filters.fromDate'),
      type: 'date',
      required: false
    },
    {
      field: 'toDate',
      label: t('filters.toDate'),
      type: 'date',
      required: false
    },
    {
      field: 'projectId',
      label: t('filters.project'),
      type: 'select',
      placeholder: t('filters.allProjects'),
      required: false,
      options: projects.map(p => ({ value: p._id, label: p.name }))
    },
    {
      field: 'stage',
      label: t('filters.stage'),
      type: 'select',
      placeholder: t('filters.allStages'),
      required: false,
      options: LEAD_STAGES.map(stage => ({
        value: stage,
        label: t(`stages.${stage}`),
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
      label: t('filters.assignedTo'),
      type: 'select',
      placeholder: t('filters.allAgents'),
      required: false,
      options: agents.map(agent => ({
        value: agent._id,
        label: `${agent.firstName} ${agent.lastName} (${agent.role})`
      }))
    }
  ]

  return (
    <PageLayout>
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {t('title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('description')}
            </Typography>
          </Box>
          
          <Box display="flex" gap={2}>
            {/* ✅ INTERNACIONALIZADO: ExportButton con filtros traducidos */}
            <ExportButton
              label={t('exportButton')}
              exportFn={crmReportsService.exportLeads}
              withModal={true}
              filters={exportFilters}
            />

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleAddLead('nuevo')}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              {t('newLead')}
            </Button>
          </Box>
        </Box>

        {/* Search */}
        <Box display="flex" gap={2} mb={3}>
          <TextField
            placeholder={t('searchPlaceholder')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
            <CircularProgress />
          </Box>
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
          />
        )}

        {/* Modals */}
        <LeadModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditingLead(null)
          }}
          lead={editingLead}
          onSave={handleSaveLead}
        />

        <LeadDetails
          lead={detailsLead}
          open={Boolean(detailsLead)}
          onClose={() => setDetailsLead(null)}
          onEdit={handleEditLead}
          onDelete={handleDeleteLead}
          onConvert={handleConvertLead}
        />

        <ConvertLeadModal
          open={Boolean(convertLead)}
          onClose={handleCloseConversion}
          lead={convertLead}
          onConvert={handleConvertConfirm}
          conversionResult={conversionResult}
        />
      </Box>
    </PageLayout>
  )
}