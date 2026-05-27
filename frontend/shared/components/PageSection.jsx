// @shared/components/PageSection.jsx
import { Box, Typography, Divider } from '@mui/material'
import PropTypes from 'prop-types'

/**
 * PageSection — reusable section wrapper matching the editorial design language.
 *
 * Usage:
 *   <PageSection
 *     title="Property"
 *     bold="Map"
 *     description="Optional right-aligned subtitle"
 *     topBorderColor="#004535"
 *     dividerColor="#d6ddc9"
 *     primaryColor="#004535"
 *   >
 *     {children}
 *   </PageSection>
 *
 * Props:
 *   title          – light-weight part of the heading (string)
 *   bold           – bold part of the heading (string)
 *   description    – optional right-aligned description (string or node)
 *   topBorderColor – color of the 1px top border that separates sections
 *   dividerColor   – color of the thin Divider under the header row
 *   primaryColor   – heading text color
 *   headerPy       – vertical padding of the header row (default: 4)
 *   contentPx      – horizontal padding of the content area (default: { xs: 3, md: 6 })
 *   contentPy      – vertical padding of the content area (default: 4)
 *   bgcolor        – background color of the section (default: 'transparent')
 *   mt             – top margin (default: 2)
 *   noHeader       – set true to skip the header row entirely
 *   children       – section content
 */
const PageSection = ({
  title,
  bold,
  description,
  topBorderColor = '#004535',
  dividerColor   = '#d6ddc9',
  primaryColor   = '#004535',
  headerPy       = 4,
  contentPx      = { xs: 3, md: 6 },
  contentPy      = 4,
  bgcolor        = 'transparent',
  mt             = 2,
  noHeader       = false,
  children,
}) => (
  <Box sx={{ bgcolor, borderTop: `1px solid ${topBorderColor}`, mt }}>
    {!noHeader && (
      <>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ py: headerPy, px: { xs: 3, md: 6 } }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 300,
              color: primaryColor,
              fontSize: { xs: '2rem', md: '2.8rem' },
              fontFamily: '"DM Sans", sans-serif',
              lineHeight: 1.1,
            }}
          >
            {title}{' '}
            <Box component="span" sx={{ fontWeight: 800 }}>{bold}</Box>
          </Typography>

          {description && (
            typeof description === 'string' ? (
              <Typography
                variant="body2"
                sx={{
                  color: '#706f6f',
                  maxWidth: 280,
                  textAlign: 'right',
                  lineHeight: 1.7,
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.85rem',
                  mt: 0.5,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {description}
              </Typography>
            ) : description
          )}
        </Box>

        <Divider sx={{ borderColor: dividerColor, mx: { xs: 3, md: 6 } }} />
      </>
    )}

    <Box sx={{ px: contentPx, py: contentPy }}>
      {children}
    </Box>
  </Box>
)

PageSection.propTypes = {
  title:          PropTypes.string,
  bold:           PropTypes.string,
  description:    PropTypes.node,
  topBorderColor: PropTypes.string,
  dividerColor:   PropTypes.string,
  primaryColor:   PropTypes.string,
  headerPy:       PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  contentPx:      PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  contentPy:      PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  bgcolor:        PropTypes.string,
  mt:             PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  noHeader:       PropTypes.bool,
  children:       PropTypes.node,
}

export default PageSection
