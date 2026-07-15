// apps/mv-crm/src/pages/Automations.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material'
import { Add, AutoAwesome } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import AutomationBuilder from '../components/automations/AutomationBuilder'
import AutomationCard from '../components/automations/AutomationCard'
import { useAutomations } from '../constants/hooks/useAutomations'
import { useProjects } from '@shared/hooks/useProjects'
import { useCrmAgents } from '../constants/hooks/useCrmAgents'

export default function Automations() {
  const { t } = useTranslation('automation')
  const { 
    automations, 
    loading, 
    error, 
    createAutomation, 
    updateAutomation, 
    deleteAutomation, 
    toggleAutomation,
    testAutomation 
  } = useAutomations()
  const { projects } = useProjects()
  const { agents } = useCrmAgents()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAutomation, setSelectedAutomation] = useState(null)
  const [testResults, setTestResults] = useState({})

  const handleCreate = () => {
    setSelectedAutomation(null)
    setModalOpen(true)
  }

  const handleEdit = (automation) => {
    setSelectedAutomation(automation)
    setModalOpen(true)
  }

  const handleSave = async (id, data) => {
    if (id) {
      await updateAutomation(id, data)
    } else {
      await createAutomation(data)
    }
  }

  const handleDelete = async (id) => {
    await deleteAutomation(id)
  }

  const handleToggle = async (id, isActive) => {
    await toggleAutomation(id, isActive)
  }

  const handleTest = async (id) => {
    try {
      const result = await testAutomation(id, {})
      setTestResults(prev => ({ ...prev, [id]: result }))
    } catch (err) {
      console.error('Error testing automation:', err)
    }
  }

  return (
    <PageLayout
      title={t('title')}
      titleBold={t('titleBold')}
      topbarLabel={t('topbarLabel')}
      subtitle={t('subtitle')}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" gap={1} alignItems="center">
            <Chip
              label={`${automations.length} ${t('total')}`}
              size="small"
              sx={{
                bgcolor: '#000',
                color: '#fff',
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                fontWeight: 600
              }}
            />
            <Chip
              label={`${automations.filter(a => a.isActive).length} ${t('active')}`}
              size="small"
              sx={{
                bgcolor: '#4caf50',
                color: '#fff',
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                fontWeight: 600
              }}
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreate}
            sx={{
              borderRadius: 0,
              textTransform: 'none',
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              letterSpacing: '0.5px'
            }}
          >
            {t('createAutomation')}
          </Button>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress />
          </Box>
        ) : automations.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              border: '1px solid #ececec',
              borderRadius: 1,
              bgcolor: '#fff',
              textAlign: 'center'
            }}
          >
            <AutoAwesome sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.85rem',
                color: '#888',
                letterSpacing: '0.5px',
                mb: 1
              }}
            >
              {t('empty.title')}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                color: '#aaa',
                letterSpacing: '0.5px',
                mb: 3
              }}
            >
              {t('empty.description')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
              sx={{
                borderRadius: 0,
                textTransform: 'none',
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                letterSpacing: '0.5px'
              }}
            >
              {t('createAutomation')}
            </Button>
          </Paper>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {automations.map(automation => (
              <AutomationCard
                key={automation._id}
                automation={automation}
                projects={projects}
                agents={agents}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTest={handleTest}
                onToggle={handleToggle}
                testResult={testResults[automation._id]}
              />
            ))}
          </Box>
        )}

        {/* Modal Builder */}
        <AutomationBuilder
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedAutomation(null)
          }}
          automation={selectedAutomation}
          onSave={handleSave}
          onDelete={handleDelete}
          onTest={testAutomation}
          projects={projects}
          agents={agents}
        />
      </Box>
    </PageLayout>
  )
}