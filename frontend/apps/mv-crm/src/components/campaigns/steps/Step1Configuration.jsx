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

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>
      <TextField
        label={`${t('form.name')} *`}
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        fullWidth
        required
        sx={{
          '& .MuiInputBase-input': {
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem'
          }
        }}
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
        <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
          {t('form.audienceType')} *
        </InputLabel>
        <Select
          value={formData.audience.type}
          onChange={(e) => handleAudienceChange('type', e.target.value)}
          label={t('form.audienceType')}
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            borderRadius: 0
          }}
        >
          <MenuItem value="leads">{t('audience.leads')}</MenuItem>
          <MenuItem value="clients">{t('audience.clients')}</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
          {t('form.project')}
        </InputLabel>
        <Select
          value={formData.audience.projectId}
          onChange={(e) => handleAudienceChange('projectId', e.target.value)}
          label={t('form.project')}
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            borderRadius: 0
          }}
        >
          <MenuItem value="">
            <em>{t('allProjects')}</em>
          </MenuItem>
          {projects.map(project => (
            <MenuItem key={project._id} value={project._id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {formData.audience.type === 'leads' && (
        <FormControl size="small" fullWidth>
          <InputLabel sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem' }}>
            {t('form.stage')}
          </InputLabel>
          <Select
            value={formData.audience.stage}
            onChange={(e) => handleAudienceChange('stage', e.target.value)}
            label={t('form.stage')}
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.75rem',
              borderRadius: 0
            }}
          >
            <MenuItem value="">
              <em>{t('allStages')}</em>
            </MenuItem>
            {stages.map(stage => (
              <MenuItem key={stage.key} value={stage.key}>
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