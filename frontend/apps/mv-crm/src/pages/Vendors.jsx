// apps/mv-crm/src/pages/Vendors.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box, Typography, Grid, TextField, Button, Chip,
  FormControl, InputLabel, Select, MenuItem, InputAdornment,
  Paper, Skeleton, Alert
} from '@mui/material'
import {
  Search, Add, Business, FilterList, Clear
} from '@mui/icons-material'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import VendorCard from '../components/vendors/VendorCard'
import VendorModal from '../components/vendors/VendorModal'
import { useVendors } from '../constants/hooks/useVendors'
import { useProjects } from '@shared/hooks/useProjects'

export default function Vendors() {
  const { t, i18n } = useTranslation('vendors')
  const lang = i18n.language.startsWith('es') ? 'es' : 'en'
  const { projects } = useProjects()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [scope, setScope] = useState('')
  
  const [modalOpen, setModalOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState(null)

  const {
    vendors,
    categories,
    loading,
    error,
    filters,
    updateFilter,
    clearFilters,
    deleteVendor,
    refetch
  } = useVendors()

  const getSubcategories = () => {
    if (!selectedCategory || !categories.length) return []
    const category = categories.find(c => c.slug === selectedCategory)
    return category?.subcategories || []
  }

  const handleEdit = (vendor) => {
    setEditingVendor(vendor)
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('vendors.deleteConfirm', '¿Estás seguro de eliminar este proveedor?'))) {
      await deleteVendor(id)
    }
  }

  const handleCreate = () => {
    setEditingVendor(null)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingVendor(null)
  }

  const handleSaveSuccess = () => {
    refetch()
    handleCloseModal()
  }

  const activeFiltersCount = [
    selectedCategory,
    selectedSubcategory,
    selectedProject,
    scope,
    searchTerm
  ].filter(Boolean).length

  return (
    <PageLayout
      title={t('vendors.title', 'Proveedores')}
      titleBold={t('vendors.titleBold', 'Directorio')}
      topbarLabel={t('vendors.topbarLabel', 'Vendors')}
      subtitle={t('vendors.subtitle', 'Gestiona proveedores por categoría y proyecto')}
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6" sx={{ fontFamily: '"Courier New", monospace', fontWeight: 600 }}>
              {t('vendors.directory', 'Directorio')}
            </Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size="small"
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  borderRadius: 0,
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}
              />
            )}
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
              letterSpacing: '0.5px',
              bgcolor: '#000',
              color: '#fff',
              '&:hover': { bgcolor: '#222', boxShadow: '6px 6px 0px rgba(0,0,0,0.12)' }
            }}
          >
            {t('vendors.addVendor', 'Agregar Proveedor')}
          </Button>
        </Box>

        <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 0, bgcolor: '#fafafa' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <FilterList sx={{ fontSize: 20, color: '#666' }} />
              <Typography variant="subtitle2" fontWeight={600} sx={{ fontFamily: '"Courier New", monospace', letterSpacing: '0.5px' }}>
                {t('vendors.filters', 'Filtros')}
              </Typography>
            </Box>
            
            {activeFiltersCount > 0 && (
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={() => {
                  setSelectedCategory('')
                  setSelectedSubcategory('')
                  setSelectedProject('')
                  setScope('')
                  setSearchTerm('')
                  clearFilters()
                }}
                sx={{
                  borderRadius: 0,
                  textTransform: 'none',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.7rem',
                  color: '#888',
                  '&:hover': { bgcolor: '#f5f5f5' }
                }}
              >
                {t('vendors.clearFilters', 'Limpiar')}
              </Button>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('vendors.search', 'Buscar por nombre...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && updateFilter('search', searchTerm)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 18, color: '#888' }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.75rem'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                  {t('vendors.category', 'Categoría')}
                </InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setSelectedSubcategory('')
                    updateFilter('category', e.target.value)
                  }}
                  label={t('vendors.category', 'Categoría')}
                  sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}
                >
                  <MenuItem value="" sx={{ fontFamily: '"Courier New", monospace' }}>
                    {t('vendors.allCategories', 'Todas')}
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.slug} value={cat.slug} sx={{ fontFamily: '"Courier New", monospace' }}>
                      {cat.label[lang]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth size="small" disabled={!selectedCategory}>
                <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                  {t('vendors.subcategory', 'Subcategoría')}
                </InputLabel>
                <Select
                  value={selectedSubcategory}
                  onChange={(e) => {
                    setSelectedSubcategory(e.target.value)
                    updateFilter('subcategory', e.target.value)
                  }}
                  label={t('vendors.subcategory', 'Subcategoría')}
                  sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}
                >
                  <MenuItem value="" sx={{ fontFamily: '"Courier New", monospace' }}>
                    {t('vendors.allSubcategories', 'Todas')}
                  </MenuItem>
                  {getSubcategories().map((sub) => (
                    <MenuItem key={sub.slug} value={sub.slug} sx={{ fontFamily: '"Courier New", monospace' }}>
                      {sub.label[lang]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                  {t('vendors.project', 'Proyecto')}
                </InputLabel>
                <Select
                  value={selectedProject}
                  onChange={(e) => {
                    setSelectedProject(e.target.value)
                    setScope(e.target.value ? 'project' : '')
                    updateFilter('projectId', e.target.value)
                  }}
                  label={t('vendors.project', 'Proyecto')}
                  sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}
                >
                  <MenuItem value="" sx={{ fontFamily: '"Courier New", monospace' }}>
                    {t('vendors.allProjects', 'Todos')}
                  </MenuItem>
                  {projects.map((p) => (
                    <MenuItem key={p._id} value={p._id} sx={{ fontFamily: '"Courier New", monospace' }}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
                  {t('vendors.scope', 'Alcance')}
                </InputLabel>
                <Select
                  value={scope}
                  onChange={(e) => {
                    setScope(e.target.value)
                    updateFilter('scope', e.target.value)
                  }}
                  label={t('vendors.scope', 'Alcance')}
                  sx={{ borderRadius: 0, fontFamily: '"Courier New", monospace', fontSize: '0.75rem' }}
                >
                  <MenuItem value="" sx={{ fontFamily: '"Courier New", monospace' }}>
                    {t('vendors.both', 'Ambos')}
                  </MenuItem>
                  <MenuItem value="project" sx={{ fontFamily: '"Courier New", monospace' }}>
                    {t('vendors.projectOnly', 'Proyecto')}
                  </MenuItem>
                  <MenuItem value="general" sx={{ fontFamily: '"Courier New", monospace' }}>
                    {t('vendors.generalOnly', 'General')}
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 0, border: '1px solid' }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Grid container spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 0 }} />
              </Grid>
            ))}
          </Grid>
        ) : vendors.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center', border: '2px dashed #e0e0e0', borderRadius: 0, bgcolor: '#fafafa' }}>
            <Business sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', color: '#888' }}>
              {t('vendors.noVendors', 'No hay proveedores registrados')}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {vendors.map((vendor) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={vendor._id}>
                <VendorCard
                  vendor={vendor}
                  onClick={() => handleEdit(vendor)}
                  onEdit={() => handleEdit(vendor)}
                  onDelete={() => handleDelete(vendor._id)}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <VendorModal
          open={modalOpen}
          onClose={handleCloseModal}
          vendor={editingVendor}
          onSave={handleSaveSuccess}
          categories={categories}
        />
      </Box>
    </PageLayout>
  )
}