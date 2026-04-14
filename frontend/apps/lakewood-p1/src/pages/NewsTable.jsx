// import { useMemo }        from 'react'
// import { useTranslation } from 'react-i18next'
// import {
//   Box, Container, Typography,
//   Button, Alert, Snackbar
// } from '@mui/material'
// import {
//   Add, Article, Newspaper,
//   Schedule, CheckCircle, Announcement, Warning
// } from '@mui/icons-material'

// import PageHeader    from '@shared/components/PageHeader'
// import StatsCards    from '../components/statscard'
// import DataTable from '@shared/components/table/DataTable';
// import EmptyState from '@shared/components/table/EmptyState';
// import NewsModal     from '../components/news/NewsModal'
// import ModalWrapper  from '@shared/constants/ModalWrapper'
// import PrimaryButton from '@shared/constants/PrimaryButton'

// import { useNews }        from '../hooks/useNews'
// import { useNewsColumns } from '../constants/Columns/news'

// const NewsTable = () => {
//   const { t } = useTranslation(['news', 'common'])

//   // ── Hook con toda la lógica ───────────────────────────────
//   const {
//     news, stats, loading,
//     modalOpen, editingNews,
//     handleCreateNew, handleEdit, handleCloseModal, handleSubmit,
//     handleView,
//     deleteDialogOpen, selectedNews,
//     handleDeleteClick, handleDeleteCancel, handleDeleteConfirm,
//     snackbar, handleCloseSnackbar,
//   } = useNews()

//   // ── Columns ───────────────────────────────────────────────
//   const columns = useNewsColumns({
//     t,
//     onView:   handleView,
//     onEdit:   handleEdit,
//     onDelete: handleDeleteClick,
//   })

//   // ── Stats cards ───────────────────────────────────────────
//   const newsStats = useMemo(() => [
//     { title: t('news:totalArticles'), value: stats.total,        icon: Article,      gradient: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)', color: '#333F1F', delay: 0   },
//     { title: t('news:published'),     value: stats.published,    icon: CheckCircle,  gradient: 'linear-gradient(135deg, #8CA551 0%, #a8bf6f 100%)', color: '#8CA551', delay: 0.1 },
//     { title: t('news:drafts'),        value: stats.draft,        icon: Schedule,     gradient: 'linear-gradient(135deg, #E5863C 0%, #f59c5a 100%)', color: '#E5863C', delay: 0.2 },
//     { title: t('news:construction'),  value: stats.construction, icon: Announcement, gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: '#1976d2', delay: 0.3 },
//   ], [stats, t])

//   // ── Render ────────────────────────────────────────────────
//   return (
//     <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)', p: { xs: 2, sm: 3 } }}>
//       <Container maxWidth="xl">

//         <PageHeader
//           icon={Newspaper}
//           title={t('news:newsAndUpdates')}
//           subtitle={t('news:manageUpdates')}
//           actionButton={{
//             label:   t('news:createNews'),
//             onClick: handleCreateNew,
//             icon:    <Add />,
//             tooltip: t('news:createNews')
//           }}
//         />

//         <StatsCards stats={newsStats} loading={loading} />

//         <DataTable
//           columns={columns}
//           data={news}
//           loading={loading}
//           emptyState={
//             <EmptyState
//               icon={Article}
//               title={t('news:noNewsArticlesYet')}
//               description={t('news:createFirstNews')}
//               actionLabel={t('news:createNews')}
//               onAction={handleCreateNew}
//             />
//           }
//           onRowClick={(row) => handleView(row)}
//           stickyHeader
//           maxHeight={600}
//         />

//         {/* Modal Crear / Editar */}
//         <NewsModal
//           open={modalOpen}
//           onClose={handleCloseModal}
//           newsData={editingNews}
//           onSubmit={handleSubmit}
//         />

//         {/* Dialog Confirmar Eliminación */}
//         <ModalWrapper
//           open={deleteDialogOpen}
//           onClose={handleDeleteCancel}
//           icon={Warning}
//           title={t('news:deleteNewsTitle')}
//           subtitle={t('news:deleteNewsSubtitle')}
//           maxWidth="xs"
//           actions={
//             <>
//               <Button
//                 onClick={handleDeleteCancel}
//                 sx={{
//                   borderRadius: 3, textTransform: 'none', fontWeight: 600,
//                   px: 3, py: 1.2, color: '#706f6f',
//                   fontFamily: '"Poppins", sans-serif',
//                   border: '2px solid #e0e0e0',
//                   '&:hover': { bgcolor: 'rgba(112, 111, 111, 0.05)', borderColor: '#706f6f' }
//                 }}
//               >
//                 {t('news:cancel')}
//               </Button>
//               <PrimaryButton
//                 onClick={handleDeleteConfirm}
//                 sx={{
//                   bgcolor: '#d32f2f',
//                   boxShadow: '0 4px 12px rgba(211, 47, 47, 0.25)',
//                   '&::before': { bgcolor: '#b71c1c' },
//                   '&:hover': { bgcolor: '#d32f2f', boxShadow: '0 8px 20px rgba(211, 47, 47, 0.35)' }
//                 }}
//               >
//                 {t('news:delete')}
//               </PrimaryButton>
//             </>
//           }
//         >
//           <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
//             {t('news:deleteNewsConfirm', { title: selectedNews?.title })}
//           </Typography>
//         </ModalWrapper>

//         {/* Snackbar */}
//         <Snackbar
//           open={snackbar.open}
//           autoHideDuration={4000}
//           onClose={handleCloseSnackbar}
//           anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//         >
//           <Alert
//             onClose={handleCloseSnackbar}
//             severity={snackbar.severity}
//             sx={{ width: '100%', borderRadius: 3, fontFamily: '"Poppins", sans-serif', boxShadow: '0 8px 24px rgba(51, 63, 31, 0.15)' }}
//           >
//             {snackbar.message}
//           </Alert>
//         </Snackbar>

//       </Container>
//     </Box>
//   )
// }

// export default NewsTable
// @apps/lakewood-p1/src/pages/NewsTable.jsx
import React from 'react'
import SharedNewsTable from '@shared/components/News/NewsTable'
import { getNewsConfig } from '@shared/config/newsConfig'

const NewsTable = () => {
  const config = getNewsConfig('lakewood')
  
  return <SharedNewsTable config={config} />
}

export default NewsTable