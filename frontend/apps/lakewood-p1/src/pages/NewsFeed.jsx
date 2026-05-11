import NewsFeed from '@shared/components/News/NewsFeed'
import { getNewsConfig } from '@shared/config/newsConfig'

const NewsFeedPage = () => {
  const config = getNewsConfig('lakewood')
  
  return <NewsFeed config={config} />
}

export default NewsFeedPage