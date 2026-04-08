// @shared/config/newsConfig.js

// ── PROJECT IDS ────────────────────────────────────────────────
// TODO: Replace with actual project IDs from your database
export const PROJECT_IDS = {
  LAKEWOOD: '69a73ce5b20401b061da6451',
  PHASE2: '69b9b2188186434073c6b13d',
  ISQ: '69d3b025b5ad6754488df957' // <-- Reemplaza por el real
}

// ── NEWS CONFIGURATIONS ────────────────────────────────────────
export const newsConfigs = {
  lakewood: {
    projectId: PROJECT_IDS.LAKEWOOD,
    projectName: 'Lakewood',
    slug: 'lakewood',
    colors: {
      primary: '#333F1F',
      secondary: '#8CA551',
      accent: '#E5863C',
      border: '#e8f5ee',
      gradient: 'linear-gradient(90deg, #333F1F, #8CA551, #333F1F)'
    },
    i18n: {
      namespace: 'news'
    },
    categories: [
      { value: 'all', label: 'All News', icon: '📰' },
      { value: 'construction', label: 'Construction', icon: '🏗️', color: '#E5863C' },
      { value: 'announcement', label: 'Announcements', icon: '📢', color: '#8CA551' },
      { value: 'report', label: 'Reports', icon: '📊', color: '#333F1F' },
      { value: 'event', label: 'Events', icon: '🎉', color: '#8CA551' }
    ]
  },

  phase2: {
    projectId: PROJECT_IDS.PHASE2,
    projectName: 'Phase 2',
    slug: 'phase2',
    colors: {
      primary: '#1a237e',
      secondary: '#43a047',
      accent: '#ff6f00',
      border: '#e3f2fd',
      gradient: 'linear-gradient(90deg, #1a237e, #43a047, #1a237e)'
    },
    i18n: {
      namespace: 'news'
    },
    categories: [
      { value: 'all', label: 'All News', icon: '📰' },
      { value: 'construction', label: 'Construction', icon: '🏗️', color: '#ff6f00' },
      { value: 'announcement', label: 'Announcements', icon: '📢', color: '#43a047' },
      { value: 'report', label: 'Reports', icon: '📊', color: '#1a237e' },
      { value: 'event', label: 'Events', icon: '🎉', color: '#43a047' }
    ]
  },

  isq: {
    projectId: PROJECT_IDS.ISQ,
    projectName: 'ISQ',
    slug: 'isq',
    colors: {
      primary: '#7c3aed',
      secondary: '#a78bfa',
      accent: '#E5863C',
      border: '#e8eaf6',
      gradient: 'linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed)'
    },
    i18n: {
      namespace: 'news'
    },
    categories: [
      { value: 'all', label: 'All News', icon: '📰' },
      { value: 'construction', label: 'Construction', icon: '🏗️', color: '#E5863C' },
      { value: 'announcement', label: 'Announcements', icon: '📢', color: '#a78bfa' },
      { value: 'report', label: 'Reports', icon: '📊', color: '#7c3aed' },
      { value: 'event', label: 'Events', icon: '🎉', color: '#a78bfa' }
    ]
  }
}

// ── HELPER FUNCTIONS ───────────────────────────────────────────
export const getNewsConfig = (projectSlug) => {
  return newsConfigs[projectSlug] || newsConfigs.lakewood
}

export const getCategoryColor = (category, config) => {
  const categoryConfig = config.categories.find(cat => cat.value === category)
  return categoryConfig?.color || config.colors.primary
}

// ── BLOCK TYPES ────────────────────────────────────────────────
export const BLOCK_TYPES = {
  HEADING: 'heading',
  PARAGRAPH: 'paragraph',
  LIST: 'list',
  QUOTE: 'quote'
}

export const createBlock = (type) => ({
  id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type,
  ...(type === BLOCK_TYPES.HEADING && { level: 2, text: '' }),
  ...(type === BLOCK_TYPES.PARAGRAPH && { text: '' }),
  ...(type === BLOCK_TYPES.LIST && { items: [''], ordered: false }),
  ...(type === BLOCK_TYPES.QUOTE && { text: '', author: '' })
})

// ── EMPTY FORM ─────────────────────────────────────────────────
export const EMPTY_NEWS_FORM = {
  title: '',
  description: '',
  category: 'announcement',
  status: 'draft',
  heroImage: null,
  tags: [],
  projectId: null
}