// import { useState, useEffect } from 'react'
// import { Box, Typography } from '@mui/material'
// import { motion } from 'framer-motion'
// import Sidebar from './Sidebar'
// import { useTranslation } from 'react-i18next'


// /**
//  * PageLayout — wrapper para todas las páginas de mv-crm
//  * @param {string}   title        - Título principal (ej: "All Clients")
//  * @param {string}   titleBold    - Parte en negrita del título (ej: "Clients")
//  * @param {string}   topbarLabel  - Texto del topbar (ej: "All Clients — Cross-project registry")
//  * @param {string}   subtitle     - Subtítulo debajo del título
//  * @param {Array}    sidebarStats - [{ label, value }] para quick stats del sidebar
//  * @param {node}     children     - Contenido de la página
//  */
// export default function PageLayout({
//   title,
//   titleBold,
//   topbarLabel,
//   subtitle,
//   sidebarStats = [],
//   children
// }) {
//       const { t } = useTranslation('common')

//   const [currentTime, setCurrentTime] = useState(new Date())

//   useEffect(() => {
//     const t = setInterval(() => setCurrentTime(new Date()), 1000)
//     return () => clearInterval(t)
//   }, [])

//   const formatTime = (d) => d.toLocaleTimeString('en-US', {
//     hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
//   })

//   return (
//     <Box sx={{ minHeight: '100vh', display: 'flex', background: '#fafafa', position: 'relative', overflow: 'hidden' }}>

//       {/* Grid bg */}
//       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{
//         position: 'absolute', inset: 0, pointerEvents: 'none',
//         backgroundImage: `linear-gradient(rgba(0,0,0,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.022) 1px,transparent 1px)`,
//         backgroundSize: '48px 48px'
//       }} />

//       {/* Sidebar */}
//       <Box sx={{ display: { xs: 'none', md: 'flex' }, zIndex: 10, position: 'relative' }}>
//         <Sidebar stats={sidebarStats} />
//       </Box>

//       {/* Main */}
//       <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', position: 'relative', zIndex: 1 }}>

//         {/* Topbar */}
//         <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
//           <Box sx={{
//             display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//             px: { xs: 3, md: 5 }, py: 2.5,
//             borderBottom: '1px solid #ececec', background: '#fff',
//             position: 'sticky', top: 0, zIndex: 5
//           }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//               <Box sx={{ width: 16, height: 1, bgcolor: '#ccc' }} />
//               <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#aaa', letterSpacing: '2px', textTransform: 'uppercase' }}>
//                 {topbarLabel}
//               </Typography>
//             </Box>
//             <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#bbb', letterSpacing: '2px' }}>
//               {formatTime(currentTime)}
//             </Typography>
//           </Box>
//         </motion.div>

//         {/* Page content */}
//         <Box sx={{ p: { xs: 3, md: 5 }, flex: 1 }}>

//           {/* Title block */}
//           {title && (
//             <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
//               <Box sx={{ mb: 5 }}>
//                 <Typography sx={{
//                   fontFamily: '"Helvetica Neue", Arial, sans-serif',
//                   fontWeight: 200, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
//                   color: '#000', letterSpacing: '-0.04em', lineHeight: 1
//                 }}>
//                   {title}{' '}
//                   {titleBold && (
//                     <Box component="span" sx={{ fontWeight: 700 }}>{titleBold}</Box>
//                   )}
//                 </Typography>
//                 {subtitle && (
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
//                     <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
//                       <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#000' }} />
//                     </motion.div>
//                     <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.62rem', color: '#aaa', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
//                       {subtitle}
//                     </Typography>
//                   </Box>
//                 )}
//                 <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} style={{ transformOrigin: 'left' }}>
//                   <Box sx={{ height: 1, bgcolor: '#ececec', mt: 3 }} />
//                 </motion.div>
//               </Box>
//             </motion.div>
//           )}

//           {children}
//         </Box>

//         {/* Footer */}
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
//           <Box sx={{ px: { xs: 3, md: 5 }, py: 2, borderTop: '1px solid #ececec', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#ccc', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
//               {t('footer.copyright', { year: new Date().getFullYear() })}
//             </Typography>
//             <Box sx={{ display: 'flex', gap: 0.5 }}>
//               {[0, 1, 2].map(i => (
//                 <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}>
//                   <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#ccc' }} />
//                 </motion.div>
//               ))}
//             </Box>
//           </Box>
//         </motion.div>
//       </Box>
//     </Box>
//   )
// }

import { useState, useEffect } from 'react'
import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import { useTranslation } from 'react-i18next'

export default function PageLayout({
  title,
  titleBold,
  topbarLabel,
  subtitle,
  sidebarStats = [],
  children
}) {
  const { t } = useTranslation('common')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (d) => d.toLocaleTimeString('en-US', {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
  })

  return (
    <Box sx={{
      height: '100vh',        // ← fijo, no minHeight
      display: 'flex',
      background: '#fafafa',
      position: 'relative',
      overflow: 'hidden',     // ← el overflow lo maneja el Main
    }}>

      {/* Grid bg */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.022) 1px,transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Sidebar */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, zIndex: 10, position: 'relative', flexShrink: 0 }}>
        <Sidebar stats={sidebarStats} />
      </Box>

      {/* Main — único elemento que hace scroll */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',   // ← no scroll aquí, solo en el content
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Topbar — sticky dentro del Main */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ flexShrink: 0 }}   // ← nunca se encoge
        >
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: { xs: 3, md: 5 }, py: 2.5,
            borderBottom: '1px solid #ececec',
            background: '#fff',
            zIndex: 5,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 16, height: 1, bgcolor: '#ccc' }} />
              <Typography sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.62rem', color: '#aaa',
                letterSpacing: '2px', textTransform: 'uppercase'
              }}>
                {topbarLabel}
              </Typography>
            </Box>
            <Typography sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem', color: '#bbb', letterSpacing: '2px'
            }}>
              {formatTime(currentTime)}
            </Typography>
          </Box>
        </motion.div>

        {/* Scrolleable content */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',    // ← único scroll de la página
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Page content */}
          <Box sx={{ p: { xs: 3, md: 5 }, flex: 1 }}>

            {/* Title block */}
            {title && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box sx={{ mb: 5 }}>
                  <Typography sx={{
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    fontWeight: 200,
                    fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                    color: '#000', letterSpacing: '-0.04em', lineHeight: 1
                  }}>
                    {title}{' '}
                    {titleBold && (
                      <Box component="span" sx={{ fontWeight: 700 }}>{titleBold}</Box>
                    )}
                  </Typography>
                  {subtitle && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#000' }} />
                      </motion.div>
                      <Typography sx={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.62rem', color: '#aaa',
                        letterSpacing: '1.5px', textTransform: 'uppercase'
                      }}>
                        {subtitle}
                      </Typography>
                    </Box>
                  )}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: 'left' }}
                  >
                    <Box sx={{ height: 1, bgcolor: '#ececec', mt: 3 }} />
                  </motion.div>
                </Box>
              </motion.div>
            )}

            {children}
          </Box>

          {/* Footer — al final del scroll */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
            <Box sx={{
              px: { xs: 3, md: 5 }, py: 2,
              borderTop: '1px solid #ececec',
              background: '#fff',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              mt: 'auto',       // ← siempre al fondo del contenido
            }}>
              <Typography sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.6rem', color: '#ccc',
                letterSpacing: '1.5px', textTransform: 'uppercase'
              }}>
                {t('footer.copyright', { year: new Date().getFullYear() })}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}>
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#ccc' }} />
                  </motion.div>
                ))}
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Box>
  )
}