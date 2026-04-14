// @apps/phase-2/src/Pages/NewsDetails.jsx
import React from 'react'
import SharedNewsDetails from '@shared/components/News/NewsDetails'
import { getNewsConfig } from '@shared/config/newsConfig'

const NewsDetails = () => {
  const config = getNewsConfig('phase2')
  
  return <SharedNewsDetails config={config} />
}

export default NewsDetails