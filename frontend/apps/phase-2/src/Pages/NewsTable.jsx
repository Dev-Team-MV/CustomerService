// @apps/phase-2/src/Pages/NewsTable.jsx
import React from 'react'
import SharedNewsTable from '@shared/components/News/NewsTable'
import { getNewsConfig } from '@shared/config/newsConfig'

const NewsTable = () => {
  const config = getNewsConfig('phase2')
  
  return <SharedNewsTable config={config} />
}

export default NewsTable