// @apps/phase-2/src/Pages/NewsFeed.jsx
import React from 'react'
import SharedNewsFeed from '@shared/components/News/NewsFeed'
import { getNewsConfig } from '@shared/config/newsConfig'

const NewsFeed = () => {
  const config = getNewsConfig('phase2')
  
  return <SharedNewsFeed config={config} />
}

export default NewsFeed