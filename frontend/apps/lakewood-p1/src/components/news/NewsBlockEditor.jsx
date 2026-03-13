import { Box, TextField, IconButton, FormControl, Select, MenuItem } from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    fontFamily: '"Poppins", sans-serif',
    '& fieldset':                { borderColor: 'rgba(140, 165, 81, 0.3)', borderWidth: '2px' },
    '&:hover fieldset':          { borderColor: '#8CA551' },
    '&.Mui-focused fieldset':    { borderColor: '#333F1F', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': {
    fontFamily: '"Poppins", sans-serif', fontWeight: 500, color: '#706f6f',
    '&.Mui-focused': { color: '#333F1F', fontWeight: 600 }
  }
}

const selectSx = {
  borderRadius: 2,
  fontFamily: '"Poppins", sans-serif',
  '& fieldset':              { borderColor: 'rgba(140, 165, 81, 0.3)', borderWidth: '2px' },
  '&:hover fieldset':        { borderColor: '#8CA551' },
  '&.Mui-focused fieldset':  { borderColor: '#333F1F', borderWidth: '2px' },
}

const NewsBlockEditor = ({
  block,
  updateBlock,
  addListItem,
  updateListItem,
  deleteListItem,
}) => {
  const { t } = useTranslation(['news', 'common'])

  switch (block.type) {
    case 'heading':
      return (
        <Box display="flex" gap={2} mb={1}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={block.level}
              onChange={(e) => updateBlock(block.id, { level: e.target.value })}
              sx={selectSx}
            >
              <MenuItem value={2}>H2</MenuItem>
              <MenuItem value={3}>H3</MenuItem>
              <MenuItem value={4}>H4</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth size="small"
            placeholder={t('news:heading')}
            value={block.text}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            sx={inputSx}
          />
        </Box>
      )

    case 'paragraph':
      return (
        <TextField
          fullWidth multiline rows={3}
          placeholder={t('news:paragraph')}
          value={block.text}
          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
          sx={inputSx}
        />
      )

    case 'list':
      return (
        <Box>
          <FormControl size="small" sx={{ minWidth: 120, mb: 1 }}>
            <Select
              value={block.ordered ? 'ordered' : 'unordered'}
              onChange={(e) => updateBlock(block.id, { ordered: e.target.value === 'ordered' })}
              sx={selectSx}
            >
              <MenuItem value="unordered">• {t('news:list')}</MenuItem>
              <MenuItem value="ordered">1. {t('news:list')}</MenuItem>
            </Select>
          </FormControl>
          {block.items.map((item, idx) => (
            <Box key={idx} display="flex" gap={1} mb={1}>
              <TextField
                fullWidth size="small"
                placeholder={`${t('news:addItem')} ${idx + 1}...`}
                value={item}
                onChange={(e) => updateListItem(block.id, idx, e.target.value)}
                sx={inputSx}
              />
              <IconButton
                size="small" onClick={() => deleteListItem(block.id, idx)}
                sx={{ color: '#E5863C', '&:hover': { bgcolor: 'rgba(229, 134, 60, 0.08)' } }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <IconButton
            size="small"
            onClick={() => addListItem(block.id)}
            sx={{ color: '#8CA551', ml: 1 }}
          >
            <Add fontSize="small" />
          </IconButton>
        </Box>
      )

    case 'quote':
      return (
        <Box>
          <TextField
            fullWidth multiline rows={2}
            placeholder={t('news:quote')}
            value={block.text}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            sx={{ ...inputSx, mb: 1 }}
          />
          <TextField
            fullWidth size="small"
            placeholder={t('news:quoteAuthor', 'Author (optional)...')}
            value={block.author || ''}
            onChange={(e) => updateBlock(block.id, { author: e.target.value })}
            sx={inputSx}
          />
        </Box>
      )

    default:
      return null
  }
}

export default NewsBlockEditor