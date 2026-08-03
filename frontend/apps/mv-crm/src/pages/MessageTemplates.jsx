// apps/mv-crm/src/pages/MessageTemplates.jsx
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

  const columns = useMemo(
    () => getMessageTemplatesColumns(t, handleEditTemplate, handleDeleteTemplate),
    [t]
  )

  // ✅ Estilos unificados
  const unifiedButtonSx = { borderRadius: 0, textTransform: 'none', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: '0.5px', '&:hover': { boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }

  return (
    <PageLayout
      title={t('sms.templates.title')}
      subtitle={t('sms.templates.subtitle')}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* ✅ Fila unificada: Título a la izquierda, Botón a la derecha */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Box /> {/* Espaciador para alinear el botón a la derecha */}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddTemplate}
            sx={{ ...unifiedButtonSx, bgcolor: '#000', color: '#fff', fontWeight: 600, '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' } }}
          >
            {t('sms.templates.newBtn')}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0, border: '1px solid', fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}>
            {error}
          </Alert>
        )}

        <Box flex={1} sx={{ overflow: 'hidden' }}>
          <DataTable
            data={templates}
            columns={columns}
            loading={loading}
          />
        </Box>

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