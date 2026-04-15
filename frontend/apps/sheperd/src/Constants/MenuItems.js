import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Home as HomeIcon,
    Settings as SettingsIcon,
    Newspaper as NewspaperIcon,
    Apartment as ApartmentIcon,
    AccountBalance as AccountBalanceIcon,
    Map as MapIcon,
    MeetingRoom as MeetingRoomIcon,
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
    textKey: 'navigation:menu.building',
    icon: ApartmentIcon,
    path: '/admin/building',
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
    textKey: 'navigation:menu.configuration',
    icon: SettingsIcon,
    path: '/configuration',
    roles: ['superadmin', 'admin']
  },

]

export const publicMenuItems = [
  {
    textKey: 'navigation:menu.news',
    icon: NewspaperIcon,
    path: '/explore/news',
    roles: []
  }
]