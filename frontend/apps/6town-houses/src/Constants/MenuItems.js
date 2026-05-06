import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Newspaper as NewspaperIcon,
  Business as BusinessIcon,
  RequestQuote as RequestQuoteIcon,
  Map as MapIcon,
  Group as GroupIcon
} from "@mui/icons-material"

export const privateMenuItems = [
  {
    textKey: 'navigation:menu.dashboard',
    icon: DashboardIcon,
    path: '/dashboard',
    roles: ['superadmin', 'admin', 'user']
  },
  {
    textKey: 'navigation:menu.properties',
    icon: BusinessIcon,
    path: '/properties',
    roles: ['superadmin', 'admin']
  },
  {
    textKey: 'navigation:menu.building',
    icon: BusinessIcon,
    path: '/buildings',
    roles: ['superadmin', 'admin']
  },
  {
    textKey: 'navigation:menu.lots',
    icon: BusinessIcon,
    path: '/lots',
    roles: ['superadmin', 'admin']
  },
  {
    textKey: 'navigation:menu.payloads',
    icon: BusinessIcon,
    path: '/payloads',
    roles: ['superadmin', 'admin']
  },
  {
    textKey: 'navigation:menu.models',
    icon: BusinessIcon,
    path: '/models',
    roles: ['superadmin', 'admin']
  },
  {
    textKey: 'navigation:menu.news',
    icon: NewspaperIcon,
    path: '/admin/news',
    roles: ['superadmin', 'admin']
  },
  {
    textKey: 'navigation:menu.residents',
    icon: PeopleIcon,
    path: '/residents',
    roles: ['superadmin', 'admin']
  },

  {
    textKey: 'navigation:menu.myProperty',
    path: '/my-property',
    icon: HomeIcon,
    roles: ['superadmin','user', 'admin']
  },
  {
    textKey: 'navigation:menu.masterPlan',
    icon: MapIcon,
    path: '/master-plan',
    roles: ['superadmin', 'admin']
  },
  {
  textKey: 'navigation:menu.familyGroup',
  path: '/family-groups',
  icon: GroupIcon,
  roles: ['user', 'admin', 'superadmin']
},
  {
    textKey: 'navigation:menu.configuration',
    icon: SettingsIcon,
    path: '/configuration',
    roles: ['superadmin', 'admin']
  },
  {
    textKey: 'navigation:menu.news',
    icon: NewspaperIcon,
    path: '/admin/news',
    roles: ['superadmin', 'admin']
  },
  {
    textKey: 'navigation:menu.catalogConfig',
    icon: SettingsIcon,
    path: '/catalog-config',
    roles: ['superadmin', 'admin']
  }
]

export const publicMenuItems = [
  {
    textKey: 'navigation:menu.news',
    icon: NewspaperIcon,
    path: '/explore/news',
    roles: []
  },

]