import React from 'react'
import SharedNewsFeed from '@shared/components/News/NewsFeed'
import { getNewsConfig } from '@shared/config/newsConfig'

const NewsFeed = () => {
  const config = getNewsConfig('6town-houses')
  return <SharedNewsFeed config={config} />
}

export default NewsFeed