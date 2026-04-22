import { MyResource } from '@shared/components/Resource/MyResource'
import { resourceConfigs, RESOURCE_TYPES } from '@shared/config/resourceConfig'

const MyApartment = () => {
  return (
    <MyResource
      resourceConfig={resourceConfigs.apartment}
      resourceType={RESOURCE_TYPES.APARTMENT}
    />
  )
}

export default MyApartment