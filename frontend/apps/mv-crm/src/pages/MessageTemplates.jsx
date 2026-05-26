import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Button,
  Alert
} from '@mui/material'
import { Add } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import DataTable from '@shared/components/table/DataTable'
import MessageTemplateModal from '../components/MessageTemplateModal'
import useMessageTemplates from '../constants/hooks/useMessageTemplates'
import { getMessageTemplatesColumns } from '../constants/Columns/messageTemplates'

export default function MessageTemplates() {
  const { t } = useTranslation('sms')
  const { templates, loading, error, createTemplate, updateTemplate, deleteTemplate } = useMessageTemplates()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)

  const handleAddTemplate = () => {
    setEditingTemplate(null)
    setModalOpen(true)
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setModalOpen(true)
  }

  const handleSaveTemplate = async (data, templateId) => {
    try {
      if (templateId) {
        await updateTemplate(templateId, data)
      } else {
        await createTemplate(data)
      }
      setModalOpen(false)
      setEditingTemplate(null)
    } catch (err) {
      console.error('Error saving template:', err)
    }
  }

  const handleDeleteTemplate = async (id) => {
    if (window.confirm(t('sms.templates.deleteConfirm'))) {
      try {
        await deleteTemplate(id)
      } catch (err) {
        console.error('Error deleting template:', err)
      }
    }
  }

  // Memorizar columnas para que se recalculen solo cuando cambia t
  const columns = useMemo(
    () => getMessageTemplatesColumns(t, handleEditTemplate, handleDeleteTemplate),
    [t]
  )

  return (
    <PageLayout>
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {t('sms.templates.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('sms.templates.subtitle')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddTemplate}
          >
            {t('sms.templates.newBtn')}
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* DataTable */}
        <Box flex={1} sx={{ overflow: 'hidden' }}>
          <DataTable
            data={templates}
            columns={columns}
            loading={loading}
          />
        </Box>

        {/* Modal */}
        <MessageTemplateModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditingTemplate(null)
          }}
          template={editingTemplate}
          onSave={handleSaveTemplate}
        />
      </Box>
    </PageLayout>
  )
}