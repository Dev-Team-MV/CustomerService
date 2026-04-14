import BuildingsPage from '@shared/components/Buildings/BuildingsPage'
import { getBuildingColumns } from '../Constants/Columns/buildings'

const Buildings = () => <BuildingsPage projectSlug="lakewood-f2" getColumns={getBuildingColumns} detailRoute="/buildings" />

export default Buildings