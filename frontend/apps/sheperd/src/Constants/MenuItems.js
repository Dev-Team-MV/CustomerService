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
    Group as GroupIcon,
    RequestQuote as RequestQuoteIcon,
    Business as BusinessIcon
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
    textKey: 'navigation:menu.properties',
    icon: BusinessIcon,
    path: '/properties',
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
//   {
//     textKey: 'navigation:menu.getYourQuote',
//     icon: RequestQuoteIcon,
//     path: '/get-your-quote',
//     roles: ['superadmin', 'admin', 'user']
//   }
{
  textKey: 'navigation:menu.masterPlan',
  icon: MapIcon,
  path: '/master-plan',
  roles: ['superadmin', 'admin']
},
{
  textKey: 'navigation:menu.payloads',
  icon: AccountBalanceIcon,
  path: '/payloads',
  roles: ['superadmin', 'admin']
},
{
  textKey: 'navigation:menu.myApartment',
  icon: MeetingRoomIcon,
  path: '/my-apartment',
  roles: ['superadmin', 'admin', 'user']
},
{
  textKey: 'navigation:menu.familyGroup',
  icon: GroupIcon,
  path: '/family-group',
  roles: ['superadmin', 'admin', 'user']
}
]

export const publicMenuItems = [
  {
    textKey: 'navigation:menu.news',
    icon: NewspaperIcon,
    path: '/explore/news',
    roles: []
  }
]