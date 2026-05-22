// frontend/apps/mv-crm/src/pages/MessageTemplates.jsx
import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material'
import { Add, Edit, Delete, Sms, Email } from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import DataTable from '@shared/components/table/DataTable'
import MessageTemplateModal from '../components/MessageTemplateModal'
import useMessageTemplates from '../constants/hooks/useMessageTemplates'

export default function MessageTemplates() {
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
    if (window.confirm('¿Eliminar este template?')) {
      try {
        await deleteTemplate(id)
      } catch (err) {
        console.error('Error deleting template:', err)
      }
    }
  }

// Actualizar columnas (línea ~58-155)
const columns = [
  {
    field: 'name',
    headerName: 'Nombre',
    flex: 1,
    minWidth: 200,
    renderCell: (params) => (
      <Box>
        <Typography variant="body2" fontWeight={600}>
          {params.row.name}
        </Typography>
        {params.row.category && (
          <Chip 
            label={params.row.category} 
            size="small" 
            sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
          />
        )}
      </Box>
    )
  },
  {
    field: 'template',
    headerName: 'Contenido',
    flex: 1,
    minWidth: 300,
    renderCell: (params) => (
      <Typography variant="body2" sx={{ 
        overflow: 'hidden', 
        textOverflow: 'ellipsis', 
        whiteSpace: 'nowrap',
        maxWidth: '100%'
      }}>
        {params.row.template}
      </Typography>
    )
  },
  {
    field: 'description',
    headerName: 'Descripción',
    flex: 1,
    minWidth: 200,
    renderCell: (params) => (
      <Typography variant="caption" color="text.secondary">
        {params.row.description || '-'}
      </Typography>
    )
  },
  {
    field: 'actions',
    headerName: 'Acciones',
    width: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Box display="flex" gap={0.5}>
        <Tooltip title="Editar">
          <IconButton 
            size="small"
            onClick={() => handleEditTemplate(params.row)}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton 
            size="small"
            color="error"
            onClick={() => handleDeleteTemplate(params.row._id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }
]

  return (
    <PageLayout>
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Templates de Mensajes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crea y gestiona templates para envíos masivos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddTemplate}
          >
            Nuevo Template
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
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