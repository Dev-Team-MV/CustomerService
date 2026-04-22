// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Pages/Admin/CatalogConfig.jsx

import CatalogConfigPage from '@shared/components/CatalogConfig'
import SixTownConfigEditor from '../Components/editorComponent'

const CatalogConfig = () => {
  const projectId = import.meta.env.VITE_PROJECT_ID

  return (
    <CatalogConfigPage
      projectId={projectId}
      projectSlug="6town-houses"
      EditorComponent={SixTownConfigEditor}
    />
  )
}

export default CatalogConfig