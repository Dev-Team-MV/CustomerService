import {
  Dashboard as DashboardIcon,
  HomeWork as HomeWorkIcon,
  Landscape as LandscapeIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Article as ArticleIcon,
  Deck as DeckIcon,
  Explore as ExploreIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
  Villa as VillaIcon,
  Map as MapIcon,
  Groups as GroupsIcon,
  Pool as PoolIcon,
  GridOn as GridOnIcon,
  AccountBalance as AccountBalanceIcon,
    MeetingRoom as MeetingRoomIcon,
    Apartment as ApartmentIcon,
} from "@mui/icons-material"
// Menú privado (usuarios autenticados)
export const privateMenuItems = [
  {
    textKey: "navigation:menu.dashboard",
    icon: DashboardIcon,
    path: "/dashboard",
    roles: ["superadmin", "projectAdmin", "employee"],
  },
    {
    textKey: "navigation:menu.properties",
    icon: HomeIcon,
    path: "/properties",
    roles: ["superadmin", "admin"],
  },
    {
      textKey: "navigation:menu.myapartment",
      icon: MeetingRoomIcon,
      path: "/my-apartment",
      roles: ["superadmin", "admin", "user"],
    },
    {
      textKey: "navigation:menu.buildings",
      icon: ApartmentIcon,
      path: "/buildings",
      roles: ["superadmin", "admin"],
    },
    {
      textKey: "navigation:menu.payloads",
      icon: AccountBalanceIcon,
      path: "/payloads",
      roles: ["superadmin", "admin"],
    },
  {
    textKey: "navigation:menu.residents",
    icon: PeopleIcon,
    path: "/residents",
    roles: ["superadmin", "admin", "owner"],
  },
    {
      textKey: "navigation:menu.news",
      icon: ArticleIcon,
      path: "/admin/news",
      roles: ["superadmin", "admin", "owner"],
    },
      {
        textKey: "navigation:menu.configuration",
        icon: SettingsIcon,
        path: "/configurations",
        roles: ["superadmin", "admin", "owner"],
      },
  {
    textKey: "navigation:menu.masterPlan",
    icon: MapIcon,
    path: "/master-plan",
    roles: ["superadmin", "admin"],
  },
]

// Menú público (sin autenticación)
export const publicMenuItems = [
  { textKey: "navigation:menu.home", icon: HomeIcon, path: "/" },
  { textKey: "navigation:menu.news", icon: ArticleIcon, path: "/explore/news" },
]