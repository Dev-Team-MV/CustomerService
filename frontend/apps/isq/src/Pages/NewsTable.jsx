import React from 'react'
import SharedNewsTable from '@shared/components/News/Newstable'
import { getNewsConfig } from '@shared/config/newsConfig'

const NewsTable = () => {
  const config = getNewsConfig('isq')
  return <SharedNewsTable config={config} />
}

export default NewsTable