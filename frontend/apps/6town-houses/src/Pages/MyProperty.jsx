// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Pages/MyProperty.jsx

import { MyResource } from '@shared/components/Resource/MyResource'
import { resourceConfigs, RESOURCE_TYPES } from '@shared/config/resourceConfig'

const MyProperty = () => {
  return (
    <MyResource
      resourceConfig={resourceConfigs.property}
      resourceType={RESOURCE_TYPES.PROPERTY}
      namespace="myProperty"
    />
  )
}

export default MyProperty