import { MasterPlanPage } from '@shared/components/MasterPlan'

const MasterPlanPageWrapper = () => {
  const projectId = import.meta.env.VITE_PROJECT_ID
  return <MasterPlanPage projectId={projectId} />
}

export default MasterPlanPageWrapper