import React from 'react'
import SharedNewsDetails from '@shared/components/News/NewsDetails'
import { getNewsConfig } from '@shared/config/newsConfig'

const NewsDetails = () => {
  const config = getNewsConfig('sheperd')
  return <SharedNewsDetails config={config} />
}

export default NewsDetails