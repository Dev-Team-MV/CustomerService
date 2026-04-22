import React from 'react'
import SharedNewsTable from '@shared/components/News/NewsTable'
import { getNewsConfig } from '@shared/config/newsConfig'

const NewsTable = () => {
  const config = getNewsConfig('sheperd')
  return <SharedNewsTable config={config} />
}

export default NewsTable