// apps/mv-crm/src/components/campaigns/steps/Step1Configuration.jsx
import { useTranslation } from 'react-i18next'
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Typography
} from '@mui/material'
import ProjectSelector from '@shared/components/ProjectSelector' // ✅ Importado

const Step1Configuration = ({
  formData,
  onChange,
  onAudienceChange,
  projects,
  stages
}) => {
  const { t } = useTranslation('campaign')

  const handleChange = (field, value) => {
    onChange(field, value)
  }

  const handleAudienceChange = (field, value) => {
    onAudienceChange(field, value)
  }

  // ✅ Estilos unificados para Menus
  const menuItemSx = {
    fontFamily: '"Courier New", monospace',
    fontSize: '0.75rem',
    borderRadius: 0,
    '&:hover': { bgcolor: '#f5f5f5' }
  }

  const inputSx = {
    '& .MuiInputBase-input': { fontFamily: '"Courier New", monospace', fontSize: '0.75rem' },
    '& .MuiOutlinedInput-root': { borderRadius: 0 },
    '& .MuiInputLabel-root': { fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }
  }

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>
      <TextField
        label={`${t('form.name')} *`}
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        fullWidth
        required
        sx={inputSx}
      />

      <Divider sx={{ my: 1 }} />

      <Typography
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.7rem',
          color: '#888',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}
      >
        {t('form.audience')}
      </Typography>

      <FormControl size="small" fullWidth required>
        <InputLabel>{t('form.audienceType')} *</InputLabel>
        <Select
          value={formData.audience.type}
          onChange={(e) => handleAudienceChange('type', e.target.value)}
          label={t('form.audienceType')}
          sx={{ ...inputSx, width: '100%' }}
        >
          <MenuItem value="leads" sx={menuItemSx}>{t('audience.leads')}</MenuItem>
          <MenuItem value="clients" sx={menuItemSx}>{t('audience.clients')}</MenuItem>
        </Select>
      </FormControl>

      {/* ✅ ProjectSelector Integrado */}
      <ProjectSelector
        value={formData.audience.projectId}
        onChange={(value) => handleAudienceChange('projectId', value)}
        label={t('form.project')}
        includeGlobal={true}
        globalLabel={t('allProjects', 'Todos los proyectos')}
        fullWidth
        size="small"
      />

      {formData.audience.type === 'leads' && (
        <FormControl size="small" fullWidth>
          <InputLabel>{t('form.stage')}</InputLabel>
          <Select
            value={formData.audience.stage}
            onChange={(e) => handleAudienceChange('stage', e.target.value)}
            label={t('form.stage')}
            sx={{ ...inputSx, width: '100%' }}
          >
            <MenuItem value="" sx={menuItemSx}><em>{t('allStages')}</em></MenuItem>
            {stages.map(stage => (
              <MenuItem key={stage.key} value={stage.key} sx={menuItemSx}>
                {stage.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  )
}

export default Step1Configuration