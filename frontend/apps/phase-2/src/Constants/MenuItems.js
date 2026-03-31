import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  BarChart as BarChartIcon,
    Settings as Settings,
  Newspaper as NewspaperIcon,
} from "@mui/icons-material"

export const privateMenuItems = [
  {
    textKey: "navigation:menu.dashboard",
    icon: DashboardIcon,
    path: "/dashboard",
    roles: ["superadmin", "admin", "user"],
  },
  {
    textKey: "navigation:menu.buildings",
    icon: HomeIcon,
    path: "/buildings",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.properties",
    icon: HomeIcon,
    path: "/properties",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.news",
    icon: NewspaperIcon,
    path: "/admin/news",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.payloads",
    icon: HomeIcon,
    path: "/payloads",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.amenities",
    icon: HomeIcon,
    path: "/amenities",
    roles: ["superadmin", "admin", "user"],
  },
  {
    textKey: "navigation:menu.agora",
    icon: HomeIcon,
    path: "/agora",
    roles: ["superadmin", "admin", "user"],
  },
  {
    textKey: "navigation:menu.residents",
    icon: PeopleIcon,
    path: "/residents",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.masterPlan",
    icon: PeopleIcon,
    path: "/master-plan",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.myapartment",
    icon: PeopleIcon,
    path: "/my-apartment",
    roles: ["superadmin", "admin", "user"],
  },
  {
    textKey: "navigation:menu.familyGroup",
    icon: PeopleIcon,
    path: "/family-group",
    roles: ["superadmin", "admin", "user"],
  },
  {
    textKey: "navigation:menu.analytics",
    icon: BarChartIcon,
    path: "/analytics",
    roles: ["superadmin", "admin"],
  },
  {
    textKey: "navigation:menu.configuration",
    icon: Settings,
    path: "/configuration",
    roles: ["superadmin", "admin"],
  },
  
]

export const publicMenuItems = [
  { textKey: "navigation:menu.home", icon: HomeIcon, path: "/" },
  { textKey: "navigation:menu.news", icon: NewspaperIcon, path: "/explore/news" },
  { textKey: "navigation:menu.amenities", icon: HomeIcon, path: "/explore/amenities" }
]