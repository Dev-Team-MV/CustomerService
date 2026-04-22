// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/components/CatalogConfig/CatalogConfigPage.jsx

import { useState } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material'
import {
  Add as AddIcon,
  Publish as PublishIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import useCatalogConfig from '@shared/hooks/useCatalogConfig'

/**
 * Página genérica de gestión de Catalog Config
 * Funciona para CUALQUIER proyecto (6town, lakewood, phase-2, etc.)
 * 
 * @param {string} projectId - ID del proyecto
 * @param {string} projectSlug - Slug del proyecto
 * @param {React.Component} EditorComponent - Componente específico del proyecto para editar
 */
const CatalogConfigPage = ({ projectId, projectSlug, EditorComponent }) => {
  const theme = useTheme()
  const { t } = useTranslation(['catalogConfig', 'common'])
  
  const {
    catalogConfig,
    allVersions,
    loading,
    error,
    saving,
    loadAllVersions,
    createConfig,
    updateConfig,
    publishVersion,
    hasConfig
  } = useCatalogConfig(projectId, { autoLoad: true, activeOnly: false })

  const [activeTab, setActiveTab] = useState(0)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState(null)
  const [versionToPublish, setVersionToPublish] = useState(null)

  // Abrir visor de configuración
  const handleView = (config) => {
    setSelectedConfig(config)
    setViewDialogOpen(true)
  }

  // Abrir editor de configuración
  const handleEdit = (config) => {
    setSelectedConfig(config)
    setEditDialogOpen(true)
  }

  // Crear nueva configuración
  const handleCreateNew = () => {
    setSelectedConfig({
      catalogType: 'houses', // Default, el proyecto puede cambiarlo
      structure: {},
      pricingRules: [],
      assetsSchema: {}
    })
    setEditDialogOpen(true)
  }

  // Guardar configuración (crear o actualizar)
// Guardar configuración (crear o actualizar)
const handleSave = async (configData) => {
  console.log('🔍 GUARDANDO CONFIG:', JSON.stringify(configData, null, 2))

  try {
    if (selectedConfig?.version) {
      console.log('📝 Actualizando versión:', selectedConfig.version)
      const result = await updateConfig(configData)
      console.log('✅ Actualizado:', result)
    } else {
      console.log('✨ Creando nueva configuración...')
      const result = await createConfig(configData)
      console.log('✅ Creado:', result)
    }
    setEditDialogOpen(false)
    setSelectedConfig(null)
    console.log('🔄 Recargando versiones...')
    await loadAllVersions()
    console.log('✅ Todo completado')
  } catch (err) {
    console.error('❌ Error saving config:', err)
    console.error('❌ Error response:', err.response?.data)
    console.error('❌ Error status:', err.response?.status)
  }
}

  // Confirmar publicación
  const handlePublishClick = (version) => {
    setVersionToPublish(version)
    setPublishDialogOpen(true)
  }

  // Publicar versión
  const handlePublishConfirm = async () => {
    try {
      await publishVersion(versionToPublish)
      setPublishDialogOpen(false)
      setVersionToPublish(null)
      await loadAllVersions()
    } catch (err) {
      console.error('Error publishing version:', err)
    }
  }

if (loading && !allVersions.length) {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    </Container>
  )
}
 
// Después del header, cambiar el manejo de error:
{error && !error.includes('not found') && (
  <Alert severity="error" sx={{ mb: 3 }}>
    {error}
  </Alert>
)}

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* HEADER */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
              {t('catalogConfig:title', 'Catalog Configuration')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif', mt: 0.5 }}>
              {t('catalogConfig:subtitle', 'Manage pricing rules and customization options for')} {projectSlug}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            disabled={!EditorComponent}
            sx={{
              bgcolor: theme.palette.primary.main,
              fontFamily: '"Poppins", sans-serif',
              textTransform: 'none',
              px: 3
            }}
          >
            {t('catalogConfig:createNew', 'Create New Version')}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!EditorComponent && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No editor component provided. You can view configurations but cannot create or edit them.
        </Alert>
      )}

      {/* TABS */}
      <Paper elevation={0} sx={{ borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            px: 2
          }}
        >
          <Tab 
            label={t('catalogConfig:allVersions', 'All Versions')} 
            sx={{ fontFamily: '"Poppins", sans-serif', textTransform: 'none', fontWeight: 600 }} 
          />
          <Tab 
            label={t('catalogConfig:activeConfig', 'Active Configuration')} 
            sx={{ fontFamily: '"Poppins", sans-serif', textTransform: 'none', fontWeight: 600 }} 
          />
        </Tabs>

        {/* TAB 1: ALL VERSIONS */}
        {activeTab === 0 && (
          <Box p={3}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
                      {t('catalogConfig:version', 'Version')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
                      {t('catalogConfig:status', 'Status')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
                      {t('catalogConfig:type', 'Type')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
                      {t('catalogConfig:created', 'Created')}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
                      {t('catalogConfig:actions', 'Actions')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allVersions.map((config) => (
                    <TableRow key={config.version} hover>
                      <TableCell sx={{ fontFamily: '"Poppins", sans-serif' }}>
                        <Chip label={`v${config.version}`} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={config.status}
                          size="small"
                          color={config.status === 'published' ? 'success' : 'default'}
                          icon={config.status === 'published' ? <CheckIcon /> : undefined}
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: '"Poppins", sans-serif' }}>
                        {config.catalogType || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontFamily: '"Poppins", sans-serif' }}>
                        {new Date(config.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => handleView(config)}
                          sx={{ fontFamily: '"Poppins", sans-serif', textTransform: 'none', mr: 1 }}
                        >
                          View
                        </Button>
                        {config.status === 'draft' && EditorComponent && (
                          <>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleEdit(config)}
                              sx={{ fontFamily: '"Poppins", sans-serif', textTransform: 'none', mr: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              startIcon={<PublishIcon />}
                              onClick={() => handlePublishClick(config.version)}
                              color="success"
                              sx={{ fontFamily: '"Poppins", sans-serif', textTransform: 'none' }}
                            >
                              Publish
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {allVersions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                          {t('catalogConfig:noVersions', 'No versions found. Create your first configuration.')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* TAB 2: ACTIVE CONFIG */}
        {activeTab === 1 && (
          <Box p={3}>
            {catalogConfig ? (
              <>
                <Alert severity="info" icon={<CheckIcon />} sx={{ mb: 3 }}>
                  {t('catalogConfig:activeVersionInfo', 'This is the currently active configuration used for quotes.')}
                </Alert>
                
                <Grid container spacing={2} mb={3}>
                  <Grid item>
                    <Chip label={`Version ${catalogConfig.version}`} color="primary" />
                  </Grid>
                  <Grid item>
                    <Chip label={catalogConfig.status} color="success" icon={<CheckIcon />} />
                  </Grid>
                  <Grid item>
                    <Chip label={catalogConfig.catalogType} />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Vista genérica de la estructura */}
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {t('catalogConfig:structure', 'Structure')}
                </Typography>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', mb: 3 }}>
                  <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', overflow: 'auto' }}>
                    {JSON.stringify(catalogConfig.structure, null, 2)}
                  </pre>
                </Paper>

                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {t('catalogConfig:pricingRules', 'Pricing Rules')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif', mb: 2 }}>
                  {catalogConfig.pricingRules?.length || 0} {t('catalogConfig:rulesConfigured', 'rules configured')}
                </Typography>
                {catalogConfig.pricingRules?.map((rule, idx) => (
                  <Paper key={idx} elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                      {rule.label || rule.code}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                      Adjustment: ${rule.adjustment}
                    </Typography>
                  </Paper>
                ))}
              </>
            ) : (
              <Alert severity="warning">
                {t('catalogConfig:noActiveConfig', 'No active configuration found. Create and publish a version first.')}
              </Alert>
            )}
          </Box>
        )}
      </Paper>

      {/* DIALOG: VIEW CONFIG */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: '"Poppins", sans-serif' }}>
          View Configuration v{selectedConfig?.version}
        </DialogTitle>
        <DialogContent>
          {selectedConfig && (
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontFamily: '"Poppins", sans-serif' }}>
                Full Configuration:
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', overflow: 'auto', maxHeight: '400px' }}>
                  {JSON.stringify(selectedConfig, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)} sx={{ fontFamily: '"Poppins", sans-serif' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: EDIT CONFIG (usa el EditorComponent del proyecto) */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: '"Poppins", sans-serif' }}>
          {selectedConfig?.version
            ? `Edit Version ${selectedConfig.version}`
            : 'Create New Configuration'}
        </DialogTitle>
        <DialogContent>
          {EditorComponent && selectedConfig ? (
            <EditorComponent
              config={selectedConfig}
              onChange={setSelectedConfig}
            />
          ) : (
            <Alert severity="warning">
              No editor component provided for this project.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ fontFamily: '"Poppins", sans-serif' }}>
            Cancel
          </Button>
          <Button
            onClick={() => handleSave(selectedConfig)}
            variant="contained"
            disabled={saving}
            sx={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: CONFIRM PUBLISH */}
      <Dialog open={publishDialogOpen} onClose={() => setPublishDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: '"Poppins", sans-serif' }}>
          Confirm Publish
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: '"Poppins", sans-serif' }}>
            Are you sure you want to publish version {versionToPublish}? This will make it the active configuration for all new quotes.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)} sx={{ fontFamily: '"Poppins", sans-serif' }}>
            Cancel
          </Button>
          <Button
            onClick={handlePublishConfirm}
            variant="contained"
            color="success"
            disabled={saving}
            sx={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {saving ? <CircularProgress size={20} /> : 'Publish'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default CatalogConfigPage