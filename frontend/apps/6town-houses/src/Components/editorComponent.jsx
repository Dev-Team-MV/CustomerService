// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/editorComponent.jsx

import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  Rule as RuleIcon
} from '@mui/icons-material'

const SixTownConfigEditor = ({ config, onChange }) => {
  const [expandedPanel, setExpandedPanel] = useState('inventory')

  // ============================================
  // FUNCIONES PARA INVENTORY
  // ============================================

  const handleUpdateInventory = (field, value) => {
    onChange({
      ...config,
      structure: {
        ...config.structure,
        inventory: {
          ...config.structure?.inventory,
          [field]: value
        }
      }
    })
  }

  const handleAddHouseId = (newId) => {
    if (!newId.trim()) return
    
    const currentIds = config.structure?.inventory?.houseIds || []
    if (currentIds.includes(newId.trim())) {
      alert('Este ID ya existe')
      return
    }
    
    handleUpdateInventory('houseIds', [...currentIds, newId.trim()])
  }

  const handleDeleteHouseId = (idToDelete) => {
    const currentIds = config.structure?.inventory?.houseIds || []
    handleUpdateInventory('houseIds', currentIds.filter(id => id !== idToDelete))
  }

  // ============================================
  // FUNCIONES PARA LEVELS
  // ============================================

  const handleAddLevel = () => {
    const levels = config.structure?.levels || {}
    const newLevelKey = `level${Object.keys(levels).length + 1}`
    
    onChange({
      ...config,
      structure: {
        ...config.structure,
        levels: {
          ...levels,
          [newLevelKey]: {
            label: '',
            selectionMode: 'single',
            options: []
          }
        }
      }
    })
  }

  const handleUpdateLevelKey = (oldKey, newKey) => {
    const levels = { ...config.structure?.levels }
    const levelData = levels[oldKey]
    delete levels[oldKey]
    levels[newKey] = levelData
    
    onChange({
      ...config,
      structure: {
        ...config.structure,
        levels
      }
    })
  }

  const handleUpdateLevel = (levelKey, field, value) => {
    const levels = config.structure?.levels || {}
    
    onChange({
      ...config,
      structure: {
        ...config.structure,
        levels: {
          ...levels,
          [levelKey]: {
            ...levels[levelKey],
            [field]: value
          }
        }
      }
    })
  }

  const handleDeleteLevel = (levelKey) => {
    const levels = { ...config.structure?.levels }
    delete levels[levelKey]
    
    onChange({
      ...config,
      structure: {
        ...config.structure,
        levels
      }
    })
  }

  const handleAddOption = (levelKey) => {
    const levels = config.structure?.levels || {}
    const level = levels[levelKey]
    
    onChange({
      ...config,
      structure: {
        ...config.structure,
        levels: {
          ...levels,
          [levelKey]: {
            ...level,
            options: [
              ...(level.options || []),
              {
                id: '',
                label: ''
              }
            ]
          }
        }
      }
    })
  }

  const handleUpdateOption = (levelKey, optionIndex, field, value) => {
    const levels = config.structure?.levels || {}
    const level = levels[levelKey]
    const updatedOptions = [...(level.options || [])]
    
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      [field]: value
    }
    
    onChange({
      ...config,
      structure: {
        ...config.structure,
        levels: {
          ...levels,
          [levelKey]: {
            ...level,
            options: updatedOptions
          }
        }
      }
    })
  }

  const handleDeleteOption = (levelKey, optionIndex) => {
    const levels = config.structure?.levels || {}
    const level = levels[levelKey]
    
    onChange({
      ...config,
      structure: {
        ...config.structure,
        levels: {
          ...levels,
          [levelKey]: {
            ...level,
            options: (level.options || []).filter((_, idx) => idx !== optionIndex)
          }
        }
      }
    })
  }

  // ============================================
  // FUNCIONES PARA DEPENDENCIES
  // ============================================

  const handleAddDependency = () => {
    const dependencies = config.structure?.dependencies || []
    
    onChange({
      ...config,
      structure: {
        ...config.structure,
        dependencies: [
          ...dependencies,
          {
            when: {},
            enableFlags: []
          }
        ]
      }
    })
  }

  const handleUpdateDependencyWhen = (depIndex, levelKey, optionId) => {
    const dependencies = [...(config.structure?.dependencies || [])]
    
    dependencies[depIndex] = {
      ...dependencies[depIndex],
      when: {
        ...dependencies[depIndex].when,
        [levelKey]: optionId
      }
    }
    
    onChange({
      ...config,
      structure: {
        ...config.structure,
        dependencies
      }
    })
  }

  const handleUpdateDependencyFlags = (depIndex, flagsString) => {
    const dependencies = [...(config.structure?.dependencies || [])]
    const flags = flagsString.split(',').map(f => f.trim()).filter(f => f)
    
    dependencies[depIndex] = {
      ...dependencies[depIndex],
      enableFlags: flags
    }
    
    onChange({
      ...config,
      structure: {
        ...config.structure,
        dependencies
      }
    })
  }

  const handleDeleteDependency = (depIndex) => {
    onChange({
      ...config,
      structure: {
        ...config.structure,
        dependencies: (config.structure?.dependencies || []).filter((_, idx) => idx !== depIndex)
      }
    })
  }

  // ============================================
  // FUNCIONES PARA ASSETS SCHEMA
  // ============================================

  const handleAddAssetDefault = () => {
    const defaults = config.assetsSchema?.defaultsByHouse || []
    onChange({
      ...config,
      assetsSchema: {
        ...config.assetsSchema,
        defaultsByHouse: [...defaults, '']
      }
    })
  }

  const handleUpdateAssetDefault = (index, value) => {
    const defaults = [...(config.assetsSchema?.defaultsByHouse || [])]
    defaults[index] = value
    onChange({
      ...config,
      assetsSchema: {
        ...config.assetsSchema,
        defaultsByHouse: defaults
      }
    })
  }

  const handleDeleteAssetDefault = (index) => {
    const defaults = (config.assetsSchema?.defaultsByHouse || []).filter((_, idx) => idx !== index)
    onChange({
      ...config,
      assetsSchema: {
        ...config.assetsSchema,
        defaultsByHouse: defaults
      }
    })
  }

  const handleUpdateAssetsByOption = (type, key, assetsString) => {
    const assets = assetsString.split(',').map(a => a.trim()).filter(a => a)
    
    onChange({
      ...config,
      assetsSchema: {
        ...config.assetsSchema,
        [type]: {
          ...(config.assetsSchema?.[type] || {}),
          [key]: assets
        }
      }
    })
  }

  const handleDeleteAssetsByOption = (type, key) => {
    const updated = { ...(config.assetsSchema?.[type] || {}) }
    delete updated[key]
    
    onChange({
      ...config,
      assetsSchema: {
        ...config.assetsSchema,
        [type]: updated
      }
    })
  }

  // ============================================
  // FUNCIONES PARA PRICING RULES
  // ============================================

  const handleAddRule = () => {
    const rules = config.pricingRules || []
    
    onChange({
      ...config,
      pricingRules: [
        ...rules,
        {
          id: `rule-${Date.now()}`,
          name: '',
          priority: rules.length * 10 + 10,
          enabled: true,
          when: [{ field: '', operator: 'truthy' }],
          apply: {
            type: 'fixed',
            amount: 0,
            code: '',
            label: ''
          }
        }
      ]
    })
  }

  const handleUpdateRule = (ruleIndex, field, value) => {
    const rules = [...(config.pricingRules || [])]
    
    rules[ruleIndex] = {
      ...rules[ruleIndex],
      [field]: value
    }
    
    onChange({
      ...config,
      pricingRules: rules
    })
  }

  const handleUpdateRuleApply = (ruleIndex, field, value) => {
    const rules = [...(config.pricingRules || [])]
    
    rules[ruleIndex] = {
      ...rules[ruleIndex],
      apply: {
        ...rules[ruleIndex].apply,
        [field]: value
      }
    }
    
    onChange({
      ...config,
      pricingRules: rules
    })
  }

  const handleAddRuleCondition = (ruleIndex) => {
    const rules = [...(config.pricingRules || [])]
    
    rules[ruleIndex] = {
      ...rules[ruleIndex],
      when: [
        ...(rules[ruleIndex].when || []),
        { field: '', operator: 'truthy' }
      ]
    }
    
    onChange({
      ...config,
      pricingRules: rules
    })
  }

  const handleUpdateRuleCondition = (ruleIndex, condIndex, field, value) => {
    const rules = [...(config.pricingRules || [])]
    const conditions = [...(rules[ruleIndex].when || [])]
    
    conditions[condIndex] = {
      ...conditions[condIndex],
      [field]: value
    }
    
    rules[ruleIndex] = {
      ...rules[ruleIndex],
      when: conditions
    }
    
    onChange({
      ...config,
      pricingRules: rules
    })
  }

  const handleDeleteRuleCondition = (ruleIndex, condIndex) => {
    const rules = [...(config.pricingRules || [])]
    
    rules[ruleIndex] = {
      ...rules[ruleIndex],
      when: (rules[ruleIndex].when || []).filter((_, idx) => idx !== condIndex)
    }
    
    onChange({
      ...config,
      pricingRules: rules
    })
  }

  const handleDeleteRule = (ruleIndex) => {
    onChange({
      ...config,
      pricingRules: (config.pricingRules || []).filter((_, idx) => idx !== ruleIndex)
    })
  }

  const levels = config.structure?.levels || {}
  const inventory = config.structure?.inventory || {}
  const dependencies = config.structure?.dependencies || []
  const assetsSchema = config.assetsSchema || {}
  const rules = config.pricingRules || []

  return (
    <Box>
      {/* SECCIÓN 0: CONFIGURACIÓN GENERAL */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0' }}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontFamily: '"Poppins", sans-serif' }}>
          Configuración General
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Catalog Type"
              value={config.catalogType || 'houses'}
              size="small"
              fullWidth
              disabled
              helperText="Tipo de catálogo (no editable)"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Status"
              value={config.status || 'draft'}
              size="small"
              fullWidth
              disabled
              helperText="Estado de la configuración"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* SECCIÓN 1: INVENTORY */}
      <Accordion 
        expanded={expandedPanel === 'inventory'} 
        onChange={() => setExpandedPanel(expandedPanel === 'inventory' ? '' : 'inventory')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <HomeIcon />
            <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
              Inventario de Casas
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Define cuántas casas hay en total y sus IDs únicos
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Total de Casas"
                  type="number"
                  value={inventory.totalHouses || 6}
                  onChange={(e) => handleUpdateInventory('totalHouses', Number(e.target.value))}
                  size="small"
                  fullWidth
                  helperText="Número total de casas disponibles"
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  label="Agregar ID de Casa"
                  size="small"
                  fullWidth
                  placeholder="Escribe un ID y presiona Enter"
                  helperText="Presiona Enter para agregar cada ID"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddHouseId(e.target.value)
                      e.target.value = ''
                    }
                  }}
                />
              </Grid>
            </Grid>

            {inventory.houseIds && inventory.houseIds.length > 0 && (
              <Box mt={3}>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Casas configuradas ({inventory.houseIds.length}):
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {inventory.houseIds.map(id => (
                    <Chip 
                      key={id} 
                      label={`Casa #${id}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      onDelete={() => handleDeleteHouseId(id)}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* SECCIÓN 2: LEVELS */}
      <Accordion 
        expanded={expandedPanel === 'levels'} 
        onChange={() => setExpandedPanel(expandedPanel === 'levels' ? '' : 'levels')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
            📐 Niveles / Pisos ({Object.keys(levels).length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {Object.entries(levels).map(([levelKey, level]) => (
              <Paper key={levelKey} elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" gap={2} flex={1}>
                    <TextField
                      label="Key del Nivel"
                      value={levelKey}
                      onChange={(e) => handleUpdateLevelKey(levelKey, e.target.value)}
                      size="small"
                      sx={{ width: 150 }}
                      helperText="level1, terrace"
                    />
                    <TextField
                      label="Nombre"
                      value={level.label || ''}
                      onChange={(e) => handleUpdateLevel(levelKey, 'label', e.target.value)}
                      size="small"
                      sx={{ flex: 1 }}
                      helperText="Piso 1, Terraza"
                    />
                    <FormControl size="small" sx={{ width: 150 }}>
                      <InputLabel>Modo Selección</InputLabel>
                      <Select
                        value={level.selectionMode || 'single'}
                        onChange={(e) => handleUpdateLevel(levelKey, 'selectionMode', e.target.value)}
                        label="Modo Selección"
                      >
                        <MenuItem value="single">Single</MenuItem>
                        <MenuItem value="multiple">Multiple</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <IconButton color="error" onClick={() => handleDeleteLevel(levelKey)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" fontWeight={600} mb={2} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  Opciones ({level.options?.length || 0})
                </Typography>

                {level.options?.map((option, idx) => (
                  <Grid container spacing={2} key={idx} sx={{ mb: 2, alignItems: 'center' }}>
                    <Grid item xs={5}>
                      <TextField
                        label="ID"
                        value={option.id || ''}
                        onChange={(e) => handleUpdateOption(levelKey, idx, 'id', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="parking, airbnb"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Label"
                        value={option.label || ''}
                        onChange={(e) => handleUpdateOption(levelKey, idx, 'label', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="Parqueadero, Airbnb"
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton color="error" onClick={() => handleDeleteOption(levelKey, idx)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}

                <Button
                  variant="text"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddOption(levelKey)}
                  sx={{ fontFamily: '"Poppins", sans-serif', textTransform: 'none', mt: 1 }}
                >
                  Agregar Opción
                </Button>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddLevel}
              fullWidth
              sx={{ fontFamily: '"Poppins", sans-serif', textTransform: 'none' }}
            >
              Agregar Nivel
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* SECCIÓN 3: DEPENDENCIES */}
      <Accordion 
        expanded={expandedPanel === 'dependencies'} 
        onChange={() => setExpandedPanel(expandedPanel === 'dependencies' ? '' : 'dependencies')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <RuleIcon />
            <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
              Dependencias ({dependencies.length})
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Define condiciones que habilitan flags cuando se seleccionan ciertas opciones
            </Alert>

            {dependencies.map((dep, idx) => (
              <Paper key={idx} elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    Dependencia #{idx + 1}
                  </Typography>
                  <IconButton color="error" onClick={() => handleDeleteDependency(idx)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  Cuando se cumplan estas condiciones:
                </Typography>

                <Grid container spacing={2} mb={2}>
                  {Object.entries(levels).map(([levelKey, level]) => (
                    <Grid item xs={6} key={levelKey}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>{level.label || levelKey}</InputLabel>
                        <Select
                          value={dep.when?.[levelKey] || ''}
                          onChange={(e) => handleUpdateDependencyWhen(idx, levelKey, e.target.value)}
                          label={level.label || levelKey}
                        >
                          <MenuItem value=""><em>Ninguna</em></MenuItem>
                          {level.options?.map(option => (
                            <MenuItem key={option.id} value={option.id}>{option.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  ))}
                </Grid>

                <TextField
                  label="Enable Flags (separados por coma)"
                  value={(dep.enableFlags || []).join(', ')}
                  onChange={(e) => handleUpdateDependencyFlags(idx, e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="multifunctional, premium"
                  helperText="Flags que se habilitan cuando se cumple la condición"
                />
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddDependency}
              fullWidth
              sx={{ fontFamily: '"Poppins", sans-serif', textTransform: 'none' }}
            >
              Agregar Dependencia
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* SECCIÓN 4: ASSETS SCHEMA */}
      <Accordion 
        expanded={expandedPanel === 'assets'} 
        onChange={() => setExpandedPanel(expandedPanel === 'assets' ? '' : 'assets')}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
            🖼️ Assets Schema
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Define qué assets (plans, renders, isometric) se requieren por defecto y por opción
            </Alert>

            {/* Defaults by House */}
            <Typography variant="subtitle1" fontWeight={600} mb={2} sx={{ fontFamily: '"Poppins", sans-serif' }}>
              Assets por Defecto (todas las casas)
            </Typography>

            {assetsSchema.defaultsByHouse?.map((asset, idx) => (
              <Grid container spacing={2} key={idx} sx={{ mb: 2, alignItems: 'center' }}>
                <Grid item xs={11}>
                  <TextField
                    label={`Asset ${idx + 1}`}
                    value={asset}
                    onChange={(e) => handleUpdateAssetDefault(idx, e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="plans, isometric, renders"
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton color="error" onClick={() => handleDeleteAssetDefault(idx)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              variant="text"
              startIcon={<AddIcon />}
              onClick={handleAddAssetDefault}
              sx={{ fontFamily: '"Poppins", sans-serif', textTransform: 'none', mb: 3 }}
            >
              Agregar Asset Default
            </Button>

            <Divider sx={{ my: 3 }} />

            {/* Required by Level Option */}
            <Typography variant="subtitle1" fontWeight={600} mb={2} sx={{ fontFamily: '"Poppins", sans-serif' }}>
              Assets Requeridos por Opción
            </Typography>

            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Formato: levelKey.optionId (ej: level1.parking)
            </Typography>

            {Object.entries(assetsSchema.requiredByLevelOption || {}).map(([key, assets]) => (
              <Grid container spacing={2} key={key} sx={{ mb: 2, alignItems: 'center' }}>
                <Grid item xs={5}>
                  <TextField
                    label="Level.Option"
                    value={key}
                    size="small"
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Assets (separados por coma)"
                    value={assets.join(', ')}
                    onChange={(e) => handleUpdateAssetsByOption('requiredByLevelOption', key, e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="plans, renders"
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton color="error" onClick={() => handleDeleteAssetsByOption('requiredByLevelOption', key)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Divider sx={{ my: 3 }} />

            {/* Optional by Level Option */}
            <Typography variant="subtitle1" fontWeight={600} mb={2} sx={{ fontFamily: '"Poppins", sans-serif' }}>
              Assets Opcionales por Opción
            </Typography>

            {Object.entries(assetsSchema.optionalByLevelOption || {}).map(([key, assets]) => (
              <Grid container spacing={2} key={key} sx={{ mb: 2, alignItems: 'center' }}>
                <Grid item xs={5}>
                  <TextField
                    label="Level.Option"
                    value={key}
                    size="small"
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Assets (separados por coma)"
                    value={assets.join(', ')}
                    onChange={(e) => handleUpdateAssetsByOption('optionalByLevelOption', key, e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="isometric"
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton color="error" onClick={() => handleDeleteAssetsByOption('optionalByLevelOption', key)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* SECCIÓN 5: PRICING RULES */}
      <Accordion 
        expanded={expandedPanel === 'rules'} 
        onChange={() => setExpandedPanel(expandedPanel === 'rules' ? '' : 'rules')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
            💰 Reglas de Precio ({rules.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Define reglas con condiciones (when) y ajustes de precio (apply)
            </Alert>

            {rules.map((rule, idx) => (
              <Paper key={idx} elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {rule.name || `Regla #${idx + 1}`}
                  </Typography>
                  <Box display="flex" gap={1} alignItems="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rule.enabled !== false}
                          onChange={(e) => handleUpdateRule(idx, 'enabled', e.target.checked)}
                          size="small"
                        />
                      }
                      label="Activa"
                    />
                    <IconButton color="error" onClick={() => handleDeleteRule(idx)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Grid container spacing={2} mb={3}>
                  <Grid item xs={4}>
                    <TextField
                      label="ID"
                      value={rule.id || ''}
                      onChange={(e) => handleUpdateRule(idx, 'id', e.target.value)}
                      size="small"
                      fullWidth
                      placeholder="level1-upgrade"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Nombre"
                      value={rule.name || ''}
                      onChange={(e) => handleUpdateRule(idx, 'name', e.target.value)}
                      size="small"
                      fullWidth
                      placeholder="Upgrade primer piso"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Prioridad"
                      type="number"
                      value={rule.priority || 0}
                      onChange={(e) => handleUpdateRule(idx, 'priority', Number(e.target.value))}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" fontWeight={600} mb={2} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  Condiciones (when)
                </Typography>

                {rule.when?.map((condition, condIdx) => (
                  <Grid container spacing={2} key={condIdx} sx={{ mb: 2, alignItems: 'center' }}>
                    <Grid item xs={5}>
                      <TextField
                        label="Field"
                        value={condition.field || ''}
                        onChange={(e) => handleUpdateRuleCondition(idx, condIdx, 'field', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="selectedOptions.level1Upgrade"
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Operator</InputLabel>
                        <Select
                          value={condition.operator || 'truthy'}
                          onChange={(e) => handleUpdateRuleCondition(idx, condIdx, 'operator', e.target.value)}
                          label="Operator"
                        >
                          <MenuItem value="truthy">truthy</MenuItem>
                          <MenuItem value="equals">equals</MenuItem>
                          <MenuItem value="gt">greater than</MenuItem>
                          <MenuItem value="lt">less than</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton color="error" onClick={() => handleDeleteRuleCondition(idx, condIdx)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}

                <Button
                  variant="text"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddRuleCondition(idx)}
                  size="small"
                  sx={{ fontFamily: '"Poppins", sans-serif', textTransform: 'none', mb: 2 }}
                >
                  Agregar Condición
                </Button>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" fontWeight={600} mb={2} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  Aplicar (apply)
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={rule.apply?.type || 'fixed'}
                        onChange={(e) => handleUpdateRuleApply(idx, 'type', e.target.value)}
                        label="Type"
                      >
                        <MenuItem value="fixed">Fixed</MenuItem>
                        <MenuItem value="percent">Percent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Amount"
                      type="number"
                      value={rule.apply?.amount || 0}
                      onChange={(e) => handleUpdateRuleApply(idx, 'amount', Number(e.target.value))}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Code"
                      value={rule.apply?.code || ''}
                      onChange={(e) => handleUpdateRuleApply(idx, 'code', e.target.value)}
                      size="small"
                      fullWidth
                      placeholder="level1-upgrade"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      label="Label"
                      value={rule.apply?.label || ''}
                      onChange={(e) => handleUpdateRuleApply(idx, 'label', e.target.value)}
                      size="small"
                      fullWidth
                      placeholder="Upgrade primer piso"
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddRule}
              fullWidth
              sx={{ fontFamily: '"Poppins", sans-serif', textTransform: 'none' }}
            >
              Agregar Regla de Precio
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default SixTownConfigEditor