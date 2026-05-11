import TermsAndConditionsPage from '@shared/components/TermsAndConditions/TermsAndConditionsPage'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import {
  Description, AccountBalance, Security,
  Gavel, Info
} from '@mui/icons-material'

const TermsAndCondition = () => {
  const theme = useTheme()
  const { t } = useTranslation('termsConditions')

  const sections = [
    {
      id: 'panel1',
      title: t('sections.generalTerms.title'),
      icon: <Description sx={{ color: theme.palette.primary.main }} />,
      color: theme.palette.primary.main,
      content: t('sections.generalTerms.content')
    },
    {
      id: 'panel2',
      title: t('sections.userResponsibilities.title'),
      icon: <AccountBalance sx={{ color: theme.palette.secondary.main }} />,
      color: theme.palette.secondary.main,
      content: t('sections.userResponsibilities.content')
    },
    {
      id: 'panel3',
      title: t('sections.privacyData.title'),
      icon: <Security sx={{ color: theme.palette.warning?.main || '#E5863C' }} />,
      color: theme.palette.warning?.main || '#E5863C',
      content: t('sections.privacyData.content')
    },
    {
      id: 'panel4',
      title: t('sections.paymentTerms.title'),
      icon: <Gavel sx={{ color: theme.palette.info?.main || '#706f6f' }} />,
      color: theme.palette.info?.main || '#706f6f',
      content: t('sections.paymentTerms.content')
    },
    {
      id: 'panel5',
      title: t('sections.intellectualProperty.title'),
      icon: <Info sx={{ color: theme.palette.primary.main }} />,
      color: theme.palette.primary.main,
      content: t('sections.intellectualProperty.content')
    },
    {
      id: 'panel6',
      title: t('sections.liability.title'),
      icon: <Security sx={{ color: theme.palette.secondary.main }} />,
      color: theme.palette.secondary.main,
      content: t('sections.liability.content')
    }
  ]

  const highlights = [
    { label: t('highlights.lastUpdated'), value: t('highlights.lastUpdatedValue'), color: theme.palette.primary.main },
    { label: t('highlights.effectiveDate'), value: t('highlights.effectiveDateValue'), color: theme.palette.secondary.main },
    { label: t('highlights.version'), value: t('highlights.versionValue'), color: theme.palette.warning?.main || '#E5863C' }
  ]

  return (
    <TermsAndConditionsPage
      sections={sections}
      highlights={highlights}
    />
  )
}

export default TermsAndCondition