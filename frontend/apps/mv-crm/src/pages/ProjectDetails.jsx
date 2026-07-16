// apps/mv-crm/src/pages/ProjectDetails.jsx
import { useState } from 'react'
import { Box, Typography, Chip, Grid, Paper, Divider, Stack, Button, Skeleton, Tabs, Tab } from '@mui/material'
import { 
  LocationOn, CropSquare, ArrowBack, Image, CalendarToday, Tag, 
  CheckCircleOutline, LinkOutlined, Palette, PhotoCamera, Description 
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import { useTranslation } from 'react-i18next'
import { useProjects } from '@shared/hooks/useProjects'
import ProjectDocuments from '../components/documents/ProjectDocuments' // ✅ NUEVO: Importar componente de documentos

function normalizeLangField(field) {
  if (typeof field === 'object' && field !== null && field._id) return { en: '', es: '' }
  if (typeof field === 'object' && field !== null && ('en' in field || 'es' in field)) return { en: field.en || '', es: field.es || '' }
  if (typeof field === 'string') return { en: field, es: field }
  return { en: '', es: '' }
}

// ✅ NUEVO: Helper para manejar el contenido de las pestañas
function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ mt: value === index ? 0 : 0 }}>
      {value === index && children}
    </Box>
  )
}

const StatBadge = ({ icon, label, value }) => (
  <Box sx={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    px: 2.5, py: 1.5, borderRadius: 2, border: '1px solid #e8ede8', bgcolor: '#fff',
    minWidth: 90, gap: 0.5,
  }}>
    <Box sx={{ color: '#4a7c59', display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Typography sx={{ fontSize: '0.65rem', color: '#aaa', fontFamily: '"Courier New", monospace', letterSpacing: 1, textTransform: 'uppercase' }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0a0a0a', fontFamily: '"Helvetica Neue", sans-serif' }}>
      {value || '—'}
    </Typography>
  </Box>
)

const BrandColorBox = ({ color }) => (
  <Box
    sx={{
      width: 100,
      height: 100,
      borderRadius: 2,
      bgcolor: color.value,
      border: '2px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0.5,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }
    }}
  >
    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 700, color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.6)', letterSpacing: 1, textTransform: 'uppercase' }}>
      {color.key}
    </Typography>
    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.6)', letterSpacing: 0.5 }}>
      {color.value}
    </Typography>
    <Box
      onClick={() => navigator.clipboard.writeText(color.value)}
      sx={{
        position: 'absolute', bottom: 4, right: 4, width: 20, height: 20, borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' }
      }}
    >
      <CropSquare sx={{ fontSize: 10, color: '#fff' }} />
    </Box>
  </Box>
)

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' }
]

export default function ProjectDetails() {
  const { t } = useTranslation('project')
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedImg, setSelectedImg] = useState(null)
  const [lang, setLang] = useState('en')
  const [activeTab, setActiveTab] = useState(0) // ✅ NUEVO: Estado para las pestañas principales

  const { projects, loading } = useProjects()
  const project = projects.find(p => p._id === id)

  if (loading) return (
    <PageLayout title={t('details.title')}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}><Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} /></Grid>
          <Grid item xs={12} md={5}><Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} /></Grid>
        </Grid>
      </Box>
    </PageLayout>
  )

  if (!project) return (
    <PageLayout title={t('details.title')}>
      <Box sx={{ py: 8, textAlign: 'center', color: '#aaa' }}>
        <Image sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
        <Typography variant="h6" sx={{ fontFamily: '"Helvetica Neue", sans-serif', color: '#bbb' }}>
          {t('details.notFound')}
        </Typography>
        <Button variant="outlined" sx={{ mt: 3, borderRadius: 0, borderColor: '#000', color: '#000', fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: 2, textTransform: 'uppercase' }} onClick={() => navigate(-1)}>
          <ArrowBack sx={{ mr: 1, fontSize: 16 }} /> {t('details.back')}
        </Button>
      </Box>
    </PageLayout>
  )

  const title = normalizeLangField(project.title)
  const subtitle = normalizeLangField(project.subtitle)
  const description = normalizeLangField(project.description)
  const fullDescription = normalizeLangField(project.fullDescription)
  const features = project.features || { en: [], es: [] }
  const gallery = Array.isArray(project.gallery) ? project.gallery : []
  const mainImage = project.image || ''
  const logo = project.logo || ''
  const brandColors = Array.isArray(project.brandColors) ? project.brandColors : []
  const videos = Array.isArray(project.videos) ? project.videos : []

  const allImages = [...new Set([...(mainImage ? [mainImage] : []), ...gallery])]
  const activeImg = selectedImg || allImages[0] || null

  return (
    <PageLayout
      title={project.name}
      subtitle={subtitle[lang] || project.slug}
      topbarLabel={t('details.topbar')}
      actionButton={{ label: t('details.back'), icon: <ArrowBack />, onClick: () => navigate(-1), variant: 'outlined' }}
    >
      {/* ── HERO ── */}
      <Box sx={{
        position: 'relative', width: '100%', height: { xs: 200, sm: 300, md: 380 },
        borderRadius: 3, overflow: 'hidden', mb: 4, bgcolor: '#f0f2f0', border: '1px solid #e0e0e0', flexShrink: 0,
      }}>
        {mainImage ? (
          <Box component="img" src={mainImage} alt={project.name} sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
        ) : (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image sx={{ fontSize: 80, color: '#d0d8d0' }} />
          </Box>
        )}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
          p: { xs: 2, md: 4 }, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {logo && (
              <Box component="img" src={logo} alt={`${project.name} logo`} sx={{ width: 60, height: 60, objectFit: 'contain', bgcolor: 'rgba(255,255,255,0.95)', borderRadius: 2, p: 0.5, border: '2px solid rgba(255,255,255,0.3)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }} />
            )}
            <Box>
              <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: { xs: '1.5rem', md: '2.2rem' }, fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                {title[lang] || project.name}
              </Typography>
              <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', mt: 0.5 }}>
                {subtitle[lang] || project.slug}
              </Typography>
            </Box>
          </Box>
          <Chip label={project.status?.toUpperCase()} sx={{ bgcolor: project.isActive ? '#4a7c59' : '#888', color: '#fff', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', letterSpacing: 2, fontWeight: 700, borderRadius: 1 }} />
        </Box>
      </Box>

      {/* ✅ NUEVO: Tabs Principales (Información / Documentos) */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            '& .MuiTab-root': {
              fontFamily: '"Courier New", monospace', fontSize: '0.75rem', letterSpacing: 1.5,
              textTransform: 'uppercase', fontWeight: 600, color: '#aaa', minWidth: 120,
            },
            '& .Mui-selected': { color: '#4a7c59 !important' },
            '& .MuiTabs-indicator': { bgcolor: '#4a7c59', height: 3 }
          }}
        >
          <Tab icon={<PhotoCamera sx={{ mr: 1, fontSize: 18 }} />} iconPosition="start" label={t('tabs.info', 'Información')} />
          <Tab icon={<Description sx={{ mr: 1, fontSize: 18 }} />} iconPosition="start" label={t('tabs.documents', 'Documentos')} />
        </Tabs>
      </Box>

      {/* ── TAB 0: INFORMACIÓN DEL PROYECTO ── */}
      <TabPanel value={activeTab} index={0}>
        {/* Lang Tabs (solo visible en la pestaña de información) */}
        <Box sx={{ mb: 3 }}>
          <Tabs value={lang} onChange={(_, v) => setLang(v)} sx={{ borderBottom: '1px solid #ececec', '& .MuiTab-root': { fontFamily: '"Courier New", monospace', fontSize: '0.72rem', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600, color: '#aaa', minWidth: 100 }, '& .Mui-selected': { color: '#4a7c59 !important' }, '& .MuiTabs-indicator': { bgcolor: '#4a7c59', height: 2 } }}>
            {LANGS.map(l => <Tab key={l.code} value={l.code} label={l.label} />)}
          </Tabs>
        </Box>

        <Grid container spacing={4}>
          {/* ── LEFT ── */}
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <StatBadge icon={<CropSquare fontSize="small" />} label={t('details.phase')} value={project.phase} />
                <StatBadge icon={<LocationOn fontSize="small" />} label={t('details.location')} value={project.location} />
                <StatBadge icon={<CropSquare fontSize="small" />} label={t('details.area')} value={project.area} />
                <StatBadge icon={<Tag fontSize="small" />} label={t('details.type')} value={project.type?.replace('_', ' ')} />
                <StatBadge icon={<CalendarToday fontSize="small" />} label={t('details.createdAt')} value={new Date(project.createdAt).toLocaleDateString()} />
              </Box>

              {(logo || brandColors.length > 0) && (
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: 2, color: '#4a7c59', textTransform: 'uppercase', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Palette fontSize="small" /> {t('details.branding', 'Branding')}
                  </Typography>
                  <Grid container spacing={3}>
                    {logo && (
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 2, borderRadius: 2, border: '1px solid #e8ede8', bgcolor: '#fafcf9', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Box component="img" src={logo} alt={`${project.name} logo`} sx={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain' }} />
                          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#aaa', letterSpacing: 1, textTransform: 'uppercase' }}>{t('details.logo', 'Logo')}</Typography>
                        </Box>
                      </Grid>
                    )}
                    {brandColors.length > 0 && (
                      <Grid item xs={12} sm={logo ? 8 : 12}>
                        <Box sx={{ p: 2, borderRadius: 2, border: '1px solid #e8ede8', bgcolor: '#fafcf9', height: '100%' }}>
                          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#aaa', letterSpacing: 1, textTransform: 'uppercase', mb: 1.5 }}>{t('details.brandColors', 'Brand Colors')} ({brandColors.length})</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                            {brandColors.map((color, idx) => <BrandColorBox key={idx} color={color} />)}
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              )}

              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: 2, color: '#4a7c59', textTransform: 'uppercase', mb: 1.5 }}>{t('details.description')}</Typography>
                <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.95rem', color: '#222', lineHeight: 1.7, mb: 2 }}>
                  {description[lang] || <span style={{ color: '#ccc' }}>—</span>}
                </Typography>
                {fullDescription[lang] && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', color: '#666', lineHeight: 1.7 }}>
                      {fullDescription[lang]}
                    </Typography>
                  </>
                )}
              </Paper>

              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: 2, color: '#4a7c59', textTransform: 'uppercase', mb: 2 }}>{t('details.features')}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {features[lang]?.length ? features[lang].map((f, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, px: 2, py: 0.8, borderRadius: 2, bgcolor: '#f0f4f0', border: '1px solid #dce8dc' }}>
                      <CheckCircleOutline sx={{ fontSize: 14, color: '#4a7c59' }} />
                      <Typography sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#333F1F' }}>{f}</Typography>
                    </Box>
                  )) : <Typography sx={{ color: '#ccc', fontFamily: '"Courier New", monospace', fontSize: '0.8rem' }}>{t('details.noFeatures')}</Typography>}
                </Box>
              </Paper>

              {project.externalUrl && (
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e0e0e0', bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinkOutlined sx={{ color: '#4a7c59' }} />
                  <Box>
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: 2, color: '#aaa', textTransform: 'uppercase' }}>{t('details.externalUrl')}</Typography>
                    <Typography component="a" href={project.externalUrl} target="_blank" rel="noopener noreferrer" sx={{ fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.85rem', color: '#4a7c59', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      {project.externalUrl}
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Stack>
          </Grid>

          {/* ── RIGHT: MEDIA ── */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', bgcolor: '#fafcf9' }}>
                <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: 2, color: '#4a7c59', textTransform: 'uppercase', mb: 2 }}>{t('details.gallery')}</Typography>
                <Box sx={{ width: '100%', height: 220, borderRadius: 2, overflow: 'hidden', border: '1.5px solid #e0e8e0', bgcolor: '#f0f4f0', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {activeImg ? (
                    <Box component="img" src={activeImg} alt="selected" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : <Image sx={{ fontSize: 56, color: '#d0d8d0' }} />}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {allImages.map((url, idx) => (
                    <Box key={idx} onClick={() => setSelectedImg(url)} sx={{ width: 60, height: 60, borderRadius: 1.5, overflow: 'hidden', flexShrink: 0, border: activeImg === url ? '2px solid #4a7c59' : '1.5px solid #e0e8e0', cursor: 'pointer', transition: 'border 0.15s', '&:hover': { border: '2px solid #4a7c59' } }}>
                      <Box component="img" src={url} alt={`thumb-${idx}`} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </Box>
                  ))}
                  {allImages.length === 0 && <Typography sx={{ color: '#ccc', fontFamily: '"Courier New", monospace', fontSize: '0.8rem' }}>{t('details.noGallery')}</Typography>}
                </Box>
              </Paper>

              {videos.length > 0 && (
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', bgcolor: '#fafcf9' }}>
                  <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: 2, color: '#4a7c59', textTransform: 'uppercase', mb: 2 }}>{t('details.videos')}</Typography>
                  <Stack spacing={2}>
                    {videos.map((v, idx) => (
                      <Box key={idx} sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', border: '1.5px solid #e0e8e0', bgcolor: '#000' }}>
                        <video src={v} controls style={{ width: '100%', display: 'block', maxHeight: 200 }} />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}

              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', bgcolor: '#fff' }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: 1.5, color: '#aaa', textTransform: 'uppercase' }}>{t('details.slug')}</Typography>
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', color: '#555' }}>{project.slug}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: 1.5, color: '#aaa', textTransform: 'uppercase' }}>{t('details.updatedAt')}</Typography>
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.78rem', color: '#555' }}>{new Date(project.updatedAt).toLocaleDateString()}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: 1.5, color: '#aaa', textTransform: 'uppercase' }}>ID</Typography>
                    <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#bbb', wordBreak: 'break-all' }}>{project._id}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ✅ NUEVO: TAB 1: DOCUMENTOS DEL PROYECTO */}
      <TabPanel value={activeTab} index={1}>
        <ProjectDocuments projectId={project._id} projectName={project.name} />
      </TabPanel>

    </PageLayout>
  )
}