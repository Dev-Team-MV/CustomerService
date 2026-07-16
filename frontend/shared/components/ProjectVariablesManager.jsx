// /Users/oficina/MV-CRM/CustomerService/frontend/shared/components/projects/ProjectVariablesManager.jsx

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box, Paper, Typography, TextField, Button, IconButton, Chip, Stack,
  Tabs, Tab, Alert, CircularProgress, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Breadcrumbs, Link, List, ListItemButton,
  ListItemIcon, ListItemText, Divider
} from '@mui/material'
import {
  Add, Edit, Delete, Code, Category, Save, Cancel, Info, ChevronRight,
  ArrowBack, AccountCircle, Person, Home, Business, Payment, Tune,
  DataObject, Link as LinkIcon, CheckCircle
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useProjectVariables, validateVariableName } from '@shared/hooks/useProjectVariables'
import projectService from '@shared/services/projectService'

// ═══════════════════════════════════════════════════════════════
// CATEGORÍAS CON CLAVES DE TRADUCCIÓN
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CATEGORIES = [
  { key: 'all', labelKey: 'variables.categories.all', icon: Category, color: '#757575' },
  { key: 'Usuario', labelKey: 'variables.categories.Usuario', icon: AccountCircle, color: '#2196f3' },
  { key: 'Cliente', labelKey: 'variables.categories.Cliente', icon: Person, color: '#4caf50' },
  { key: 'Proyecto', labelKey: 'variables.categories.Proyecto', icon: Business, color: '#9c27b0' },
  { key: 'Lote', labelKey: 'variables.categories.Lote', icon: Home, color: '#ff9800' },
  { key: 'Edificio', labelKey: 'variables.categories.Edificio', icon: Business, color: '#795548' },
  { key: 'Apartamento', labelKey: 'variables.categories.Apartamento', icon: Home, color: '#009688' },
  { key: 'ApartamentoModelo', labelKey: 'variables.categories.ApartamentoModelo', icon: Category, color: '#673ab7' },
  { key: 'Pago', labelKey: 'variables.categories.Pago', icon: Payment, color: '#f44336' },
  { key: 'Custom', labelKey: 'variables.categories.Custom', icon: Tune, color: '#607d8b' }
]

// Mapeo: root key (backend) → categoría (frontend)
const ROOT_TO_CATEGORY = {
  user: 'Usuario',
  client: 'Cliente',
  project: 'Proyecto',
  lot: 'Lote',
  building: 'Edificio',
  apartment: 'Apartamento',
  apartmentModel: 'ApartamentoModelo',
  payment: 'Pago',
  property: 'Proyecto',
  lead: 'Cliente'
}

// Iconos para raíces
const ROOT_ICONS = {
  user: AccountCircle,
  client: Person,
  project: Business,
  lot: Home,
  building: Business,
  apartment: Home,
  apartmentModel: Category,
  payment: Payment,
  property: Business,
  lead: Person
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: Tab para categoría
// ═══════════════════════════════════════════════════════════════

const CategoryTab = ({ category, count, isSelected, t }) => {
  const Icon = category.icon
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
      {Icon && <Icon sx={{ fontSize: 16, color: category.color }} />}
      {!Icon && (
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: category.color }} />
      )}
      <Typography
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.5px'
        }}
      >
        {t(category.labelKey)}
      </Typography>
      <Chip
        label={count}
        size="small"
        sx={{
          bgcolor: count > 0 
            ? (isSelected ? category.color : '#e0e0e0')
            : '#f5f5f5',
          color: count > 0 
            ? (isSelected ? '#fff' : '#666')
            : '#999',
          height: 20,
          minWidth: 20,
          fontSize: '0.65rem',
          fontWeight: 700
        }}
      />
    </Box>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: Fila de variable
// ═══════════════════════════════════════════════════════════════

const VariableRow = ({ variable, onEdit, onDelete, disabled, variant = 'page', t }) => {
  const category = DEFAULT_CATEGORIES.find(c => c.key === variable.categoria) || 
                   DEFAULT_CATEGORIES.find(c => c.key === 'Custom')

  const handleCopy = () => {
    navigator.clipboard.writeText(`{{${variable.name}}}`)
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: `1px solid ${variant === 'dialog' ? '#e0e0e0' : '#ececec'}`,
        borderRadius: 2,
        bgcolor: variant === 'dialog' ? '#fff' : '#fafafa',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: category.color,
          boxShadow: `0 2px 8px ${category.color}20`
        }
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          sx={{
            width: 4,
            height: 40,
            borderRadius: 2,
            bgcolor: category.color,
            flexShrink: 0
          }}
        />

        <Box flex={1} minWidth={0}>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Code sx={{ fontSize: 14, color: '#666' }} />
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#000'
              }}
            >
              {`{{${variable.name}}}`}
            </Typography>
            <Chip
              label={t(`variables.categories.${variable.categoria}`, variable.categoria)}
              size="small"
              sx={{
                bgcolor: `${category.color}20`,
                color: category.color,
                fontSize: '0.6rem',
                fontWeight: 700,
                height: 20
              }}
            />
          </Box>
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              color: '#888',
              letterSpacing: '0.5px'
            }}
          >
            <strong>{t('variables.path')}:</strong> {variable.recorrido}
          </Typography>
        </Box>

        {!disabled && (
          <Box display="flex" gap={0.5}>
            <Tooltip title={t('variables.copyVariable')}>
              <IconButton size="small" onClick={handleCopy}>
                <Code fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('variables.editVariable')}>
              <IconButton size="small" onClick={() => onEdit(variable)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('variables.deleteVariable')}>
              <IconButton 
                size="small" 
                onClick={() => onDelete(variable)}
                sx={{ color: '#d32f2f' }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: Path Builder
// ═══════════════════════════════════════════════════════════════

const PathBuilder = ({ 
  projectId, 
  lang, 
  onPathSelected, 
  initialRecorrido = '', 
  initialCategoria = 'Usuario',
  isDialog 
}) => {
  const { t } = useTranslation('common')
  
  const [roots, setRoots] = useState([])
  const [loadingRoots, setLoadingRoots] = useState(false)
  const [currentPath, setCurrentPath] = useState('')
  const [segments, setSegments] = useState([])
  const [loadingSegments, setLoadingSegments] = useState(false)
  const [pathHistory, setPathHistory] = useState([])
  const [selectedRecorrido, setSelectedRecorrido] = useState(initialRecorrido)
  const [selectedCategoria, setSelectedCategoria] = useState(initialCategoria)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRoots = async () => {
      if (!projectId) return
      setLoadingRoots(true)
      setError('')
      try {
        const data = await projectService.getVariableRoots(projectId, lang)
        setRoots(data)
      } catch (err) {
        setError(err.message || t('status.error'))
      } finally {
        setLoadingRoots(false)
      }
    }
    loadRoots()
  }, [projectId, lang])

  useEffect(() => {
    const loadSegments = async () => {
      if (!projectId || !currentPath) {
        setSegments([])
        return
      }
      setLoadingSegments(true)
      setError('')
      try {
        const data = await projectService.getVariableSegments(projectId, currentPath, lang)
        setSegments(Array.isArray(data?.items) ? data.items : [])
      } catch (err) {
        setError(err.message || t('status.error'))
        setSegments([])
      } finally {
        setLoadingSegments(false)
      }
    }
    loadSegments()
  }, [projectId, currentPath, lang])

  const handleSelectRoot = (root) => {
    const categoria = ROOT_TO_CATEGORY[root.key] || 'Custom'
    setSelectedCategoria(categoria)
    setPathHistory([{ key: root.key, label: root.label, type: 'root' }])
    setCurrentPath(root.key)
    setSelectedRecorrido('')
  }

  const handleSelectItem = (item) => {
    const newPath = currentPath ? `${currentPath}.${item.key}` : item.key
    
    if (item.type === 'scalar' || !item.hasChildren) {
      setSelectedRecorrido(item.recorrido || newPath)
    } else {
      setPathHistory(prev => [...prev, { 
        key: item.key, 
        label: item.label, 
        type: item.type,
        ref: item.ref 
      }])
      setCurrentPath(newPath)
      setSelectedRecorrido('')
    }
  }

  const handleNavigateTo = (index) => {
    if (index < 0 || index >= pathHistory.length) return
    const newPathHistory = pathHistory.slice(0, index + 1)
    setPathHistory(newPathHistory)
    const newPath = newPathHistory.map(h => h.key).join('.')
    setCurrentPath(newPath)
    setSelectedRecorrido('')
  }

  const handleBack = () => {
    if (pathHistory.length <= 1) {
      setPathHistory([])
      setCurrentPath('')
      setSegments([])
      setSelectedRecorrido('')
      return
    }
    handleNavigateTo(pathHistory.length - 2)
  }

  const handleConfirmSelection = () => {
    if (!selectedRecorrido) return
    onPathSelected?.({
      recorrido: selectedRecorrido,
      categoria: selectedCategoria
    })
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      {pathHistory.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs
            separator={<ChevronRight sx={{ fontSize: 14, color: '#999' }} />}
            sx={{
              '& .MuiBreadcrumbs-separator': { mx: 0.5 },
              '& .MuiBreadcrumbs-li': { display: 'flex', alignItems: 'center' }
            }}
          >
            {pathHistory.map((item, idx) => {
              const isLast = idx === pathHistory.length - 1
              const Icon = ROOT_ICONS[item.key] || DataObject
              return (
                <Link
                  key={idx}
                  component="button"
                  underline="hover"
                  onClick={() => !isLast && handleNavigateTo(idx)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: isLast ? '#000' : '#1976d2',
                    fontWeight: isLast ? 700 : 400,
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.75rem',
                    cursor: isLast ? 'default' : 'pointer',
                    '&:hover': {
                      color: isLast ? '#000' : '#0d47a1'
                    }
                  }}
                >
                  {idx === 0 && <Icon sx={{ fontSize: 14 }} />}
                  {item.label}
                </Link>
              )
            })}
          </Breadcrumbs>

          <Button
            size="small"
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{
              mt: 1,
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              textTransform: 'none',
              color: '#666'
            }}
          >
            {pathHistory.length === 1 
              ? t('variables.backToRoots') 
              : t('variables.back')}
          </Button>
        </Box>
      )}

      {pathHistory.length === 0 && (
        <>
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              mb: 1.5,
              color: '#666'
            }}
          >
            {t('variables.selectCategory')}
          </Typography>

          {loadingRoots ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={24} />
            </Box>
          ) : roots.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 0 }}>
              {t('variables.noRoots')}
            </Alert>
          ) : (
            <Box display="flex" gap={1.5} flexWrap="wrap">
              {roots.map(root => {
                const Icon = ROOT_ICONS[root.key] || DataObject
                const categoria = ROOT_TO_CATEGORY[root.key]
                const categoryData = DEFAULT_CATEGORIES.find(c => c.key === categoria) || DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1]
                
                return (
                  <Paper
                    key={root.key}
                    elevation={0}
                    onClick={() => handleSelectRoot(root)}
                    sx={{
                      p: 2,
                      minWidth: 140,
                      border: `2px solid ${categoryData.color}30`,
                      borderRadius: 2,
                      bgcolor: `${categoryData.color}08`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: categoryData.color,
                        bgcolor: `${categoryData.color}15`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${categoryData.color}30`
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: categoryData.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff'
                        }}
                      >
                        <Icon sx={{ fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: '"Courier New", monospace',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#000'
                          }}
                        >
                          {root.label}
                        </Typography>
                        {root.description && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#888',
                              fontSize: '0.65rem',
                              display: 'block',
                              maxWidth: 150,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {root.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                )
              })}
            </Box>
          )}
        </>
      )}

      {pathHistory.length > 0 && (
        <>
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              mb: 1.5,
              color: '#666'
            }}
          >
            {t('variables.selectField')}
          </Typography>

          {loadingSegments ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={24} />
            </Box>
          ) : segments.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 0 }}>
              {t('variables.noSegments')}
            </Alert>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${isDialog ? '#e0e0e0' : '#ececec'}`
              }}
            >
              <List disablePadding>
                {segments.map((item, idx) => {
                  const isSelected = selectedRecorrido === item.recorrido
                  const isRef = item.type === 'ref' || item.hasChildren
                  
                  return (
                    <ListItemButton
                      key={item.key}
                      onClick={() => handleSelectItem(item)}
                      selected={isSelected}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderBottom: idx < segments.length - 1 ? `1px solid ${isDialog ? '#f0f0f0' : '#f5f5f5'}` : 'none',
                        '&:hover': {
                          bgcolor: isRef ? '#e3f2fd' : '#e8f5e9'
                        },
                        '&.Mui-selected': {
                          bgcolor: '#e8f5e9',
                          '&:hover': { bgcolor: '#c8e6c9' }
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {isRef ? (
                          <LinkIcon sx={{ fontSize: 18, color: '#1976d2' }} />
                        ) : (
                          <DataObject sx={{ fontSize: 18, color: '#4caf50' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography
                              sx={{
                                fontFamily: '"Courier New", monospace',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: '#000'
                              }}
                            >
                              {item.label}
                            </Typography>
                            <Chip
                              label={isRef ? t('variables.chipTypes.ref') : t('variables.chipTypes.value')}
                              size="small"
                              sx={{
                                bgcolor: isRef ? '#e3f2fd' : '#e8f5e9',
                                color: isRef ? '#1976d2' : '#2e7d32',
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                height: 18
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography
                            sx={{
                              fontFamily: '"Courier New", monospace',
                              fontSize: '0.7rem',
                              color: '#888',
                              mt: 0.3
                            }}
                          >
                            {item.recorrido || `${currentPath}.${item.key}`}
                          </Typography>
                        }
                      />
                      {isRef && (
                        <ChevronRight sx={{ color: '#1976d2', fontSize: 20 }} />
                      )}
                      {!isRef && isSelected && (
                        <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                      )}
                    </ListItemButton>
                  )
                })}
              </List>
            </Paper>
          )}
        </>
      )}

      {selectedRecorrido && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: '#e8f5e9',
            border: '1px solid #4caf50',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.7rem',
                  color: '#2e7d32',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
              >
                {t('variables.selectedPath')}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#1b5e20'
                }}
              >
                {selectedRecorrido}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={t(`variables.categories.${selectedCategoria}`, selectedCategoria)}
            size="small"
            sx={{
              bgcolor: '#4caf50',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.7rem'
            }}
          />
        </Box>
      )}

      {selectedRecorrido && (
        <Button
          fullWidth
          variant="contained"
          onClick={handleConfirmSelection}
          startIcon={<CheckCircle />}
          sx={{
            mt: 2,
            bgcolor: '#4caf50',
            fontFamily: '"Courier New", monospace',
            fontSize: '0.8rem',
            textTransform: 'none',
            fontWeight: 700,
            py: 1.2,
            '&:hover': { bgcolor: '#388e3c' }
          }}
        >
          {t('variables.useThisPath')}
        </Button>
      )}
    </Box>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const ProjectVariablesManager = ({ 
  projectId, 
  disabled = false,
  variant = 'page'
}) => {
  const { t, i18n } = useTranslation('common')
  const currentLang = i18n.language?.startsWith('es') ? 'es' : 'en'
  
  const {
    variables,
    filteredVariables,
    loading,
    error,
    filterCategory,
    setFilterCategory,
    createVariable,
    updateVariable,
    deleteVariable,
    total,
    totalByCategory
  } = useProjectVariables(projectId, { enabled: !!projectId })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVariable, setEditingVariable] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    recorrido: '',
    categoria: 'Usuario'
  })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [formMode, setFormMode] = useState('builder')

  const categoriesWithCounts = useMemo(() => {
    return DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      count: cat.key === 'all' ? total : totalByCategory(cat.key)
    }))
  }, [total, totalByCategory])

  const handleOpenCreate = () => {
    setEditingVariable(null)
    setFormData({
      name: '',
      recorrido: '',
      categoria: filterCategory && filterCategory !== 'all' ? filterCategory : 'Usuario'
    })
    setFormError('')
    setFormMode('builder')
    setDialogOpen(true)
  }

  const handleOpenEdit = (variable) => {
    setEditingVariable(variable)
    setFormData({
      name: variable.name,
      recorrido: variable.recorrido,
      categoria: variable.categoria
    })
    setFormError('')
    setFormMode('builder')
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingVariable(null)
    setFormData({ name: '', recorrido: '', categoria: 'Usuario' })
    setFormError('')
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'name') {
      const validation = validateVariableName(value)
      if (!validation.valid && value.trim()) {
        setFormError(validation.error)
      } else {
        setFormError('')
      }
    }
  }

  const handlePathSelected = ({ recorrido, categoria }) => {
    setFormData(prev => ({ 
      ...prev, 
      recorrido,
      categoria 
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setFormError(t('variables.errorNameRequired'))
      return
    }

    const validation = validateVariableName(formData.name)
    if (!validation.valid) {
      setFormError(validation.error)
      return
    }

    if (!formData.recorrido.trim()) {
      setFormError(t('variables.errorPathRequired'))
      return
    }

    if (!formData.categoria) {
      setFormError(t('variables.errorCategoryRequired'))
      return
    }

    setSaving(true)
    setFormError('')

    try {
      if (editingVariable) {
        await updateVariable(editingVariable._id, formData)
      } else {
        await createVariable(formData)
      }
      handleCloseDialog()
    } catch (err) {
      setFormError(err.message || t('variables.errorSaving'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (variable) => {
    try {
      await deleteVariable(
        variable._id,
        t('variables.confirmDelete', { name: variable.name })
      )
    } catch (err) {
      console.error('Error deleting variable:', err)
    }
  }

  if (!projectId) {
    return (
      <Alert severity="info" sx={{ borderRadius: 0 }}>
        {t('variables.saveProjectFirst')}
      </Alert>
    )
  }

  const isDialog = variant === 'dialog'

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: `1px solid ${isDialog ? '#222' : '#e0e0e0'}`,
          bgcolor: isDialog ? '#fff' : '#fafafa'
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Code sx={{ fontSize: 20, color: isDialog ? '#111' : undefined }} />
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: isDialog ? '#111' : undefined,
                fontFamily: isDialog ? '"Poppins", sans-serif' : undefined
              }}
            >
              {t('variables.title')}
            </Typography>
            <Chip
              label={total}
              size="small"
              sx={{
                bgcolor: '#000',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.65rem'
              }}
            />
          </Box>

          {!disabled && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={handleOpenCreate}
              sx={{
                bgcolor: isDialog ? '#111' : undefined,
                borderRadius: isDialog ? 2 : 0,
                fontFamily: isDialog ? '"Poppins", sans-serif' : undefined,
                fontSize: '0.75rem',
                textTransform: 'none',
                '&:hover': { bgcolor: isDialog ? '#333' : undefined }
              }}
            >
              {t('variables.addNew')}
            </Button>
          )}
        </Box>

        {/* Descripción */}
        <Box
          sx={{
            p: 1.5,
            bgcolor: isDialog ? '#f5f5f5' : '#e3f2fd',
            borderRadius: 1,
            mb: 2,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1
          }}
        >
          <Info sx={{ fontSize: 16, color: '#1976d2', mt: 0.2 }} />
          <Typography
            variant="caption"
            sx={{
              color: isDialog ? '#555' : '#1976d2',
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              lineHeight: 1.5
            }}
          >
            {t('variables.description')}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
            {error}
          </Alert>
        )}

        {/* Tabs de categorías */}
        <Tabs
          value={filterCategory || 'all'}
          onChange={(_, v) => setFilterCategory(v === 'all' ? null : v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            borderBottom: `1px solid ${isDialog ? '#e0e0e0' : '#ececec'}`,
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 2,
              py: 1,
              textTransform: 'none',
              fontSize: '0.75rem'
            },
            '& .Mui-selected': { fontWeight: 700 }
          }}
        >
          {categoriesWithCounts.map(cat => (
            <Tab
              key={cat.key}
              value={cat.key}
              label={
                <CategoryTab
                  category={cat}
                  count={cat.count}
                  isSelected={(filterCategory || 'all') === cat.key}
                  t={t}
                />
              }
            />
          ))}
        </Tabs>

        {/* Lista de variables */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={6}>
            <CircularProgress size={32} />
          </Box>
        ) : filteredVariables.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
              border: `2px dashed ${isDialog ? '#e0e0e0' : '#ececec'}`,
              borderRadius: 2
            }}
          >
            <Code sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.85rem',
                color: '#888',
                mb: 2
              }}
            >
              {t('variables.empty')}
            </Typography>
            {!disabled && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleOpenCreate}
                sx={{
                  borderRadius: isDialog ? 2 : 0,
                  textTransform: 'none',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem'
                }}
              >
                {t('variables.createFirst')}
              </Button>
            )}
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {filteredVariables.map(variable => (
              <VariableRow
                key={variable._id}
                variable={variable}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                disabled={disabled}
                variant={variant}
                t={t}
              />
            ))}
          </Stack>
        )}
      </Paper>

      {/* DIÁLOGO CREAR/EDITAR */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isDialog ? 3 : 0,
            border: `1px solid ${isDialog ? '#222' : '#ececec'}`,
            minHeight: 600
          }
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${isDialog ? '#222' : '#ececec'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Code sx={{ fontSize: 20 }} />
          <Typography
            sx={{
              fontFamily: isDialog ? '"Poppins", sans-serif' : '"Courier New", monospace',
              fontSize: isDialog ? '1.1rem' : '0.85rem',
              fontWeight: 700,
              letterSpacing: isDialog ? 0 : '1px',
              textTransform: isDialog ? 'none' : 'uppercase'
            }}
          >
            {editingVariable ? t('variables.editTitle') : t('variables.createTitle')}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
              {formError}
            </Alert>
          )}

          <Stack spacing={2.5} sx={{ p: 3 }}>
            {/* Nombre */}
            <Box>
              <TextField
                label={`${t('variables.name')} *`}
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                fullWidth
                required
                placeholder="firstName"
                helperText={
                  formError 
                    ? formError 
                    : t('variables.nameHelper')
                }
                error={!!formError}
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }
                }}
              />
              {formData.name && !formError && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    display: 'inline-block'
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.8rem',
                      color: '#666'
                    }}
                  >
                    Preview: <strong>{`{{${formData.name}}}`}</strong>
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider />

            {/* PATH BUILDER */}
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: '#666'
                  }}
                >
                  {t('variables.path')} *
                </Typography>
                
                <Box display="flex" gap={0.5}>
                  <Chip
                    label={t('variables.modeBuilder')}
                    size="small"
                    onClick={() => setFormMode('builder')}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: formMode === 'builder' ? '#1976d2' : '#f5f5f5',
                      color: formMode === 'builder' ? '#fff' : '#666',
                      fontWeight: 700,
                      fontSize: '0.65rem'
                    }}
                  />
                  <Chip
                    label={t('variables.modeManual')}
                    size="small"
                    onClick={() => setFormMode('manual')}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: formMode === 'manual' ? '#1976d2' : '#f5f5f5',
                      color: formMode === 'manual' ? '#fff' : '#666',
                      fontWeight: 700,
                      fontSize: '0.65rem'
                    }}
                  />
                </Box>
              </Box>

              {formMode === 'builder' ? (
                <PathBuilder
                  projectId={projectId}
                  lang={currentLang}
                  onPathSelected={handlePathSelected}
                  initialRecorrido={formData.recorrido}
                  initialCategoria={formData.categoria}
                  isDialog={isDialog}
                />
              ) : (
                <TextField
                  value={formData.recorrido}
                  onChange={(e) => handleFormChange('recorrido', e.target.value)}
                  fullWidth
                  required
                  placeholder="user.firstName"
                  helperText={t('variables.pathHelper')}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.85rem'
                    }
                  }}
                />
              )}

              {formData.recorrido && (
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    border: '1px dashed #ccc'
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.75rem',
                      color: '#666',
                      mb: 0.5
                    }}
                  >
                    {t('variables.currentPath')}:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#000'
                    }}
                  >
                    {formData.recorrido}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Categoría (solo visible en modo manual) */}
            {formMode === 'manual' && (
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    mb: 1,
                    color: '#666'
                  }}
                >
                  {t('variables.category')} *
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {DEFAULT_CATEGORIES
                    .filter(c => c.key !== 'all')
                    .map(cat => {
                      const isSelected = formData.categoria === cat.key
                      return (
                        <Chip
                          key={cat.key}
                          label={t(cat.labelKey)}
                          onClick={() => handleFormChange('categoria', cat.key)}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: isSelected ? cat.color : `${cat.color}15`,
                            color: isSelected ? '#fff' : cat.color,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            border: `1px solid ${cat.color}`,
                            '&:hover': {
                              bgcolor: isSelected ? cat.color : `${cat.color}30`
                            }
                          }}
                        />
                      )
                    })}
                </Box>
              </Box>
            )}

            {/* Categoría actual (solo en modo builder) */}
            {formMode === 'builder' && formData.categoria && (
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.7rem',
                    color: '#666'
                  }}
                >
                  {t('variables.category')}:
                </Typography>
                <Chip
                  label={t(`variables.categories.${formData.categoria}`, formData.categoria)}
                  size="small"
                  sx={{
                    bgcolor: '#1976d2',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.7rem'
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: '#888', ml: 'auto', fontSize: '0.65rem' }}
                >
                  {t('variables.categoryAutoSet')}
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ borderTop: `1px solid ${isDialog ? '#222' : '#ececec'}`, p: 2 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={saving}
            startIcon={<Cancel />}
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              color: '#888',
              textTransform: 'none'
            }}
          >
            {t('variables.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving || !!formError}
            startIcon={saving ? <CircularProgress size={16} /> : <Save />}
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              textTransform: 'none',
              bgcolor: isDialog ? '#111' : undefined,
              borderRadius: isDialog ? 2 : 0,
              '&:hover': { bgcolor: isDialog ? '#333' : undefined }
            }}
          >
            {saving 
              ? t('variables.saving') 
              : editingVariable 
                ? t('variables.update') 
                : t('variables.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ProjectVariablesManager