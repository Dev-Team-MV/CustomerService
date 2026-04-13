// @shared/components/News/NewsTable.jsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box, Container, Typography,
  Button, Alert, Snackbar
} from '@mui/material'
import {
  Add, Article, Newspaper,
  Schedule, CheckCircle, Announcement, Warning
} from '@mui/icons-material'
import PropTypes from 'prop-types'

import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/table/DataTable'
import EmptyState from '@shared/components/table/EmptyState'
import NewsModal from './NewsModal'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'

import { useNews } from '@shared/hooks/useNews'

const NewsTable = ({ config }) => {
  const { t } = useTranslation([config.i18n.namespace, 'common'])

  // Hook with all the logic (with project filtering)
  const {
    news, stats, loading, columns,
    modalOpen, editingNews,
    handleCreateNew, handleCloseModal, handleSubmit,
    deleteDialogOpen, selectedNews,
    handleDeleteCancel, handleDeleteConfirm,
    snackbar, handleCloseSnackbar
  } = useNews(config)

  // Stats cards
  const newsStats = useMemo(() => [
    { 
      title: t('news:totalArticles'), 
      value: stats.total, 
      icon: Article, 
      gradient: `linear-gradient(135deg, ${config.colors.primary} 0%, #4a5d3a 100%)`, 
      color: config.colors.primary, 
      delay: 0 
    },
    { 
      title: t('news:published'), 
      value: stats.published, 
      icon: CheckCircle, 
      gradient: `linear-gradient(135deg, ${config.colors.secondary} 0%, #a8bf6f 100%)`, 
      color: config.colors.secondary, 
      delay: 0.1 
    },
    { 
      title: t('news:drafts'), 
      value: stats.draft, 
      icon: Schedule, 
      gradient: `linear-gradient(135deg, ${config.colors.accent} 0%, #f59c5a 100%)`, 
      color: config.colors.accent, 
      delay: 0.2 
    },
    { 
      title: t('news:construction'), 
      value: stats.construction, 
      icon: Announcement, 
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', 
      color: '#1976d2', 
      delay: 0.3 
    }
  ], [stats, t, config])

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', 
      p: { xs: 2, sm: 3 } 
    }}>
      <Container maxWidth="xl">
        <PageHeader
          icon={Newspaper}
          title={t('news:newsAndUpdates')}
          subtitle={t('news:manageUpdates')}
          actionButton={{
            label: t('news:createNews'),
            onClick: handleCreateNew,
            icon: <Add />,
            tooltip: t('news:createNews')
          }}
        />

        {/* Stats Cards */}
        <Box sx={{ mb: 4 }}>
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 3
            }}
          >
            {newsStats.map((stat, index) => (
              <Box
                key={index}
                sx={{
                  background: stat.gradient,
                  borderRadius: 4,
                  p: 3,
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: `0 8px 24px ${stat.color}26`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 32px ${stat.color}33`
                  }
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <stat.icon sx={{ fontSize: 40, opacity: 0.9 }} />
                  <Typography 
                    variant="h3" 
                    fontWeight={800}
                    sx={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    {loading ? '...' : stat.value}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  fontWeight={600}
                  sx={{ 
                    fontFamily: '"Poppins", sans-serif',
                    opacity: 0.95
                  }}
                >
                  {stat.title}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <DataTable
          columns={columns}
          data={news}
          loading={loading}
          emptyState={
            <EmptyState
              icon={Article}
              title={t('news:noNewsArticlesYet')}
              description={t('news:createFirstNews')}
              actionLabel={t('news:createNews')}
              onAction={handleCreateNew}
            />
          }
          stickyHeader
          maxHeight={600}
        />

        {/* Modal Create / Edit */}
        <NewsModal
          open={modalOpen}
          onClose={handleCloseModal}
          newsData={editingNews}
          onSubmit={handleSubmit}
          config={config}
        />

        {/* Delete Confirmation Dialog */}
        <ModalWrapper
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          icon={Warning}
          title={t('news:deleteNewsTitle')}
          subtitle={t('news:deleteNewsSubtitle')}
          maxWidth="xs"
          actions={
            <>
              <Button
                onClick={handleDeleteCancel}
                sx={{
                  borderRadius: 3, 
                  textTransform: 'none', 
                  fontWeight: 600,
                  px: 3, 
                  py: 1.2, 
                  color: '#706f6f',
                  fontFamily: '"Poppins", sans-serif',
                  border: '2px solid #e0e0e0',
                  '&:hover': { 
                    bgcolor: 'rgba(112, 111, 111, 0.05)', 
                    borderColor: '#706f6f' 
                  }
                }}
              >
                {t('news:cancel')}
              </Button>
              <PrimaryButton
                onClick={handleDeleteConfirm}
                sx={{
                  bgcolor: '#d32f2f',
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.25)',
                  '&::before': { bgcolor: '#b71c1c' },
                  '&:hover': { 
                    bgcolor: '#d32f2f', 
                    boxShadow: '0 8px 20px rgba(211, 47, 47, 0.35)' 
                  }
                }}
              >
                {t('news:delete')}
              </PrimaryButton>
            </>
          }
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#706f6f', 
              fontFamily: '"Poppins", sans-serif' 
            }}
          >
            {t('news:deleteNewsConfirm', { title: selectedNews?.title })}
          </Typography>
        </ModalWrapper>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ 
              width: '100%', 
              borderRadius: 3, 
              fontFamily: '"Poppins", sans-serif', 
              boxShadow: `0 8px 24px ${config.colors.primary}26` 
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

NewsTable.propTypes = {
  config: PropTypes.object.isRequired
}

export default NewsTable