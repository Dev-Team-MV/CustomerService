// @shared/hooks/useNewsFeed.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import newsService from '../services/newsService'
import { newsConfigs } from '../config/newsConfig'

// ─────────────────────────────────────────────────────────────
// useNewsFeed — Public feed with project tabs and filters
// ─────────────────────────────────────────────────────────────
export const useNewsFeed = () => {
  const { t } = useTranslation(['news', 'common'])
  
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProject, setSelectedProject] = useState('all') // 'all', 'lakewood', 'phase2'

  // ── Fetch published news ──────────────────────────────────
  const fetchPublishedNews = useCallback(async () => {
    try {
      setLoading(true)
      const data = await newsService.getPublishedNews()
      setNews(data)
    } catch (error) {
      console.error('❌ Error loading news:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPublishedNews()
  }, [fetchPublishedNews])

  // ── Filter news ───────────────────────────────────────────
  const filteredNews = useMemo(() => {
    return news.filter(newsItem => {
      // Search filter
      const matchesSearch = 
        newsItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        newsItem.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Category filter
      const matchesCategory = 
        selectedCategory === 'all' || newsItem.category === selectedCategory
      
      // Project filter
      const matchesProject = 
        selectedProject === 'all' || 
        newsItem.projectId === newsConfigs[selectedProject]?.projectId
      
      return matchesSearch && matchesCategory && matchesProject
    })
  }, [news, searchTerm, selectedCategory, selectedProject])

  // ── Project tabs ──────────────────────────────────────────
  const projectTabs = useMemo(() => [
    { value: 'all', label: t('news:allProjects', 'All Projects'), count: news.length },
    { 
      value: 'lakewood', 
      label: newsConfigs.lakewood.projectName,
      count: news.filter(n => n.projectId === newsConfigs.lakewood.projectId).length
    },
    { 
      value: 'phase2', 
      label: newsConfigs.phase2.projectName,
      count: news.filter(n => n.projectId === newsConfigs.phase2.projectId).length
    },
    {
      value: 'isq',
      label: newsConfigs.isq.projectName,
      count: news.filter(n => n.projectId === newsConfigs.isq.projectId).length
    }
  ], [news, t])

  // ── Featured and regular news ─────────────────────────────
  const featuredNews = filteredNews[0]
  const regularNews = filteredNews.slice(1)

  return {
    news: filteredNews,
    featuredNews,
    regularNews,
    loading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedProject,
    setSelectedProject,
    projectTabs
  }
}