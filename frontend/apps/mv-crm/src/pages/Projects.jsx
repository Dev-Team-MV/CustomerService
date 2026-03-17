import { useState } from 'react'
import { Box, Typography, TextField, InputAdornment, Button } from '@mui/material'
import { Search } from '@mui/icons-material'
import { motion } from 'framer-motion'
import DataTable from '@shared/components/table/DataTable'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'
import StatsStrip from '@shared/components/LayoutComponents/StatsStrip'
import CreateProjectDialog from '../components/CreateProjectDialog'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import ProjectStatsModal from '../components/stats/ProjectStatsModal'
import { useProjects } from '@shared/hooks/useProjects'
import { useProjectColumns } from '../constants/Columns/projects'
import useModalState from '@shared/hooks/useModalState'

export default function Projects() {
  const { t } = useTranslation('project')
  const navigate = useNavigate()
  const [statsOpen, setStatsOpen] = useState(false)
  const [statsProject, setStatsProject] = useState(null)

  const {
    projects,
    filtered,
    loading,
    search,
    setSearch,
    allBalance,
    handleProjectCreated,
    handleDelete,
  } = useProjects()

  // Modal state for create/edit project
  const projectModal = useModalState()

  const openStats = (project) => {
    setStatsProject(project)
    setStatsOpen(true)
  }

  const columns = useProjectColumns({
    t,
    navigate,
    openStats,
    setEditProject: projectModal.openModal, // Para editar
    setCreateOpen: () => projectModal.openModal(), // Para crear
    handleDelete,
  })

  return (
    <PageLayout
      title={t('title')}
      titleBold={t('titleBold')}
      topbarLabel={t('topbarLabel')}
      subtitle={t('subtitle', { count: projects.length })}
    >
      {/* Quick Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => projectModal.openModal()}
        >
          + {t('table.create')}
        </Button>
      </Box>
      <CreateProjectDialog
        open={projectModal.open}
        onClose={projectModal.closeModal}
        onCreated={handleProjectCreated}
        initialData={projectModal.data}
        editMode={!!projectModal.data}
      />

      {/* Stats */}
      <StatsStrip stats={[
        { label: t('stats.total'), value: projects.length },
        { label: t('stats.active'), value: projects.filter(p => p.isActive).length },
        { label: t('stats.types'), value: [...new Set(projects.map(p => p.type))].length }
      ]} />

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            size="small"
            sx={{
              width: 320,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0, background: '#fff',
                fontFamily: '"Helvetica Neue", sans-serif', fontSize: '0.875rem',
                '& fieldset': { borderColor: '#ddd' },
                '&:hover fieldset': { borderColor: '#000' },
                '&.Mui-focused fieldset': { borderColor: '#000', borderWidth: 2 }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: '#bbb' }} />
                </InputAdornment>
              )
            }}
          />
          {search && (
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#aaa', letterSpacing: '1.5px' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          rowKey="_id"
          sx={{
            background: '#fff', border: '1px solid #e8e8e8', borderRadius: 0,
            '& .MuiTableHead-root': { background: '#0a0a0a' },
            '& .MuiTableHead-root .MuiTableCell-root': { fontFamily: '"Courier New", monospace', fontSize: '0.58rem', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.08)', py: 1.8, fontWeight: 400 },
            '& .MuiTableBody-root .MuiTableRow-root': { transition: 'background 0.15s ease', cursor: 'pointer', '&:hover': { background: '#f7f7f7' } },
            '& .MuiTableBody-root .MuiTableCell-root': { borderBottom: '1px solid #f2f2f2', py: 1.6 },
            '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': { background: '#fdfdfd' },
            '& .MuiTablePagination-root': { fontFamily: '"Courier New", monospace', fontSize: '0.65rem', color: '#aaa', borderTop: '1px solid #ececec', background: '#fafafa' },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: '0.5px', color: '#aaa' },
            '& .MuiTablePagination-actions .MuiIconButton-root': { color: '#aaa', borderRadius: 0, '&:hover': { background: '#f0f0f0', color: '#000' } }
          }}
        />
      </motion.div>

      {/* Stats Modal */}
      <ProjectStatsModal
        open={statsOpen}
        onClose={() => { setStatsOpen(false); setStatsProject(null) }}
        project={statsProject}
        allBalance={allBalance}
      />
    </PageLayout>
  )
}